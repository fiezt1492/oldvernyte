const Discord = require("discord.js");
const { millify } = require("millify");
const stringTable = require("string-table");

module.exports = {
	name: "leaderboard",
	description: "Show global top players",
	category: "economy",
	aliases: ["top", "leaderboards"],
	usage: "",
	cooldown: 10,
	args: false,
	ownerOnly: false,
	permissions: ["SEND_MESSAGES"],

	async execute(message, args, guildSettings, Player) {
		const { client, guild } = message;
    const db = await client.db.collection("players")
      
    const players = await db.find().sort({
          owlet: -1,
          bank: -1
        }).limit(10).toArray()

    const data = players.map((o) => {
      const bal = o.owlet + o.bank
      return {
        top: String(players.indexOf(o) + 1),
        owlets: millify(bal),
        player: client.users.cache.get(o.id).tag
      }
    })

		const table = stringTable.create(data, {
			capitalizeHeaders: true,
			formatters: {
				top: function (value, header) {
					return `#${value}`;
				},
			},
		});

    const rate = players.map(o => o.id)
    const footer = `${message.author.tag} • #`

		const Embed = new Discord.MessageEmbed()
			.setTitle(`Global Top ${data.length}`)
			.setColor("RANDOM")
			.setDescription("```" + table + "```")
			.setFooter({
				text:
					rate.some(id => id === message.author.id) ? `${footer}${(rate.indexOf(message.author.id) + 1)}` : `${footer}+`,
				iconURL: message.author.displayAvatarURL({ dynamic: true }),
			});

		return message.reply({
			embeds: [Embed],
			allowedMentions: {
				repliedUser: false,
			},
		});
	},
};
