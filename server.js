const express = require("express");
const Discord = require("discord.js");
const Topgg = require("@top-gg/sdk");
const webhook = new Topgg.Webhook(process.env.TOPGG_AUTH);
const app = express();
const { port } = require("./config");

// Routes
const authRoute = require("./api/v1/routes/auth");
const socialRoute = require("./api/v1/routes/social");

module.exports = (client) => {
	
	app.use("/social", socialRoute)

	app.post(
		"/dblwebhook",
		webhook.listener(async (vote) => {
			const user = await client.users.fetch(vote.user);
			
			if (user) {
				let embed = new Discord.MessageEmbed()
					.setColor("RANDOM")
					.setTitle("Thanks for voting me, " + user.tag + "!");

				user.send({
					embeds: [embed],
				});
			}
		})
	);

	app.use(express.static(__dirname + "/views"));
	app.get("/", (req, res) => {
		res.sendFile(__dirname + "/views/index.html");
	});

	// redirect all wrong paths to home
	app.all('*', (req, res) => {
		res.status(301).redirect("/")
	})

	keepAlive();
};

var keepAlive = () => {
	app.listen(port, () => {
		console.log("Server is ready.");
	});
};
