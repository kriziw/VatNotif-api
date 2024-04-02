import { Database } from "../lib/database.js";
import { Controller } from "../types/controllers.js";

export class DiscordNotifications {
	public static async sendOnlineNotification(controller: Controller, affectedCids: number[]): Promise<void> {
		const webhooks = await Database.getWebhooksFromCallsign(controller.callsign, affectedCids);

		for (const webhook of webhooks) {
			await fetch(webhook, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					content: null,
					embeds: [
						{
							title: "New vACCHUN notification!",
							description: `🔼 Controller **${controller.name}** (${controller.cid}) has logged on as **${controller.callsign}** on frequency **${controller.frequency}**`!,
							color: 3319890,
							timestamp: new Date().toISOString(),
						},
					],
					attachments: [],
				}),
			});
		}
	}

	public static async sendDownNotification(controller: Controller, affectedCids: number[]): Promise<void> {
		const webhooks = await Database.getWebhooksFromCallsign(controller.callsign, affectedCids);

		for (const webhook of webhooks) {
			await fetch(webhook, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					content: null,
					embeds: [
						{
							title: "New vACCHUN notification!",
							description: `🔽 Controller **${controller.name}** (${controller.cid}) has logged off from **${controller.callsign}**!`,
							color: 14298413,
							timestamp: new Date().toISOString(),
						},
					],
					attachments: [],
				}),
			});
		}
	}
}
