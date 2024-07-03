import { SlackApp } from "slack-edge";

const isdev = process.env.NODE_ENV === "development";

const PBapp = new SlackApp({
  env: {
    SLACK_BOT_TOKEN: process.env.PB_SLACK_BOT_TOKEN!,
    SLACK_APP_TOKEN: process.env.PB_SLACK_APP_TOKEN!,
    SLACK_SIGNING_SECRET: process.env.PB_SLACK_SIGNING_SECRET!,
    SLACK_LOGGING_LEVEL: isdev ? "DEBUG" : "INFO",
  },
});

export { PBapp };
