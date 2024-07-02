import * as dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { App, ExpressReceiver } from "@slack/bolt";
import colors from "colors";
import express from "express";

import { indexEndpoint } from "./endpoints";
import { healthEndpoint } from "./endpoints/health";
import { mirror } from "./functions/mirror";
import { slog } from "./util/Logger";

const prisma = new PrismaClient();

const PBreceiver = new ExpressReceiver({
  signingSecret: process.env.PB_SLACK_SIGNING_SECRET!,
});

const HCreceiver = new ExpressReceiver({
  signingSecret: process.env.HC_SLACK_SIGNING_SECRET!,
});

const PBapp = new App({
  token: process.env.PB_SLACK_BOT_TOKEN!,
  appToken: process.env.PB_SLACK_APP_TOKEN!,
  signingSecret: process.env.PB_SLACK_SIGNING_SECRET!,
  receiver: PBreceiver,
});

const HCapp = new App({
  token: process.env.HC_SLACK_BOT_TOKEN!,
  appToken: process.env.HC_SLACK_APP_TOKEN!,
  signingSecret: process.env.HC_SLACK_SIGNING_SECRET!,
  receiver: HCreceiver,
});

const PBclient: any = PBapp.client;
const HCclient: any = HCapp.client;

PBapp.message(async ({ message, say }) => {
  await mirror(PBclient, HCclient, message);
});

HCapp.message(async ({ message, say }) => {
  await mirror(PBclient, HCclient, message);
});

PBreceiver.router.use(express.json());
PBreceiver.router.get("/", indexEndpoint);
PBreceiver.router.get("/ping", healthEndpoint);
PBreceiver.router.get("/up", healthEndpoint);

HCreceiver.router.use(express.json());
HCreceiver.router.get("/", indexEndpoint);
HCreceiver.router.get("/ping", healthEndpoint);
HCreceiver.router.get("/up", healthEndpoint);

PBapp.start(3000).then(async () => {
  await slog("PB Bolt app is running", "startup");
  console.log(
    colors.bgCyan(`⚡️ PB Bolt app is running in env ${process.env.NODE_ENV}`)
  );
});

HCapp.start(3001).then(async () => {
  await slog("HC Bolt app is running", "startup");
  console.log(
    colors.bgCyan(`⚡️ HC Bolt app is running in env ${process.env.NODE_ENV}`)
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

export { HCapp, HCclient, PBapp, PBclient, prisma };
