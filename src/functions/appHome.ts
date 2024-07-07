import {
  AnyHomeTabBlock,
  AppHomeOpenedEvent,
  AuthorizeResult,
  BlockAction,
  ButtonAction,
  PreAuthorizeSlackAppContext,
  SlackAPIClient,
} from "slack-edge";
import { prisma, updateEnabled, getEnabled } from "..";

export async function appHome(
  event: AppHomeOpenedEvent,
  context: PreAuthorizeSlackAppContext & {
    client: SlackAPIClient;
    botToken: string;
    botId: string;
    botUserId: string;
    userToken?: string;
    authorizeResult: AuthorizeResult;
  },
) {
  // check if its opening the home tab
  if (event.tab !== "home") {
    return;
  }

  // get info about the user
  const user = await context.client.users.info({
    user: event.user,
  });

  // check if the user is authorized
  if (
    user.user?.is_owner ||
    user.user?.is_admin ||
    process.env.ADMINS?.split(",").includes(user.user?.id!)
  ) {
    // update the home tab
    await context.client.views.publish({
      user_id: event.user,
      view: {
        type: "home",
        blocks: await getSettingsMenuBlocks(true, event.user),
      },
    });
    return;
  } else {
    console.log("📥 User is not authorized", user.user!.name);
    // update the home tab
    await context.client.views.publish({
      user_id: event.user,
      view: {
        type: "home",
        blocks: await getSettingsMenuBlocks(false, event.user),
      },
    });
    return;
  }
}

export async function toggleEnabled(
  event: BlockAction<ButtonAction>,
  context: PreAuthorizeSlackAppContext & {
    client: SlackAPIClient;
    botToken: string;
    botId: string;
    botUserId: string;
    userToken?: string;
    authorizeResult: AuthorizeResult;
  },
) {
  // check if its opening the home tab
  // get info about the user
  const user = await context.client.users.info({
    user: event.user.id,
  });

  // check if the user is authorized
  if (
    user.user?.is_owner ||
    user.user?.is_admin ||
    process.env.ADMINS?.split(",").includes(user.user?.id!)
  ) {
    console.log("📥 User is authorized to toggle app status", user.user!.name);

    await updateEnabled(!getEnabled());

    // update the home tab
    await context.client.views.publish({
      user_id: event.user.id,
      view: {
        type: "home",
        blocks: await getSettingsMenuBlocks(true, event.user.id),
      },
    });
    return;
  } else {
    console.log("📥 User is not authorized", user.user!.name);
    // update the home tab
    await context.client.views.publish({
      user_id: event.user.id,
      view: {
        type: "home",
        blocks: await getSettingsMenuBlocks(false, event.user.id),
      },
    });
    return;
  }
}

async function getSettingsMenuBlocks(
  allowed: boolean,
  user: string,
): Promise<AnyHomeTabBlock[]> {
  if (!allowed) {
    console.log("📥 User is not authorized", user);
    return [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `:gear: Settings Menu for Magic Mirror :gear:`,
        },
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `:siren-real: You are not authorized to use this app. Please contact the owners of this app ( ${process.env.ADMINS?.split(
            ",",
          )
            .map((admin) => `<@${admin}>`)
            .join(" ")} ) to get access.`,
        },
      },
    ];
  }

  console.log("📥 User is authorized to view the settings page", user);

  // get all the settings
  const settings = await prisma.settings.findMany();
  const messages = await prisma.message.findMany();
  // update the home tab
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `:gear: Settings Menu for Magic Mirror :gear:`,
      },
    },
    {
      type: "divider",
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `:neocat_happy: App status: ${settings.find((setting) => setting.setting === "enabled")?.boolean ? ":white_check_mark:" : ":x:"}`,
      },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text:
              "Toggle App Status to " +
              (!settings.find((setting) => setting.setting === "enabled")
                ?.boolean
                ? ":white_check_mark:"
                : ":x:"),
            emoji: true,
          },
          action_id: "toggleEnabled",
        },
      ],
    },
    {
      type: "divider",
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `:blobby-bar_chart: Analytics:\n\nTotal Top Level Messages: ${messages.length} messages`,
      },
    },
    {
      type: "divider",
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `:blobby-admission_tickets: Admins: \n\n${process.env.ADMINS?.split(
          ",",
        )
          .map((admin) => `<@${admin}>`)
          .join(" ")}`,
      },
    },
  ];
}
