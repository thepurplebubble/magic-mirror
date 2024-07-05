import {
  BotMessageEvent,
  FileShareMessageEvent,
  GenericMessageEvent,
  SlackAPIClient,
  ThreadBroadcastMessageEvent,
} from "slack-edge";
import { prisma } from "../index";
import { blog } from "../util/Logger";

let hcTeam = "T0266FRGM";
let hcChannel_purplebubble = "C068D2P46TH";
let hcChannel_pbip = "C06AXC7B0QN";
let hcmirrorTest = "C069N64PW4A";
let pbmirrorTest = "C07ASSJGE2G";
let pbTeam = "T07986PHP2R";
let pbChannel_pb = "C079B7H3AKD";
let pbChannel_pbpb = "C078WH9B44F";

const channels = [
  // hcChannel_pbip,
  // hcChannel_purplebubble,
  hcmirrorTest,
  pbmirrorTest,
  // pbChannel_pb,
  // pbChannel_pbpb,
];

const channelMap = {
  [pbChannel_pb]: hcChannel_purplebubble,
  [pbChannel_pbpb]: hcChannel_pbip,
  [pbmirrorTest]: hcmirrorTest,
  [hcmirrorTest]: pbmirrorTest,
  [hcChannel_purplebubble]: pbChannel_pb,
  [hcChannel_pbip]: pbChannel_pbpb,
};

let team;

export async function mirror(
  pbClient: SlackAPIClient,
  hcClient: SlackAPIClient,
  message:
    | (GenericMessageEvent & { team?: string })
    | (BotMessageEvent & { team?: string })
    | (FileShareMessageEvent & { team?: string })
    | (ThreadBroadcastMessageEvent & { team?: string })
) {
  try {
    if (message.team === pbTeam) {
      team = "PB";
    } else if (message.team === hcTeam) {
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

    if (!channels.includes(message.channel)) {
      return;
    }

    blog(`Message received from team ${team}`, "info");
    console.log(message);

    let messageTeam = message.team!;
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

    let postParams: any = {};

    // check if the message is sent in a thread
    if (message.thread_ts) {
      console.log("Thread broadcast message received");

      let threadTs = message.thread_ts;
      postParams.thread_ts = threadTs;

      // find the origin message
      let originMessage = await prisma.message.findFirst({
        where: {
          originTs: threadTs,
        },
      });

      if (!originMessage) {
        blog(`Could not find origin message for thread ${threadTs}`, "error");
        return;
      } else {
        if (messageTeam === pbTeam) {
          postParams.channel = channelMap[originMessage.originChannel];
        } else if (messageTeam === hcTeam) {
          postParams.channel = channelMap[originMessage.mirrorChannel];
        }
      }
    }

    postParams = {
      username: userDisplayName,
      icon_url: userpfp,
      channel: channelMap[messageChannel],
      text: message.text,
      blocks: message.blocks,
    };

    if (messageTeam === pbTeam) {
      const newMessage = await hcClient.chat.postMessage(postParams);

      blog(
        `Message sent from <#${messageChannel}> (PB) => #${channelMap[messageChannel]} (HC) : ${message.text}`,
        "info"
      );

      // save the message to the database
      const data: any = {
        user: message.user,
        originTs: message.ts,
        originChannel: messageChannel,
        originTeam: pbTeam,
        mirrorTs: newMessage.ts,
        mirrorChannel: newMessage.channel,
        mirrorTeam: hcTeam,
      };

      if (message.thread_ts) {
        data.originThreadTs = message.thread_ts;
      }

      await prisma.message.create({
        data,
      });
    } else if (messageTeam === hcTeam) {
      const newMessage = await pbClient.chat.postMessage(postParams);

      blog(
        `Message sent from #${messageChannel} (HC) => <#${channelMap[messageChannel]}> (PB) : ${message.text}`,
        "info"
      );

      // save the message to the database
      const data: any = {
        user: message.user,
        originTs: message.ts,
        originChannel: messageChannel,
        originTeam: hcTeam,
        mirrorTs: newMessage.ts,
        mirrorChannel: newMessage.channel,
        mirrorTeam: pbTeam,
      };

      if (message.thread_ts) {
        data.originThreadTs = message.thread_ts;
      }

      // @ts-expect-error
      if (newMessage.thread_ts) {
        // @ts-expect-error
        data.mirrorThreadTs = newMessage.thread_ts;
      }

      await prisma.message.create({
        data,
      });
    }
  } catch (error) {
    blog(`Error responding to message: ${error}`, "error");
  }
}
