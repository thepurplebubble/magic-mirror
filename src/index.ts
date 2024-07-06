import { PrismaClient } from "@prisma/client";
import { SlackAPIClient, SlackApp } from "slack-edge";

import { mirror } from "./functions/mirror";

const wantDebug = process.env.DEBUG === "true";
wantDebug;
const version = require("../package.json").version;

console.log(
  "----------------------------------\nMagic Mirror Server\n----------------------------------\n"
);
console.log("🏗️  Starting Magic Mirror...");
console.log("📦 Loading Slack App...");
console.log("🔑 Loading environment variables...");

const prisma = new PrismaClient();

const PBapp = new SlackApp({
  env: {
    SLACK_BOT_TOKEN: process.env.PB_SLACK_BOT_TOKEN!,
    SLACK_APP_TOKEN: process.env.PB_SLACK_APP_TOKEN!,
    SLACK_SIGNING_SECRET: process.env.PB_SLACK_SIGNING_SECRET!,
    SLACK_LOGGING_LEVEL: wantDebug ? "DEBUG" : "INFO",
  },
});

const HCapp = new SlackApp({
  env: {
    SLACK_BOT_TOKEN: process.env.HC_SLACK_BOT_TOKEN!,
    SLACK_APP_TOKEN: process.env.HC_SLACK_APP_TOKEN!,
    SLACK_SIGNING_SECRET: process.env.HC_SLACK_SIGNING_SECRET!,
    SLACK_LOGGING_LEVEL: wantDebug ? "DEBUG" : "INFO",
  },
});

const PBclient: SlackAPIClient = PBapp.client;
const HCclient: SlackAPIClient = HCapp.client;

PBapp.anyMessage(async ({ payload, context }) => {
  await mirror(PBclient, HCclient, payload);
});
HCapp.anyMessage(async ({ payload, context }) => {
  await mirror(PBclient, HCclient, payload);
});

let enabled = true;

(async () => {
  enabled = await prisma.settings.findFirst({
    where: {
      setting: "enabled",
    },
  }).then((setting) => {
    if (setting && setting.boolean) {
      return setting.boolean
    }
    return true;
  });
})

console.log(
  "🚀 Server Started in",
  Bun.nanoseconds() / 1000000,
  "milliseconds on version:",
  version + "!",
  "\n\n----------------------------------\n"
);

export { HCapp, HCclient, PBapp, PBclient, prisma, enabled };

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
