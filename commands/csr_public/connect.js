const { Command } = require('easy-djs-commandhandler');
const Connect = new Command({
	name: 'connect',
	requires: ['guild'],
	requiresBotPermissions: ['EMBED_LINKS'],
	description: "connects to CSR's main chat",
	usage:
		'<prefix>connect [channel] [public | private] [passcode](optional, can use channel topic)',
	requireUserPermissions: ['MANAGE_CHANNELS'],
});
let allowedTypes = ['public', 'private'];
/** @param {import("../../bot")} callback */
module.exports = Connect.execute(async (client, message, args) => {
	// if (
	// 	message.author.id !== message.guild.owner.id &&
	// 	!client.staff.has(message.author.id)
	// ) {
	// 	return message.channel.send("you're not allowed to use this command");
	// }
	/**
	 * @type {import('discord.js').TextChannel}
	 */
	// @ts-ignore
	let channel =
		message.mentions.channels.first() || message.guild.channels.get(args[0]);
	let type = args[1];
	let passcode = args[2];
	if (!channel || channel.type !== 'text') {
		return message.channel.send('invalid channel provided');
	}
	if (!allowedTypes.includes(type)) {
		return message.channel.send('invalid type');
	}
	if (type == 'public') {
		let pChannel = client.system.getChannels(message.guild).private;
		if (pChannel && channel.id == pChannel.id) {
			return message.channel.send(
				"public channel can't be the same as private channel"
			);
		}
	} else if (type == 'private') {
		let pChannel = client.system.getChannels(message.guild).public;
		if (pChannel && channel.id == pChannel.id) {
			return message.channel.send(
				"private channel can't be the same as the public channel"
			);
		}
	}
	if (type == 'public') {
		client.system.channels.update(message.guild, channel, 'public');
		let rules = client.rules;
		channel.send('**make sure you read the rules before proceding**', rules);
		let webhook = await channel.createWebhook('csr');
		client.system.webhookManager.add(message.guild, { public: webhook });
	} else {
		//if (!args[2] || args[2] == '') {
		//return message.channel.send('passcode is empty or invalid');
		//}
		channel.passcode = passcode || null;
		client.system.channels.update(message.guild, channel, 'private');
		let embed = new (require('discord.js').RichEmbed)();
		embed.setColor(client.color);
		embed.setAuthor(message.guild.name, message.guild.iconURL);
		embed.setDescription('has connected');
		// let connected = client.system.getMatchingPrivate(message.guild);
		// connected.forEach((pChannel) => {
		// 	if (pChannel.guild.id == message.guild.id) return;
		// 	pChannel.send(embed);
		// });
		client.system.sendAll(embed);
		let webhook = await channel.createWebhook('csr');
		client.system.webhookManager.add(message.guild, { private: webhook });
	}
	message.channel.send('successfully set');
});
