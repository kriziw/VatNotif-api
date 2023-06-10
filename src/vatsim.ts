import { Database } from "./lib/database.js";
import { Controller } from "./types/controllers.js";
export class Vatsim {
	private initialized = false;

	private onlineControllers: Controller[] = [];
	private newControllers: Controller[] = [];
	private controllers: Controller[] = [];

	public async initialize(): Promise<void> {
		if (this.initialized) {
			return;
		}

		this.onlineControllers = await this.fetchControllers();

		setInterval(async () => {
			const onlineControllers = await this.fetchControllers();
			const ignoredCids = await Database.getIgnoredCids();

			this.newControllers = await this.filterNewControllers(onlineControllers);

			for (const newController of this.newControllers) {
				if (!ignoredCids.includes(newController.cid)) {
					await Vatsim.sendDiscordNotification(newController);
				}
			}

			this.onlineControllers = onlineControllers;
		}, 15 * 1000);

		this.initialized = true;
	}

	private async fetchControllers(): Promise<Controller[]> {
		let res: Response | null = null;
		try {
			res = await fetch("https://data.vatsim.net/v3/vatsim-data.json");
		} catch (err) {
			console.error(err);
			return this.onlineControllers;
		}

		if (!res || !res.ok) {
			return this.onlineControllers;
		}

		return (await res.json()).controllers;
	}

	private async filterNewControllers(onlineControllers: Controller[]): Promise<Controller[]> {
		const newControllers: Controller[] = [];

		for (const onlineController of onlineControllers) {
			const found = this.onlineControllers.find((controller) => controller.cid === onlineController.cid);

			if (!found) {
				newControllers.push(onlineController);
			}
		}

		return newControllers;
	}

	public static async sendDiscordNotification(controller: Controller): Promise<void> {
		const webhooks = await Database.getWebhooksFromCallsign(controller.callsign);

		for (const webhook of webhooks) {
			await fetch(webhook.webhook_url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					content: null,
					embeds: [
						{
							title: webhook.title || "New vACCHUN notification!",
							description: webhook.description?.replace("{{name}}", controller.name)?.replace("{{callsign}}", controller.callsign) || `Controller **${controller.name}** has logged on as **${controller.callsign}**!`,
							color: 2329275,
							timestamp: new Date().toISOString(),
						},
					],
					attachments: [],
				}),
			});
		}
	}

	public async forceRefresh(): Promise<void> {
		this.onlineControllers = await this.fetchControllers();
	}

	public getOnlineControllers(): Controller[] {
		return this.onlineControllers;
	}

	public getNewControllers(): Controller[] {
		return this.newControllers;
	}
}
