const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const Deck = require("./Deck");
const Hand = require("./Hand");
const { millify } = require("millify");

// let games = new Map();

module.exports = async (client, message, ONCE, i18n, bet) => {
	try {
		const d = new Deck();
		d.shuffle();
		const dealer = new Hand();
		const p1 = new Hand();
		const string = millify(bet, {
			precision: 2,
		});

		p1.draw(d, 2);
		dealer.draw(d, 2);
		let p1hand = p1.cards
			.map((card) => {
				return "`" + card.toString() + "`";
			})
			.join(" | ");

		const deckEmbed = new MessageEmbed()
			.setColor("RANDOM")
			.setAuthor({
				name: client.user.tag,
				iconURL: client.user.displayAvatarURL({ dynamic: true }),
			})
			.setDescription(i18n.__mf("blackjack.deckEmbed.description.idle", {
				owlet: string
			}))
			.setFooter({
				text: message.author.tag,
				iconURL: message.author.displayAvatarURL({ dynamic: true }),
			});

		const staybut = (state) =>
			new MessageButton()
				.setCustomId("stay")
				.setLabel(i18n.__("blackjack.button.stay"))
				.setDisabled(state)
				.setStyle("DANGER");

		const hitbut = (state) =>
			new MessageButton()
				.setCustomId("hit")
				.setLabel(i18n.__("blackjack.button.hit"))
				.setDisabled(state)
				.setStyle("SUCCESS");

		deckEmbed
			.addField(
				i18n.__mf("blackjack.deckEmbed.title.idle", {
					point: "??",
					username: client.user.username
				}),
				`\`${dealer.cards[0].suit}${dealer.cards[0].value} | ${dealer.cards[1].suit}?\``,
				true
			)
			.addField(
				// `${p1.point} on ${message.author.username}\'s hand`,
				i18n.__mf("blackjack.deckEmbed.title.idle", {
					point: p1.point,
					username: message.author.username
				}),
				p1hand,
				true
			);

		let bt1 = staybut(false);
		let bt2 = hitbut(false);

		if (p1.isBanban() || p1.isBlackjack()) {
			while (
				(!dealer.isStayable() || (dealer.point < p1.point && p1.isHitable())) &&
				dealer.isHitable()
			) {
				dealer.draw(d);
			}

			bt1 = staybut(true);
			bt2 = hitbut(true);

			let dealerhand = dealer.cards
				.map((card) => {
					return "`" + card.toString() + "`";
				})
				.join(" | ");

			deckEmbed.fields[0] = {
				name: 
				// `${dealer.point} on ${client.user.username}\'s hand`,
				i18n.__mf("blackjack.deckEmbed.title.idle", {
					point: dealer.point,
					username: client.user.username
				}),
				value: dealerhand,
				inline: true,
			};
			deckEmbed.fields[1] = {
				name: 
				// `${p1.point} on ${message.author.username}\'s hand`,
				i18n.__mf("blackjack.deckEmbed.title.idle", {
					point: p1.point,
					username: message.author.username
				}),
				value: p1hand,
				inline: true,
			};

			if (
				dealer.isBusted() ||
				(dealer.point < p1.point && p1.point <= 21) ||
				(p1.is5D() && !dealer.is5D()) ||
				(p1.is5D() && dealer.is5D() && p1.point < dealer.point)
			) {
				deckEmbed.setTitle(i18n.__("blackjack.deckEmbed.title.win"));
				await client.players.owlet(message.author.id, bet);
				deckEmbed.description = i18n.__mf("blackjack.deckEmbed.description.win", {
					owlet: string
				});
			} else if (
				dealer.point === p1.point ||
				(dealer.isBusted() && p1.isBusted())
			) {
				deckEmbed.setTitle(i18n.__("blackjack.deckEmbed.title.tied"));
			} else {
				deckEmbed.setTitle(i18n.__("blackjack.deckEmbed.title.lose"));
				await client.players.owlet(message.author.id, -bet);
				deckEmbed.description = i18n.__mf("blackjack.deckEmbed.description.lose",{
					owlet: string
				});
			}
		}

		if (!p1.isStayable()) {
			bt1 = staybut(true);
		}

		let row1 = new MessageActionRow().addComponents([bt1, bt2]);

		let msg = await message.reply({
			embeds: [deckEmbed],
			components: [row1],
			allowedMentions: {
				repliedUser: false,
			},
		});

		if (bt2.disabled == false)
			ONCE.set(message.author.id, {
				name: "blackjack",
				gID: msg.guild.id,
				cID: msg.channel.id,
				mID: msg.id,
				mURL: msg.url,
			});
		else return;

		const filter = (f) => f.user.id === message.author.id;

		const msgCol = msg.createMessageComponentCollector({
			filter,
			componentType: "BUTTON",
			time: 30000,
		});

		msgCol.on("collect", async (btn) => {
			if (p1.isBanban() || p1.is5D() || p1.isBlackjack()) return msgCol.stop();
			if (p1.cards.length < 5) {
				if (btn.customId === "hit") {
					p1.draw(d);
					if (p1.isStayable()) bt1 = staybut(false);
					if (
						p1.cards.length >= 5 ||
						p1.is21P() ||
						p1.isBusted() ||
						p1.is5D()
					) {
						return msgCol.stop();
					}

					msgCol.resetTimer();
					p1hand = p1.cards
						.map((card) => {
							return "`" + card.toString() + "`";
						})
						.join(" | ");
				} else if (btn.customId === "stay") {
					p1.stay();
					return msgCol.stop();
				}
			}

			deckEmbed.fields[0] = {
				name: 
				// `?? on ${client.user.username}\'s hand`,
				i18n.__mf("blackjack.deckEmbed.title.idle", {
					point: "??",
					username: client.user.username
				}),
				value: `\`${dealer.cards[0].suit}${dealer.cards[0].value} | ${dealer.cards[1].suit}?\``,
				inline: true,
			};
			deckEmbed.fields[1] = {
				name: 
				// `${p1.point} on ${message.author.username}\'s hand`,
				i18n.__mf("blackjack.deckEmbed.title.idle", {
					point: p1.point,
					username: message.author.username
				}),
				value: p1hand,
				inline: true,
			};

			row1 = new MessageActionRow().addComponents([bt1, bt2]);

			await btn.update({
				embeds: [deckEmbed],
				components: [row1],
			});
		});

		msgCol.on("end", async (collected, reason) => {
			ONCE.delete(message.author.id);
			if (reason === "time") {
				let dealerhand = dealer.cards
					.map((card) => {
						return "`" + card.toString() + "`";
					})
					.join(" | ");

				deckEmbed.fields[0] = {
					name: 
					// `${dealer.point} on ${client.user.username}\'s hand`,
					i18n.__mf("blackjack.deckEmbed.title.idle", {
					point: "??",
					username: client.user.username
				}),
					value: dealerhand,
					inline: true,
				};
				deckEmbed.fields[1] = {
					name: 
					// `${p1.point} on ${message.author.username}\'s hand`,
					i18n.__mf("blackjack.deckEmbed.title.idle", {
					point: p1.point,
					username: message.author.username
				}),
					value: p1hand,
					inline: true,
				};
				deckEmbed.setTitle(i18n.__("blackjack.deckEmbed.title.timeout"));
				bt1 = staybut(true);
				bt2 = hitbut(true);
				row1 = new MessageActionRow().addComponents([bt1, bt2]);

				return msg.edit({
					embeds: [deckEmbed],
					components: [row1],
				});
			}

			while (
				(!dealer.isStayable() || (dealer.point < p1.point && p1.isHitable())) &&
				dealer.isHitable()
			) {
				dealer.draw(d);
			}

			let dealerhand = dealer.cards
				.map((card) => {
					return "`" + card.toString() + "`";
				})
				.join(" | ");

			p1hand = p1.cards
				.map((card) => {
					return "`" + card.toString() + "`";
				})
				.join(" | ");

			deckEmbed.fields[0] = {
				name: 
				// `${dealer.point} on ${client.user.username}\'s hand`,
				i18n.__mf("blackjack.deckEmbed.title.idle", {
					point: dealer.point,
					username: client.user.username
				}),
				value: dealerhand,
				inline: true,
			};
			deckEmbed.fields[1] = {
				name: 
				// `${p1.point} on ${message.author.username}\'s hand`,
				i18n.__mf("blackjack.deckEmbed.title.idle", {
					point: p1.point,
					username: message.author.username
				}),
				value: p1hand,
				inline: true,
			};

			if (
				(dealer.isBusted() && !p1.isBusted()) ||
				(dealer.point < p1.point && p1.point <= 21) ||
				(p1.is5D() && !dealer.is5D()) ||
				(p1.is5D() && dealer.is5D() && p1.point > dealer.point)
			) {
				deckEmbed.setTitle(i18n.__("blackjack.deckEmbed.title.win"));
				await client.players.owlet(message.author.id, bet);
				deckEmbed.description = i18n.__mf("blackjack.deckEmbed.description.win",{
					owlet: string
				});
			} else if (
				dealer.point === p1.point ||
				(dealer.isBusted() && p1.isBusted())
			) {
				deckEmbed.setTitle(i18n.__("blackjack.deckEmbed.title.tied"));
			} else {
				deckEmbed.setTitle(i18n.__("blackjack.deckEmbed.title.lose"));
				await client.players.owlet(message.author.id, -bet);
				deckEmbed.description = i18n.__mf("blackjack.deckEmbed.description.lose",{
					owlet: string
				});
			}

			bt1 = staybut(true);
			bt2 = hitbut(true);
			row1 = new MessageActionRow().addComponents([bt1, bt2]);

			msg.edit({
				embeds: [deckEmbed],
				components: [row1],
			});

			if (collected)
				return collected.map(async (btn) => {
					if (btn.replied === false)
						await btn.update({
							embeds: [deckEmbed],
							components: [row1],
						});
				});
		});
	} catch (error) {
		console.log("[BLACKJACK]: " + error.message);
	}
};
