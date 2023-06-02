import {
  CloudFrontWebDistribution,
  CloudFrontWebDistributionProps,
  OriginAccessIdentity,
  SSLMethod,
  SecurityPolicyProtocol,
  ViewerCertificate,
} from "@aws-cdk/aws-cloudfront";
import { BucketEncryption } from "@aws-cdk/aws-s3";
import { BucketDeployment, Source } from "@aws-cdk/aws-s3-deployment";
import { RemovalPolicy } from "@aws-cdk/core";
import { Construct } from "@aws-cdk/core";
import {
  ARecord,
  AaaaRecord,
  RecordTarget,
  HostedZone,
} from "@aws-cdk/aws-route53";
import { CloudFrontTarget } from "@aws-cdk/aws-route53-targets";
import { StaticWebsiteBucket } from "./static-website-bucket";
import { Certificate } from "@aws-cdk/aws-certificatemanager";

const WEBSITE_INDEX_DOCUMENT = "index.html";

export interface StaticWebsiteProps {
  domainName?: string;
  domainCertificateArn?: string;
  sourcePath: string;
}

export class StaticWebsite extends Construct {
  private readonly originAccessId: OriginAccessIdentity;
  readonly bucket: StaticWebsiteBucket;
  readonly distribution: CloudFrontWebDistribution;

  constructor(parent: Construct, name: string, props: StaticWebsiteProps) {
    super(parent, name);
    const { domainName, domainCertificateArn, sourcePath } = props;

    // Origin Access Identity to restrict access to the website bucket
    this.originAccessId = new OriginAccessIdentity(
      this,
      "OriginAccessIdentity"
    );

    // S3 static website bucket
    this.bucket = new StaticWebsiteBucket(this, "StaticWebsiteBucket", {
      websiteIndexDocument: WEBSITE_INDEX_DOCUMENT,
      websiteErrorDocument: WEBSITE_INDEX_DOCUMENT,
      publicReadAccess: false,
      removalPolicy: RemovalPolicy.RETAIN,
      encryption: BucketEncryption.S3_MANAGED,
      originAccessId: this.originAccessId,
    });

    // Props for the CloudFront distribution
    let distributionProps: CloudFrontWebDistributionProps = {
      originConfigs: [
        {
          s3OriginSource: {
            originAccessIdentity: this.originAccessId,
            s3BucketSource: this.bucket,
          },
          behaviors: [{ isDefaultBehavior: true }],
        },
      ],
      errorConfigurations: [
        // Return index html file for the 404 response from S3 to let frontend handle routing
        {
          errorCode: 404,
          responseCode: 200,
          responsePagePath: `/${WEBSITE_INDEX_DOCUMENT}`,
        },
      ],
    };

    if (domainName && domainCertificateArn) {
      distributionProps = {
        ...distributionProps,
        viewerCertificate: ViewerCertificate.fromAcmCertificate(
          Certificate.fromCertificateArn(
            this,
            "Certificate",
            domainCertificateArn
          ),
          {
            aliases: [domainName],
            sslMethod: SSLMethod.SNI,
            securityPolicy: SecurityPolicyProtocol.TLS_V1_2_2019,
          }
        ),
      };
    } else if (domainName || domainCertificateArn) {
      throw Error("Either domain name or cerificate arn is empty");
    }

    // CloudFront distribution that caches and serves website bucket content with custom domain
    this.distribution = new CloudFrontWebDistribution(
      this,
      "CloudFrontWebDistribution",
      distributionProps
    );

    if (domainName && domainCertificateArn) {
      // Hosted Zone for the website custom domain
      const hostedZone = HostedZone.fromLookup(this, "HostedZone", {
        domainName,
      });

      // Route53 A record for the CloudFront distribution
      new ARecord(this, "ARecord", {
        recordName: domainName,
        target: RecordTarget.fromAlias(new CloudFrontTarget(this.distribution)),
        zone: hostedZone,
      });

      // Route53 AAA record for the CloudFront distribution
      new AaaaRecord(this, "AAAARecord", {
        recordName: domainName,
        target: RecordTarget.fromAlias(new CloudFrontTarget(this.distribution)),
        zone: hostedZone,
      });
    }

    // Upload local website content to S3 bucket
    new BucketDeployment(this, "BucketDeployment", {
      sources: [Source.asset(sourcePath)],
      destinationBucket: this.bucket,
      distribution: this.distribution,
      distributionPaths: ["/*"],
    });
  }
}
