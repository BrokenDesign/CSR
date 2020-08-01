const { Command } = require('easy-djs-commandhandler');
const Default = new Command({
	name: 'default',
	requires: ['guild'],
	requiresBotPermissions: ['EMBED_LINKS'],
	description: "Creates and connects to Hero Wars Reward and Rewards Public Info channels",
	usage:
		'<prefix>default ',
	requireUserPermissions: ['MANAGE_CHANNELS'],
});
let allowedTypes = ['public', 'private'];
/** @param {import("../../bot")} callback */
module.exports = Default.execute(async (client, message, args) => {
    let type = args[0];
    if (!allowedTypes.includes(type)) {
        return message.channel.send('invalid type, try '+client.prefix+'default [private | public}');
    }
    // Private 
    //client.on('guildCreate', async (guild) => {
    let guild = message.guild.id; 
    let chs = client.system.getChannels(message.guild);
    if (type == 'private') {
	if (!message.guild.available) { return;   }
    if (chs.private){
    return message.channel.send('Channel already exist. Please try `'+client.prefix+'disconnect private` before trying again');
    return;  
    } 
	let hwb = await message.guild.createChannel('Hero Wars Reward', { type: 'text' }).catch(() => {});
	let HWMmessage = "Connected";
		await hwb.send(HWMmessage).catch(() => {});
		let webhook = await hwb.createWebhook('HeroWars').catch(() => {});
		if (webhook) client.system.webhookManager.add(guild, { private: webhook });
		hwb.passcode="HeroWarsRewards" 
        client.system.channels.create(message.guild, { privateChannel: hwb }); 
        console.log('joined private server ' + message.guild.name + ' Using default command');
        return message.channel.send('if `'+client.prefix+'testwebhooks` is ok, then your guild is connected and ready to receive our rewards. ');
} 
    if (type == 'public') {
    if (!message.guild.available) {return;}
    if (chs.public){
        return message.channel.send('Channel already exist. Please try `'+client.prefix+'disconnect public` before trying again');
        return;  
    }
	let irc = await message.guild.createChannel('Rewards Public Info', { type: 'text' }).catch(() => {});
	if (irc) {
		await irc.send(client.rules).catch(() => {});
		let webhook = await irc.createWebhook('csr').catch(() => {});
		if (webhook) client.system.webhookManager.add(guild, { private: webhook });
        client.system.channels.create(message.guild, { publicChannel: irc });
        console.log('joined public server ' + message.guild.name + ' Using default command');
        return message.channel.send('You will now receve all channel info from the bot. Type `'+client.prefix+'disconnect public` if you dont want to get this info. ');
    }
}
	const ed = new Discord.RichEmbed()
		.setColor(client.color) 
		.setAuthor(`${guild.name}`, guild.iconURL || client.user.defaultAvatarURL)
		.setDescription(`has joined ${client.system.findEmoji('join')}`);
	client.system.sendAll(ed);
});
