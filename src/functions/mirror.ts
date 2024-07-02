import { blog } from "../util/Logger";

export async function mirror(client, message) {
  try {
    if (
      message.subtype === "bot_message" ||
      message.subtype === "channel_join" ||
      message.subtype === "channel_leave"
    ) {
      return;
    }

    console.log(message);

    let channel = message.channel;
    // let mirrorTest1 = "C07ASSJGE2G";
    // let mirrorTest2 = "C07AHPB65P0";

    // get user profile
    let userProfile = await client.users.profile.get({
      user: message.user,
    });

    let profile = userProfile.profile;
    let userpfp = profile.image_512;
    let userRealName = profile.real_name;

    let channels = {
      mirrorTest1: "C07ASSJGE2G",
      mirrorTest2: "C07AHPB65P0",
    };

    let teams = {
      purpleBubble: "T07986PHP2R",
      hackClub: "",
    };

    let channelMapings = [
      {
        originChannel: channels.mirrorTest1,
        originTeam: teams.purpleBubble,
        mirrorChannel: channels.mirrorTest2,
        mirrorTeam: teams.purpleBubble,
      },
      {
        originChannel: channels.mirrorTest2,
        originTeam: teams.purpleBubble,
        mirrorChannel: channels.mirrorTest1,
        mirrorTeam: teams.purpleBubble,
      },
    ];

    let channelsFlat = Object.values(channels);

    if (channelsFlat.includes(channel)) {
      switch (channel) {
        case channels.mirrorTest1:
          let msg1 = client.chat.postMessage({
            team: channelMapings.find((c) => c.originChannel === channel)!
              .mirrorTeam,
            username: userRealName,
            icon_url: userpfp,
            channel: channelMapings.find((c) => c.originChannel === channel)!
              .mirrorChannel,
            text: message.text,
          });

          // await prisma.message.create({
          //   data: {
          //     user: message.user,
          //     originTs: message.ts,
          //     originTeam: message.team,
          //     originChannel: message.channel,
          //     mirrorTs: msg1.ts,
          //     mirrorTeam: msg1.team,
          //     mirrorChannel: msg1.channel,
          //     text: message.text,
          //     blocks: message.blocks,
          //   },
          // });

          break;
        case channels.mirrorTest2:
          let msg2 = client.chat.postMessage({
            team: channelMapings.find((c) => c.originChannel === channel)!
              .mirrorTeam,
            username: userRealName,
            icon_url: userpfp,
            // set channel to be the mirror channel from the channelMappings array
            channel: channelMapings.find((c) => c.originChannel === channel)!
              .mirrorChannel,
            text: message.text,
          });

          // await prisma.message.create({
          //   data: {
          //     user: message.user,
          //     originTs: message.ts,
          //     originTeam: message.team,
          //     originChannel: message.channel,
          //     mirrorTs: msg2.ts,
          //     mirrorTeam: msg2.team,
          //     mirrorChannel: msg2.channel,
          //     text: message.text,
          //     blocks: message.blocks,
          //   },
          // });

          break;
      }
    }
  } catch (error) {
    blog(`Error responding to message: ${error}`, "error");
  }
}
