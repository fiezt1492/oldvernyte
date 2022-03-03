const Discord = require("discord.js");
const Players = require("../../modules/economy/players");
const { millify } = require("millify");

module.exports = {
	name: "give",
	description: "give money to some body",
	category: "economy",
	aliases: ["pay"],
	usage: "[mention a user] [owlet]",
	cooldown: 30,
	args: true,
	ownerOnly: false,
	mentions: true,
	permissions: ["SEND_MESSAGES"],

	async execute(message, args, guildSettings, ONCE, i18n, mentions) {
		const { client } = message;

		const member = message.mentions.members.first();

		if (member.user.bot) return message.reply({
			content: i18n.__("common.error")
		})

		// if (!member)
		// 	return message.reply({
		// 		content: `You didn't mention anyone!`,
		// 	});

		// args = args.filter((e) => !(e.startsWith(`<@`) && e.endsWith(`>`)));

		// console.log(args)

		const amount = Number(args.shift());

		if (isNaN(amount) || amount <= 0)
			return message.reply({
				content: `Please provide a positive number!`,
			});

		const player = await client.players.get(message.author.id);

		if (amount > player.owlet)
			return message.reply({
				content: `You dont have enough owlet!`,
			});

		// const Target = new Players(member.id);

		await client.players.set(member.id);

		await client.players.owlet(message.author.id, -amount);
		await client.players.owlet(member.id, amount);

		const string = millify(amount, {
			precision: 2,
		});

		return message.reply({
			content: `Successfully ${this.name} \`${string}\` owlets to ${member}!`,
		});
	},
};
