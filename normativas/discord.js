import { DiscordSDK } from "https://cdn.jsdelivr.net/npm/@discord/embedded-app-sdk/+esm";

export const discordSdk = new DiscordSDK("1448462455553396840");

export async function setupDiscord() {
    await discordSdk.ready();

    const { code } = await discordSdk.commands.authorize({
        client_id: "1448462455553396840",
        response_type: "code",
        state: "",
        prompt: "none",
        scope: [
            "identify",
            "guilds",
            "guilds.members.read"
        ]
    });

    const response = await fetch("/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ code })
    });

    const { access_token } = await response.json();

    await discordSdk.commands.authenticate({
        access_token
    });

    console.log("Discord conectado.");
}