import * as dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { App, ExpressReceiver } from "@slack/bolt";
import colors from "colors";
import express from "express";

import { indexEndpoint } from "./endpoints";
import { healthEndpoint } from "./endpoints/health";
import { mirror } from "./functions/mirror";
import { t } from "./lib/templates";
import { slog } from "./util/Logger";

const prisma = new PrismaClient();

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET!,
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN!,
  appToken: process.env.SLACK_APP_TOKEN!,
  signingSecret: process.env.SLACK_SIGNING_SECRET!,
  receiver,
});

app.message(async ({ message, say }) => {
  await mirror(app.client, message);
});

receiver.router.use(express.json());
receiver.router.get("/", indexEndpoint);
receiver.router.get("/ping", healthEndpoint);
receiver.router.get("/up", healthEndpoint);

const logStartup = async (app: App) => {
  let env = process.env.NODE_ENV;
  slog(t("app.startup", { environment: env }), "info");
};

app.start(process.env.PORT || 3000).then(async () => {
  await logStartup(app);
  console.log(
    colors.bgCyan(`⚡️ Bolt app is running in env ${process.env.NODE_ENV}`)
  );
});

// Heartbeat
// new CronJob(
//   "0 * * * * *",
//   async function () {
//     metrics.increment("heartbeat");
//   },
//   null,
//   true,
//   "America/New_York"
// );

const client: any = app.client;
export { app, client, prisma };
