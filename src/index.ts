import { SlackAPIClient, SlackApp } from "slack-edge";

import { mirror } from "./functions/mirror";

const isdev = process.env.NODE_ENV === "development";
const version = require("../package.json").version;

console.log(
  "----------------------------------\nMagic Mirror Server\n----------------------------------\n"
);
console.log("🏗️  Starting Magic Mirror...");
console.log("📦 Loading Slack App...");
console.log("🔑 Loading environment variables...");

const PBapp = new SlackApp({
  env: {
    SLACK_BOT_TOKEN: process.env.PB_SLACK_BOT_TOKEN!,
    SLACK_APP_TOKEN: process.env.PB_SLACK_APP_TOKEN!,
    SLACK_SIGNING_SECRET: process.env.PB_SLACK_SIGNING_SECRET!,
    SLACK_LOGGING_LEVEL: isdev ? "DEBUG" : "INFO",
  },
});

const HCapp = new SlackApp({
  env: {
    SLACK_BOT_TOKEN: process.env.HC_SLACK_BOT_TOKEN!,
    SLACK_APP_TOKEN: process.env.HC_SLACK_APP_TOKEN!,
    SLACK_SIGNING_SECRET: process.env.HC_SLACK_SIGNING_SECRET!,
    SLACK_LOGGING_LEVEL: isdev ? "DEBUG" : "INFO",
  },
});

const PBclient: SlackAPIClient = PBapp.client;
const HCclient: SlackAPIClient = HCapp.client;

HCapp.anyMessage(async ({ payload, context }) => {
  await mirror(PBclient, HCclient, payload);
});

console.log(
  "🚀 Server Started in",
  Bun.nanoseconds() / 1000000,
  "milliseconds on version:",
  version + "!",
  "\n\n----------------------------------\n"
);

export { HCapp, HCclient, PBapp, PBclient };

export default {
  port: 3000,
  async fetch(request: Request) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === "/health") {
      return new Response("OK");
    } else if (path === "/ping") {
      return new Response("pong");
    } else if (path === "/up") {
      return new Response("up");
    } else if (path === "/pb") {
      return await PBapp.run(request);
    } else if (path === "/hc") {
      return await HCapp.run(request);
    }
    return new Response("Not Found");
  },
};
