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

    if (messageTeam === pbTeam) {
      let userProfile = await pbClient.users.profile.get({
        user: message.user,
      });

      let profile = userProfile.profile!;
      let userpfp = profile.image_512!;
      let userDisplayName = profile.display_name!;

      switch (messageChannel) {
        case pbmirrorTest:
          blog(
            `Message sent #mirrorTest (PB) => #mirrorTest (HC): ${message.text}`,
            "info"
          );

          hcClient.chat.postMessage({
            username: userDisplayName,
            icon_url: userpfp,
            channel: hcmirrorTest,
            text: message.text,
            blocks: message.blocks,
          });

          break;
        case pbChannel_pbpb:
          blog(
            `Message sent #pb-pb (PB) => #pbip (HC): ${message.text}`,
            "info"
          );

          hcClient.chat.postMessage({
            username: userDisplayName,
            icon_url: userpfp,
            channel: hcChannel_pbip,
            text: message.text,
            blocks: message.blocks,
          });

          break;

        case pbChannel_pb:
          blog(
            `Message sent #pb (PB) => #purplebubble (HC): ${message.text}`,
            "info"
          );

          hcClient.chat.postMessage({
            username: userDisplayName,
            icon_url: userpfp,
            channel: hcChannel_purplebubble,
            text: message.text,
            blocks: message.blocks,
          });

          break;

        default:
          return;
      }
    } else if (messageTeam === hcTeam) {
      let userProfile = await hcClient.users.profile.get({
        user: message.user,
      });

      let profile = userProfile.profile!;
      let userpfp = profile.image_512!;
      let userRealName = profile.real_name!;

      switch (messageChannel) {
        case hcmirrorTest:
          blog(
            `Message sent #mirrorTest (HC) => #mirrorTest (PB): ${message.text}`,
            "info"
          );

          pbClient.chat.postMessage({
            username: userRealName,
            icon_url: userpfp,
            channel: pbmirrorTest,
            text: message.text,
            blocks: message.blocks,
          });

          break;
        case hcChannel_purplebubble:
          blog(
            `Message sent #purplebubble (HC) => #pb (PB): ${message.text}`,
            "info"
          );

          pbClient.chat.postMessage({
            username: userRealName,
            icon_url: userpfp,
            channel: pbChannel_pb,
            text: message.text,
            blocks: message.blocks,
          });

          break;

        case hcChannel_pbip:
          blog(
            `Message sent #pbip (HC) => #pb-pb (PB): ${message.text}`,
            "info"
          );

          pbClient.chat.postMessage({
            username: userRealName,
            icon_url: userpfp,
            channel: pbChannel_pbpb,
            text: message.text,
            blocks: message.blocks,
          });

          break;

        default:
          return;
      }
    } else {
      return;
    }
  } catch (error) {
    blog(`Error responding to message: ${error}`, "error");
  }
}
