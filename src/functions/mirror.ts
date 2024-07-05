import {
  BotMessageEvent,
  FileShareMessageEvent,
  GenericMessageEvent,
  SlackAPIClient,
  ThreadBroadcastMessageEvent,
} from "slack-edge";
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
  hcChannel_pbip,
  hcChannel_purplebubble,
  hcmirrorTest,
  pbmirrorTest,
  pbChannel_pb,
  pbChannel_pbpb,
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
      message.subtype === "channel_leave"
    ) {
      return;
    }

    if (!channels.includes(message.channel)) {
      return;
    }

    blog(`Message received from team ${team}`, "info");

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

    blog(
      `Message sent <#${messageChannel}> => <#${channelMap[messageChannel]}>: ${message.text}`,
      "info"
    );

    const postParams = {
      username: userDisplayName,
      icon_url: userpfp,
      channel: channelMap[messageChannel],
      text: message.text,
      blocks: message.blocks,
    };

    if (message.thread_ts) {
      postParams["thread_ts"] = message.thread_ts;
    }

    if (messageTeam === pbTeam) {
      hcClient.chat.postMessage(postParams);
    } else if (messageTeam === hcTeam) {
      pbClient.chat.postMessage(postParams);
    }
  } catch (error) {
    blog(`Error responding to message: ${error}`, "error");
  }
}
