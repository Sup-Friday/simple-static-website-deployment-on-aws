import dotenv from "dotenv";
import path from "path";
import { env } from "process";

export enum Env {
  Production = "prod",
  Alpha = "alpha",
}

export const getEnvVariables = () => {
  const envFile =
    env.NODE_ENV === Env.Production ? ".env" : `.env.${env.NODE_ENV}`;

  console.info(`Parsing environment variables from ${envFile}\n`);
  dotenv.config({ path: path.resolve(process.cwd(), envFile) });

  const envVariables = {
    stage: env.NODE_ENV ?? "",
    account: env.AWS_ACCOUNT ?? "",
    region: env.AWS_REGION,
    staticWebsiteDomainName: env.DOMAIN_NAME ?? "",
    staticWebsiteDomainCertificateARN: env.DOMAIN_CERT_ARN ?? "",
    staticWebsiteSourcePath: env.STATIC_WEBSITE_SOURCE_PATH ?? "",
  };

  return envVariables;
};

export default getEnvVariables;
