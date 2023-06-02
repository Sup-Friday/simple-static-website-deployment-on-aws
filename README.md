## Introduction

This repository is for developers to easily create and deploy a static website on AWS S3, CloudFront, and Route53.

## Prerequisites

1. Follow [AWS CLI tutorial](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) to install and configure AWS CLI.
1. Follow the `Prerequisites`, `Authentication with AWS`, and `Install the AWS CDK` sections of [AWS CDK tutorial](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html) to install and configure AWS CDK.
1. Follow the instructions in `.env.example` to create an `.env.alpha` (for your alpha environment) or `.env` (for your production environment) file at the root level of the project directory.

## Deployment

To deploy your alpha environment, simply run

```
yarn deploy-web:alpha
```

To deploy your production environment, simply run

```
yarn deploy-web:prod
```
