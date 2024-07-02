import { blog } from "../util/Logger";

let hcTeam = "T0266FRGM";
let hcChannel_Test1 = "C069N64PW4A";
let pbTeam = "T07986PHP2R";
let pbChannel_MirrorTest1 = "C07ASSJGE2G";
let pbChannel_MirrorTest2 = "C07AHPB65P0";

export async function mirror(pbClient, hcClient, message) {
  try {
    if (
      message.subtype === "bot_message" ||
      message.subtype === "channel_join" ||
      message.subtype === "channel_leave"
    ) {
      return;
    }

    let messageTeam = message.team!;
    let messageChannel = message.channel!;

    if (messageTeam === pbTeam) {
      let userProfile = await pbClient.users.profile.get({
        user: message.user,
      });

      let profile = userProfile.profile!;
      let userpfp = profile.image_512!;
      let userRealName = profile.real_name!;

      switch (messageChannel) {
        case pbChannel_MirrorTest1:
          hcClient.chat.postMessage({
            username: userRealName,
            icon_url: userpfp,
            channel: hcChannel_Test1,
            text: message.text,
            blocks: message.blocks,
          });

          break;

        case pbChannel_MirrorTest2:
          hcClient.chat.postMessage({
            username: userRealName,
            icon_url: userpfp,
            channel: hcChannel_Test1,
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
        case hcChannel_Test1:
          pbClient.chat.postMessage({
            username: userRealName,
            icon_url: userpfp,
            channel: pbChannel_MirrorTest1,
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
