import elysia from "elysia";
import { SlackAPIClient } from "slack-edge";

import { indexEndpoint } from "./endpoints";
import { healthEndpoint } from "./endpoints/health";
import { mirror } from "./functions/mirror";

import { HCapp } from "./clients/hc";
import { PBapp } from "./clients/pb";

const isdev = process.env.NODE_ENV === "development";
const version = require("../package.json").version;

console.log(
  "----------------------------------\nMagic Mirror Server\n----------------------------------\n"
);
console.log("🏗️  Starting Magic Mirror...");
console.log("📦 Loading Slack App...");
console.log("🔑 Loading environment variables...");

const PBclient: SlackAPIClient = PBapp.client;
const HCclient: SlackAPIClient = HCapp.client;

HCapp.anyMessage(async ({ payload, context }) => {
  await mirror(PBclient, HCclient, payload);
});

new elysia()
  .get("/", () => indexEndpoint)
  .get("/ping", () => healthEndpoint)
  .get("/up", () => healthEndpoint)
  .get("/pb", async ({ request }) => {
    // read the readable stream as a string
    const body = await request.text();
    console.log("PB slack event received: ", JSON.parse(body).event.type);

    // create a new request with the body as the request body
    const newRequest = new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body,
    });
    return await PBapp.run(newRequest);
  })
  .post("/pb", async ({ request }) => {
    // read the readable stream as a string
    const body = await request.text();
    console.log("PB slack event received: ", JSON.parse(body).event.type);

    // create a new request with the body as the request body
    const newRequest = new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body,
    });
    return await PBapp.run(newRequest);
  })
  .get("/hc", async ({ request }) => {
    const body = await request.text();
    console.log("HC slack event received: ", JSON.parse(body).event.type);

    // create a new request with the body as the request body
    const newRequest = new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body,
    });
    return await HCapp.run(newRequest);
  })
  .post("/hc", async ({ request }) => {
    const body = await request.text();
    console.log("HC slack event received: ", JSON.parse(body).event.type);

    // create a new request with the body as the request body
    const newRequest = new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body,
    });
    return await HCapp.run(newRequest);
  })
  .listen(3000);

console.log(
  "🚀 Server Started in",
  Bun.nanoseconds() / 1000000,
  "milliseconds on version:",
  version + "!",
  "\n\n----------------------------------\n"
);

export { HCapp, HCclient, PBapp, PBclient };
