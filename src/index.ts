import { SlackApp } from "slack-edge";
import colors from "colors";
import CronJob from "cron";

import { Elysia } from "elysia";

import { indexEndpoint } from "./endpoints";
import { healthEndpoint } from "./endpoints/health";
import { t } from "./lib/templates";
import metrics from "./metrics";
import { blog, slog } from "./util/Logger";

const app = new SlackApp({
  env: {
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN!,
    SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET!,
    SLACK_APP_TOKEN: process.env.SLACK_APP_TOKEN!,
    SLACK_LOGGING_LEVEL: "INFO",
  },
  startLazyListenerAfterAck: true
});

app.event("team_join", async ({ context, payload }) => {
  try {
    metrics.increment(`slack.event.${payload.type}`);
  } catch (error) {
    blog(`Error in event handler: ${error}`, "error");
    metrics.increment("slack.event.error");
  }
});

const elysia = new Elysia()
  .get("/", indexEndpoint)
  .get("/ping", healthEndpoint)
  .get("/up", healthEndpoint)
  .listen(3000);

export default {
  port: 3000,
  async fetch(request: Request) {
    return await app.run(request);
  },
}

let env = process.env.NODE_ENV;
slog(t("app.startup", { environment: env }), "info");

console.log(
  colors.bgCyan(`⚡️ Bolt app is running in env ${process.env.NODE_ENV}`)
);

// Heartbeat
new CronJob(
  "0 * * * * *",
  async function () {
    metrics.increment("heartbeat");
  },
  null,
  true,
  "America/New_York"
);

const client: any = app.client;
export { app, client };
