import * as dotenv from "dotenv";
dotenv.config();

import async from "async";
import Bottleneck from "bottleneck";
import colors from "colors";
import { ChatPostMessageRequest } from "slack-edge";
import { client } from "../index";

// Create a rate limiter with Bottleneck
const limiter = new Bottleneck({
  minTime: 1000, // 1 second between each request
});

const messageQueue = async.queue(
  async (task: ChatPostMessageRequest, callback: (error?: Error) => void) => {
    try {
      await limiter.schedule(() => client.chat.postMessage(task));
      callback(); // Indicate that the task is complete
    } catch (error: any) {
      console.error("Error posting message:", error);
      callback(error); // Pass the error to the callback
    }
  }
);

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

  // Add a colored border to the message based on the type
  switch (type) {
    case "info":
      // @ts-expect-error
      message.blocks![0].text.text = `> ${
        // @ts-expect-error
        message.blocks![0].text.text
      }`;
      break;
    case "start":
      // @ts-expect-error
      message.blocks![0].text.text = `> :rocket: ${
        // @ts-expect-error
        message.blocks![0].text.text
      }`;
      break;
    case "cron":
      // @ts-expect-error
      message.blocks![0].text.text = `> :alarm_clock: ${
        // @ts-expect-error
        message.blocks![0].text.text
      }`;
      break;
    case "error":
      // @ts-expect-error
      message.blocks![0].text.text = `> :x: ${message.blocks![0].text.text}`;
      break;
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
      console.error(
        colors.red.bold(
          `Yo <@U079DHX7FB6> deres an error \n\n [ERROR]: ${logMessage}`
        )
      );
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
