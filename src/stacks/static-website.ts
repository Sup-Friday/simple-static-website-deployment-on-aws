import { App, Stack, StackProps } from "@aws-cdk/core";
import {
  StaticWebsite,
  StaticWebsiteProps,
} from "../constructs/static-website";

export interface StaticWebsiteStackProps
  extends StackProps,
    StaticWebsiteProps {}

export class StaticWebsiteStack extends Stack {
  constructor(parent: App, name: string, props: StaticWebsiteStackProps) {
    super(parent, name, props);

    if (!props.sourcePath) {
      throw Error("The path of the static website source code is empty");
    }

    new StaticWebsite(this, "StaticWebsite", props);
  }
}
