const { prefix } = require("../config.js");
const defaultPrefix = prefix;

module.exports = {
	name: "ready",
	once: true,

	async execute(client) {
		// client.user.setPresence({})
		const rDB = client.db.collection("restart");
		const gDB = client.db.collection("guildSettings");
		
		client.maxHp = await client.admin.getMaxHp()
		client.baseCardsList = await client.baseCards.getAll()
		// client.baseCasesList = await client.baseCards.getAll()

		const restarted = await rDB.findOne({ uID: "445102575314927617" });

		if (restarted) {
			const channel = await client.channels.fetch(restarted.cID);
			const m = await channel.messages.fetch(restarted.mID);
			m.edit("Restarted!").then(rDB.deleteOne({ uID: "445102575314927617" }));
			console.log("[RESTART] RESTARTED THE BOT");
		}

		try {
			const guildIds = await client.guilds.cache.map((guild) => guild.id);

			client.banlist = await require("../modules/util/banlist")(client)

      const guilds = await gDB.find(
        {
          gID: {
            $in: guildIds
          },
        },
        {
          prefix: 1,
          locale: 1,
        }
      ).toArray();

      guildIds.forEach((guildId) => {
        const guild = guilds.find((g) => g.id === guildId)

        client.guildSettings.set(guildId, {
                prefix: guild
                  ? guild.prefix
                    ? guild.prefix
                    : defaultPrefix
                  : defaultPrefix,
                locale: guild ? (guild.locale ? guild.locale : "en") : "en",
              });

        if (guildIds.indexOf(guildId) === guildIds.length - 1) {
					client.ready = true;
				}
      })
		} catch (error) {
			console.log(error);

			client.user.setPresence({
				status: "idle",
				afk: false,
				activities: [
					{
						name: `${prefix}help | Error`,
						type: 0,
					},
				],
			});
		} finally {
      client.user.setPresence({
				status: "online",
				afk: false,
				activities: [
					{
						name: `/help | Testing with bugs`,
						type: 0,
					},
				],
			});
    }

		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};
