import path from "path";
import { App } from "@aws-cdk/core";
import { StaticWebsiteStack } from "../src/stacks/static-website";
import { getEnvVariables } from "../src/utils/get-env-variables";

const envVars = getEnvVariables();
const camelCasedStage = envVars.stage[0].toUpperCase() + envVars.stage.slice(1);
const staticWebsiteStackName = `Planner-StaticWebsite-${camelCasedStage}`;
const staticWebsiteAbsoluteSourcePath = path.resolve(
  process.cwd(),
  envVars.staticWebsiteSourcePath
);

const app = new App();

if (
  envVars.stage &&
  envVars.account &&
  envVars.region &&
  envVars.staticWebsiteSourcePath &&
  envVars.staticWebsiteDomainName &&
  envVars.staticWebsiteDomainCertificateARN
) {
  console.info(
    "Deploying static website with config",
    {
      staticWebsiteStackName,
      account: envVars.account,
      region: envVars.region,
      domainName: envVars.staticWebsiteDomainName,
      domainCertificateArn: envVars.staticWebsiteDomainCertificateARN,
      sourcePath: staticWebsiteAbsoluteSourcePath,
    },
    "\n"
  );

  new StaticWebsiteStack(app, staticWebsiteStackName, {
    domainName: envVars.staticWebsiteDomainName,
    domainCertificateArn: envVars.staticWebsiteDomainCertificateARN,
    sourcePath: staticWebsiteAbsoluteSourcePath,
    env: {
      account: envVars.account,
      region: envVars.region,
    },
  });
} else {
  console.error(
    `Missing required environment variables to deploy ${staticWebsiteStackName}`
  );
}
