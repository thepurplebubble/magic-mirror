import { AppHomeOpenedEvent, AuthorizeResult, PreAuthorizeSlackAppContext, SlackAPIClient } from "slack-edge";
import { prisma } from "..";

export async function appHome(event: AppHomeOpenedEvent, context: PreAuthorizeSlackAppContext & {
    client: SlackAPIClient;
    botToken: string;
    botId: string;
    botUserId: string;
    userToken?: string;
    authorizeResult: AuthorizeResult;
}) {
    // check if its opening the home tab
    if (event.tab !== "home") {
        console.log("📥 App Home Opened, but not home tab", event.tab);
        return;
    }

    // get info about the user
    const user = await context.client.users.info({
        user: event.user,
    });

    // check if the user is authorized
    if (user.user?.is_owner || user.user?.is_admin || process.env.ADMINS?.split(",").includes(user.user?.id!)) {
        console.log("📥 User is authorized to view the settings page", user.user!.name);
        // get all the settings
        const settings = await prisma.settings.findMany();
        // update the home tab
        await context.client.views.publish({
            user_id: event.user,
            view: {
                type: "home",
                blocks: [
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
                            text: `App status: ${settings.find(setting => setting.setting === "enabled")?.boolean ? ":white_check_mark:" : ":x:"}`,
                        },
                        accessory: {
                            type: "button",
                            text: {
                                type: "plain_text",
                                text: "Toggle",
                                emoji: true
                            },
                            action_id: "toggleEnabled",
                        }
                    }
                ],
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
                blocks: [
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
                            text: `:siren-real: You are not authorized to use this app. Please contact the owners of this app ( ${process.env.ADMINS?.split(",").map(admin => `<@${admin}>`).join(" ")} ) to get access.`,
                        },
                    },
                ],
            },
        });
        return;
    }
}