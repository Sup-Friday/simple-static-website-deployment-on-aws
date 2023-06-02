import { Construct } from "@aws-cdk/core";
import { Bucket, BucketProps } from "@aws-cdk/aws-s3";
import { Effect, PolicyStatement } from "@aws-cdk/aws-iam";
import { OriginAccessIdentity } from "@aws-cdk/aws-cloudfront";

export interface StaticWebsiteBucketProps extends BucketProps {
  originAccessId?: OriginAccessIdentity;
}

export class StaticWebsiteBucket extends Bucket {
  private readonly originAccessId: OriginAccessIdentity | undefined;

  constructor(
    parent: Construct,
    name: string,
    props: StaticWebsiteBucketProps
  ) {
    super(parent, name, props);

    this.originAccessId = props.originAccessId;
    this.addBucketPolicy();
  }

  private addBucketPolicy = () => {
    // Bucket policy that complies with s3-bucket-ssl-requests-only rule
    // Reference: https://aws.amazon.com/premiumsupport/knowledge-center/s3-bucket-policy-for-config-rule/
    const denyPolicy = new PolicyStatement({
      effect: Effect.DENY,
      actions: ["s3:*"],
      resources: [this.bucketArn, `${this.bucketArn}/*`],
      conditions: {
        Bool: {
          "aws:SecureTransport": "false",
        },
      },
    });
    denyPolicy.addAnyPrincipal();
    this.addToResourcePolicy(denyPolicy);

    // Bucket policy to give CloudFront permission to read from website bucket
    const allowPolicy = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["s3:GetObject*", "s3:GetBucket*", "s3:List*"],
      resources: [this.bucketArn, `${this.bucketArn}/*`],
    });

    if (this.originAccessId) {
      allowPolicy.addCanonicalUserPrincipal(
        this.originAccessId.cloudFrontOriginAccessIdentityS3CanonicalUserId
      );
    } else {
      allowPolicy.addAnyPrincipal();
    }

    this.addToResourcePolicy(allowPolicy);
  };
}
