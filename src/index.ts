import elysia from "elysia";
import { SlackAPIClient, SlackApp } from "slack-edge";

import { indexEndpoint } from "./endpoints";
import { healthEndpoint } from "./endpoints/health";
import { mirror } from "./functions/mirror";

const isdev = process.env.NODE_ENV === "development";

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

PBapp.anyMessage(async ({ payload, context }) => {
  await mirror(PBclient, HCclient, payload);
});

HCapp.anyMessage(async ({ payload, context }) => {
  await mirror(PBclient, HCclient, payload);
});

new elysia()
  .get("/", () => indexEndpoint)
  .get("/ping", () => healthEndpoint)
  .get("/up", () => healthEndpoint)
  .get("/pb", ({ request }) => PBapp.run(request))
  .get("/hc", ({ request }) => HCapp.run(request))
  .listen(3000);

export { HCapp, HCclient, PBapp, PBclient };
