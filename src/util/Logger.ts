import { PBclient } from "../index";

import async from "async";
import Bottleneck from "bottleneck";
import colors from "colors";
import { ChatPostMessageRequest } from "slack-edge";

// Create a rate limiter with Bottleneck
const limiter = new Bottleneck({
  minTime: 1000, // 1 second between each request
});

const messageQueue = async.queue(
  async (task: ChatPostMessageRequest, callback) => {
    await limiter.schedule(() => PBclient.chat.postMessage(task));
  },
  1
); // Only one worker to ensure order and rate limit

async function slog(logMessage, type) {
  const message: ChatPostMessageRequest = {
    channel: process.env.SLACK_LOG_CHANNEL!,
    text: logMessage,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: logMessage
            .split("\n")
            .map((a) => `${a}`)
            .join("\n"),
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `${new Date().toString()}`,
          },
        ],
      },
    ],
  };

  switch (type) {
    case "info":
      message.text = `> :information_source: ${message.text}`;
      // @ts-expect-error
      message.blocks[0].text.text = `> :information_source: ${message.blocks[0].text.text}`;
      break;
    case "start":
      message.text = `> :rocket: ${message.text}`;
      // @ts-expect-error
      message.blocks[0].text.text = `> :rocket: ${message.blocks[0].text.text}`;
      break;
    case "cron":
      message.text = `> :alarm_clock: ${message.text}`;
      // @ts-expect-error
      message.blocks[0].text.text = `> :alarm_clock: ${message.blocks[0].text.text}`;
      break;
    case "error":
      message.text = `> 🚨 Yo <@U079DHX7FB6> deres an error \n\n [ERROR]: ${message.text}`;
      // @ts-expect-error
      message.blocks[0].text.text = `> 🚨 Yo <@U079DHX7FB6> deres an error \n\n [ERROR]: ${message.blocks[0].text.text}`;
      break;
    default:
      message.text = message.text;
  }

  messageQueue.push(message, (error) => {
    if (error) {
      console.error("Failed to send message:", error);
    }
  });
}

type LogType = "info" | "start" | "cron" | "error";

export const clog = async (logMessage, type: LogType) => {
  switch (type) {
    case "info":
      console.log(colors.blue(logMessage));
      break;
    case "start":
      console.log(colors.bgBlue(logMessage));
      break;
    case "cron":
      console.log(colors.magenta(`[CRON]: ${logMessage}`));
      break;
    case "error":
      console.error(colors.red.bold(`[ERROR]: ${logMessage}`));
      break;
    default:
      console.log(logMessage);
  }
};

export const blog = async (logMessage, type: LogType) => {
  slog(logMessage, type);
  clog(logMessage, type);
};

export { clog as default, slog };
