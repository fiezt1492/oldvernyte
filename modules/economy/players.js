const db = require("../../databases/mongo").collection("players");
module.exports = {
	async get(id) {
		return await db.findOne({ id },
    {
      projection: {
        _id: 0
      }
    });
	},
	async set(id) {
		const exist = await this.get(id);
		if (exist) return exist;

		await db.insertOne({
			id: id,
			owlet: 1000,
			nyteGem: 0,
			bank: 0,
			cooldowns: [],
			vote: 0,
			voteStreaks: 0,
      hp: {
				remain: 100
			},
			energy: {
				max: 100,
				remain: 100
			},
			backpackSlots: 10
		});

    /*
    */
    // await backpacks.set(id)
		return await this.get();
	},
	async owlet(id, input) {
		input = Math.round(input);
		if (isNaN(input)) return;
		if (input < 0) {
			const player = await this.get(id);
			const remain = player.owlet;
			if (remain + input <= 0) input = -remain;
		}
		await db.updateOne(
			{
				id: id,
			},
			{
				$inc: {
					owlet: input,
				},
			}
		);
	},
	async bank(id, input) {
		input = Math.round(input);
		if (isNaN(input)) return;
		const player = await this.get(id)
		const owlet = player.owlet
		if (input > owlet) input = owlet
		if (input < 0) {
			const bank = player.bank
			if (input > bank) input = bank
		}
		
		await db.updateOne(
			{
				id: id,
			},
			{
				$inc: {
					owlet: -input,
					bank: input,
				},
			}
		);
	},
	async cooldownsPush(id, event, duration) {
		const player = await this.get(id);
		const exist = player.cooldowns.find((c) => c.event === event);

		if (exist) return;

		await db.updateOne(
			{
				id: id,
			},
			{
				$push: {
					cooldowns: {
						event: event,
						timestamps: Date.now(),
						duration: duration,
					},
				},
			}
		);
	},
	async cooldownsPull(id, event) {
		await db.updateOne(
			{
				id: id,
			},
			{
				$pull: {
					cooldowns: {
						event: event,
					},
				},
			}
		);
	},
	async cooldownsGet(id, event) {
		const player = await this.get(id);
		if (!event) return player.cooldowns;
		const exist = player.cooldowns.find((c) => c.event === event);
		return exist;
	},
};
