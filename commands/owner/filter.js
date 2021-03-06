const { Command } = require('easy-djs-commandhandler');
const Filter = new Command({
	name: 'filter',
	description:
		'adds, deletes or clears the filter, flags are `add`, `remove`, `clear`',
	hideinhelp: true,
	requires: ['botowner'],
	hideinhelp:true,
});
module.exports = Filter.execute(async (client, message, args) => {
	let flag = args[0];
	args.splice(0, 1);
	let restrictee = args.join(' ');
	client.db.use('data');
	if (flag == 'add') {
		client.filter.push(restrictee);
		message.channel.send(`added \`${restrictee}\` to the filter`);
	} else if (flag == 'remove') {
		let index = client.filter.findIndex((x) => x == restrictee);
		if (!index) {
			return message.channel.send('word/phrase doesnt exist');
		}
		client.filter.splice(index, 1);
		message.channel.send(`removed \`${restrictee}\` from the filter`);
	} else if (flag == 'clear') {
		client.filter.splice(0);
		message.channel.send('cleared filter list');
	}
	client.db.insert('filter', client.filter);
});
