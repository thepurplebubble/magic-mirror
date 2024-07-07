import {
  AnyMessageBlock,
  BotMessageEvent,
  ChatPostMessageRequest,
  FileShareMessageEvent,
  GenericMessageEvent,
  SlackAPIClient,
  ThreadBroadcastMessageEvent,
} from "slack-edge";
import { getEnabled, prisma } from "../index";
import { blog } from "../util/Logger";

let hcTeam = "T0266FRGM";
let hcChannel_purplebubble = "C068D2P46TH";
let hcChannel_pbip = "C06AXC7B0QN";
let hcmirrorTest = "C069N64PW4A";
let pbmirrorTest = "C07ASSJGE2G";
let pbTeam = "T07986PHP2R";
let pbChannel_pb = "C079B7H3AKD";
let pbChannel_pbpb = "C078WH9B44F";

const channelMap = {
  // [pbChannel_pb]: hcChannel_purplebubble,
  // [pbChannel_pbpb]: hcChannel_pbip,
  [pbmirrorTest]: hcmirrorTest,
  [hcmirrorTest]: pbmirrorTest,
  // [hcChannel_purplebubble]: pbChannel_pb,
  // [hcChannel_pbip]: pbChannel_pbpb,
};

function hasChannel(channel: string): boolean {
  // check all keys and values in the channelMap for the channel
  for (const key in channelMap) {
    if (channelMap[key] === channel || key === channel) {
      return true;
    }
  }

  return false;
}

let team;

export async function mirror(
  pbClient: SlackAPIClient,
  hcClient: SlackAPIClient,
  message:
    | (GenericMessageEvent & { team?: string })
    | (BotMessageEvent & { team?: string })
    | (FileShareMessageEvent & { team?: string })
    | (ThreadBroadcastMessageEvent & { team?: string }),
) {
  try {
    if (!getEnabled()) {
      return;
    }

    if (!hasChannel(message.channel)) {
      return;
    }

    if (
      message.team === pbTeam ||
      // @ts-expect-error
      (message.files && message.files[0].user_team === pbTeam)
    ) {
      team = "PB";
    } else if (
      message.team === hcTeam ||
      // @ts-expect-error
      (message.files && message.files[0].user_team === hcTeam)
    ) {
      team = "HC";
    } else {
      team = "Unknown";
    }

    if (
      message.subtype === "bot_message" ||
      // @ts-expect-error
      message.subtype === "channel_join" ||
      // @ts-expect-error
      message.subtype === "channel_leave" ||
      // @ts-expect-error
      message.subtype === "channel_archive" ||
      // @ts-expect-error
      message.subtype === "channel_unarchive" ||
      // @ts-expect-error
      message.subtype === "channel_topic" ||
      // @ts-expect-error
      message.subtype === "channel_purpose" ||
      // @ts-expect-error
      message.subtype === "channel_name"
    ) {
      return;
    }

    if (!channelMap[message.channel]) {
      return;
    }

    blog(`Message received from team ${team}`, "info");

    // @ts-expect-error
    let messageTeam = message.team! ?? message.files[0].user_team!;
    let messageChannel = message.channel!;
    let userProfile;

    if (messageTeam === pbTeam) {
      userProfile = await pbClient.users.profile.get({
        user: message.user,
      });
    } else if (messageTeam === hcTeam) {
      userProfile = await hcClient.users.profile.get({
        user: message.user,
      });
    }

    let profile = userProfile.profile!;
    let userpfp = profile.image_512!;
    let userDisplayName = profile.display_name!;

    let sendingMessage: ChatPostMessageRequest | null = null;

    const fileBlocks: AnyMessageBlock[] = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "\n",
        },
      },
      { type: "divider" },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          // @ts-expect-error
          text: `*Files:*\n${message.files ? message.files.map((file) => `<${file.url_private}|${file.name}>`).join(", ") : ""}`,
        },
      },
    ];

    // Check if the message is sent in a thread
    if (message.thread_ts) {
      console.log("Thread broadcast message received");

      let threadTs = message.thread_ts;
      let originMessage: {
        user: string;
        hcTs: string;
        hcChannel: string;
        pbTs: string;
        pbChannel: string;
      } | null = null;

      if (messageTeam === hcTeam) {
        // Find the origin message
        originMessage = await prisma.message.findFirst({
          where: {
            hcTs: threadTs,
            hcChannel: messageChannel,
          },
        });
      } else {
        // Find the origin message
        originMessage = await prisma.message.findFirst({
          where: {
            pbTs: threadTs,
            pbChannel: messageChannel,
          },
        });
      }

      if (!originMessage) {
        blog(`Could not find origin message for thread ${threadTs}`, "error");
        return;
      }

      sendingMessage = {
        thread_ts:
          messageTeam === hcTeam ? originMessage.pbTs : originMessage.hcTs,
        channel: channelMap[messageChannel],
        username: userDisplayName,
        icon_url: userpfp,
        text: message.text,
        // @ts-expect-error
        blocks: message.files
          ? [...(message.blocks ?? []), ...fileBlocks]
          : message.blocks,
        unfurl_links: true,
        unfurl_media: true,
      };
    }
    const day = new Date().toISOString().split("T")[0];

    if (sendingMessage) {
      if (messageTeam === hcTeam) {
        await pbClient.chat.postMessage(sendingMessage);
      } else if (messageTeam === pbTeam) {
        await hcClient.chat.postMessage(sendingMessage);
      }

      await prisma.analytics.upsert({
        where: {
          day: day,
        },
        update: {
          totalSyncedMessages: {
            increment: 1,
          },
        },
        create: {
          day: day,
          newThreads: 0,
          totalSyncedMessages: 1,
        },
      });
    } else {
      blog(`Creating a new top level message`, "info");

      if (messageTeam === hcTeam) {
        // send a new message
        const newMessage = await pbClient.chat.postMessage({
          channel: channelMap[messageChannel],
          username: userDisplayName,
          icon_url: userpfp,
          text: message.text,
          // @ts-expect-error
          blocks: message.files
            ? [...(message.blocks ?? []), ...fileBlocks]
            : message.blocks,
          unfurl_links: true,
          unfurl_media: true,
        });

        await prisma.message.create({
          data: {
            user: message.user,
            hcTs: message.ts,
            hcChannel: messageChannel,
            pbTs: newMessage.ts!,
            pbChannel: channelMap[messageChannel],
          },
        });
      } else if (messageTeam === pbTeam) {
        // send a new message
        const newMessage = await hcClient.chat.postMessage({
          channel: channelMap[messageChannel],
          username: userDisplayName,
          icon_url: userpfp,
          text: message.text,
          // @ts-expect-error
          blocks: message.files
            ? [...(message.blocks ?? []), ...fileBlocks]
            : message.blocks,
          unfurl_links: true,
          unfurl_media: true,
        });

        await prisma.message.create({
          data: {
            user: message.user,
            hcTs: newMessage.ts!,
            hcChannel: channelMap[messageChannel],
            pbTs: message.ts,
            pbChannel: messageChannel,
          },
        });
      }

      await prisma.analytics.upsert({
        where: {
          day: day,
        },
        update: {
          newThreads: {
            increment: 1,
          },
        },
        create: {
          day: day,
          newThreads: 1,
          totalSyncedMessages: 0,
        },
      });
    }
  } catch (error) {
    blog(`Error responding to message: ${error}`, "error");
  }
}
