const { Message } = require('discord.js'); 
const { Command } = require('easy-djs-commandhandler');
const last = new Command({ 
	name:'last', 
	description: "Last Reward posted",
	usage:'<prefix>last '});

module.exports = last.execute(async(client, message, args)=>{ 
let HWMChannel = '600014903775985710';

	//let target = client.channels.get(client.HWMChannel);
	let target = client.channels.get(HWMChannel); // find the targeted channel 	 
	if (!target) { 
		message.channel.send("Hero Mobile Channel ID is not set.");
		return
	}
 
	const msg = await target.fetchMessages({ limit: 5 })   ;
	//const daily = msg.map(x => x  );
	return await message.channel.send(
	`Last 5 Rewards: \`\`\`${msg.map( x=> '\n ' + x   )} \`\`\`   `);
	//`Last 3 Rewards: ${msg.map( x=> '\n> ' + x  )} `);
	//`Last 3 Rewards: \n> ${msg.map}   \n> ${msg.map(x => x  )}   \n> ${msg.first().content}  `);
  }
);		  
