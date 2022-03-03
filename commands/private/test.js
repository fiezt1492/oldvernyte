const Discord = require("discord.js");
const randomstring = require('randomstring')
// const layer = require("../../module/economy/gameData")
module.exports = {
	name: "test",
	description: "this is a test command",
	category: "private",
	// aliases: [""],
	usage: "",
	// cooldown: 5,
	// args: false,
	ownerOnly: true,
	// permissions: ["SEND_MESSAGES"],

	async execute(message, args, guildSettings, ONCE, i18n) {
		const { client } = message;
    const db = await client.db.collection("players")

    const baseId = String(Math.ceil(Math.random() * 3))
    const baseCards = client.baseCards
		const cards = client.cards
    const elements = ['fire', 'water', 'metal', 'earth', 'herb']
    
    let cardId, exist, i=0;

		do {
			cardId = await randomstring.generate({
				length: 7,
				capitalization: 'lowercase'
			})
			// console.log(cardId)
      exist = await cards.get(cardId)
		} while (exist && i < 100 && i++)
    
		const star = 1
		const caseId = null
		const value = Number(Math.random() * 0.75 + 0.25).toFixed(2)

		/*


		
		*/

		/*

    while (!wasEnded(p1, p2)) {
  
      const [firstPlayer, secondPlayer] = setOrder(p1, p2)

      standbyPhase(firstPlayer, secondPlayer) {
        skill + critical/dodge
      }

      combatPhase(firstPlayer, secondPlayer) {
        Dodge / Block
        Critical
        Attack
        Counter
      }

      endingPhase(firstPlayer, secondPlayer)

    }

    stats

    atk max 100
    def max 100
    spd max 100

    skill max 100

    x / 400

		c uc r sr ssr ur elusive legendary 's stats

		c = 0-12 = 0-48
		uc = 12-24 = 48-96
		r = 24-36 = 96-144
		sr = 36-48 = 144-192
		ssr = 48-61 = 192-244
    ur = 61-74 = 244-296
		elusive = 74-87 = 296-348
		l = 87-100 = 348-400
    
		*/

		const element = elements[Math.floor(Math.random()*elements.length)]
    const ownerId = message.author.id
    
    await cards.set(cardId, {
			ownerId,
      caseId,
      baseId,
			star,
      value,
      element
    })

    const card = await cards.get(cardId)
		const baseCard = await baseCards.get(card.baseId)
    //console.log(card, baseCard)

    const fullCard = await cards.getFull(cardId, client)

		let fields = []
		const continues = ['id', 'createdAt']

		for (const [key, value] of Object.entries(fullCard)) {
			// console.log(key, value)
			if (continues.includes(key)) continue;
			fields.push({
				name: String(key),
				value: String(value === "" ? "null" : value ),
				inline: true
			})
		}

		const Embed = new Discord.MessageEmbed()
		.setTitle(fullCard.id)
		.setFields(fields)
		.setTimestamp(fullCard.createdAt)

    // console.log(fullCard, Embed)
		return await message.channel.send({
			embeds: [Embed]
		})
		
    // {
    //   id,
    //   name,
		// 	iconURL,
    //   rarity,
    //   atk,
    //   def,
    //   spd,
    //   skill
    // }

		// {
		// 	id: card.id,
    //   baseId: card.baseId,
    //   value: card.value,
    //   element: card.element,
    //   createdAt: Date.now()
		// }

    // await db.updateOne(
		// 	{
		// 		id: message.author.id,
		// 	},
		// 	{
		// 		$pull: {
		// 			"backpack.cards": "124"
		// 		}
		// 	}
		// )
		//generate a card

    // const pFun = (id) => {
    //   bank: {
    //     function get() {
    //       const p = 10
    //       return p.bank;
    //     }
    //   }
    // }

    // const player = pFun(10)
    // console.log(player)
    // const result = player.bank.get()

    // console.log(result)

    // const baseCard = {
    //   id: '001',
    //   rarity: 'ssr',
		// 	name: 'baby',
		// 	stats: {
    //     atk: 100,
    //   	def: 100,
    //     spd: 100
		// 	},
    //   skills: ['001']
    // }
    
    // const value = 0.97
    // const star = 1
    // const ele = 'fire'
		// const stats = baseCard.stats * value

		// let rdId;

		// // do {

		// // } while ()

		// rdId = randomstring.generate({
		// 	length: 7,
		// 	capitalization: 'lowercase'
		// })

		// const card = {
    //   id = rdId,
    //   baseId = baseCard.id,
    //   v,
    //   star,
    //   ele,
		// 	createdAt: Date.now()
		// }

		
	},
};
