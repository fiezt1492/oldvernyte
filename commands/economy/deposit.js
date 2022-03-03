const Discord = require("discord.js");
const { millify } = require("millify");

module.exports = {
	name: "deposit",
	description: "your owlets safe in the bank",
	category: "economy",
	aliases: ["dep"],
	usage: "[owlet]",
	cooldown: 5,
	args: true,
	ownerOnly: false,
	permissions: ["SEND_MESSAGES"],

	async execute(message, args, guildSettings) {
		const { client } = message;

		let input = Number(args[0]);
		if (isNaN(input) || input <= 0)
			return message.reply({
				content: `Please provide a positive number!`,
			});
		const player = await client.players.get(message.author.id)

		if (input > player.owlet) return message.reply({
			content: `You dont have enough owlet!`,
		});

		await client.players.bank(message.author.id, input);
		const string = millify(input, {
			precision: 2,  
		  });
			
		return message.reply({
			content: `Successfully ${this.name} \`${string}\` owlets to your bank account!`,
		});
	},
};
