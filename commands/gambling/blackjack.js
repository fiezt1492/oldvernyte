const Discord = require("discord.js");
const blackjack = require("../../modules/gambling/Blackjack/index");

module.exports = {
	name: "blackjack",
	description: "Play Vietnamese Blackjack",
	category: "gambling",
	aliases: ["bj"],
	cooldown: 5,
	args: true,
	usage: "[owlet]",
	once: true,
	permissions: "SEND_MESSAGES",

	async execute(message, args, guildSettings, ONCE, i18n) {
		const { client } = message;
		const bet = Math.round(Number(args[0]))
		if (isNaN(bet) || bet <= 0) return message.reply({
			content: i18n.__("blackjack.error.positive")
		})
		const player = await client.players.get(message.author.id)
		if (bet > player.owlet) return message.reply({
			content: i18n.__("blackjack.error.owlet")
		})
		await blackjack(client, message, ONCE, i18n, bet);
	},
};
