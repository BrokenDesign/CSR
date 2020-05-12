const discord = require('discord.js');
const System = require('./system/index');
const jndb = require('jndb');
const fs = require('fs');
const path = require('path');
const FileWatch = require('./filewatch');
/**
 *
 *
 * @class Bot
 * @extends {discord.Client}
 */
class Bot extends discord.Client {
	/**
	 *
	 * @param {discord.ClientOptions} [options]
	 */
	constructor(options) {
		super(options); 
		this.allowedServers=['688259277688930325', '462007482001391616']
        	this.errorChannel="688466079575834769"
		this.HWMChannel="600014903775985710" //For Last.js
		this.db = new jndb.Connection();
		this.system = new System(this);
		/**
		 * @type {discord.Collection<string,string>}
		 */
		this.banlist = new discord.Collection();
		this.lockdown = {
			enabled: false,
			time: 0,
		};
		/**
		 * @type {discord.Collection<string,string>}
		 */
		this.csrCooldowns = new discord.Collection();

		/**
		 * @type {string[]}
		 */
		this.filter = [];
		this.prefixDB = new jndb.Connection({ fileName: 'prefixes.json' });
		this.prefixDB.use('prefixes');
		this.color = '#146ea4';

		/**
		 * @type {Map<string,string>}
		 */
		this._allCmds = new Map();
		fs.readdir(`./commands/`, (err, files) => {
			// read dir
			const jsfile = files.filter(
				(f) =>
					f.split('.').pop() === 'js' &&
					!fs.statSync(process.cwd() + `/commands/` + f).isDirectory()
			); // get all .js files
			const categorys = files.filter((f) =>
				fs.statSync(process.cwd() + `/commands/` + f).isDirectory()
			);

			jsfile.forEach((f, i) => {
				// if commands present
				try {
					const props = require(`${process.cwd()}/commands/${f}`); // => load each one

					if (props.help.aliases && !Array.isArray(props.help.aliases))
						props.help.aliases = [props.help.aliases];
					this._allCmds.set(props.help.name, `${process.cwd()}/commands/${f}`); // => add command to command list
				} catch (err) {}
			});
			categorys.forEach((category) => {
				const catfiles = fs
					.readdirSync(`./commands/` + category)
					.filter(
						(f) =>
							f.split('.').pop() === 'js' &&
							!fs
								.statSync(process.cwd() + `/commands/` + category + '/' + f)
								.isDirectory()
					);
				catfiles.forEach((f, i) => {
					try {
						const props = require(`${process.cwd()}/commands/${category}/${f}`); // => load each one

						props.help.category = category;
						if (props.help.aliases && !Array.isArray(props.help.aliases))
							props.help.aliases = [props.help.aliases];
						this._allCmds.set(
							props.help.name,
							`${process.cwd()}/commands/${category}/${f}`
						); // => add command to command list
					} catch (err) {}
				});
			});
		});
		const fileWatch = new FileWatch();
		fileWatch.watch('commands', (event, file) => {
			if (event != 'change') return;
			this.reloadCommands('commands');
		});
		//this.color = [20, 110, 164, 0.62];
	}
	/**
	 * @returns {Map<string,string>}
	 */
	get staff() {
		const map = new Map();
		this.db.use('staff');
		const staff = this.db.fetchAll();
		for (const i in staff) {
			map.set(i, staff[i]);
		}
		return map;
	}
	/**
	 * @returns {discord.RichEmbed}
	 */
	get rules() {
		const code = require('./ircrules');
		const cd = new discord.RichEmbed()
			.setColor([0, 200, 138])
			.setDescription(code)
			// @ts-ignore
			.setFooter('IRC Code Of Conduct', this.user.displayAvatarURL);
		return cd;
	}
	/**
	 *
	 * @param {string} message
	 */
	debug(message) {
		const err = new Error();
		const frame = err.stack.split('\n')[2];
		const numbers = frame.match(/:\d/g).map((x) => x.replace(':', ''));
		const lineNumber = numbers[0];
		const functionName = frame.split(' ')[5];
		console.log(functionName + ':' + lineNumber + ' ' + message);
	}
	backup() {
		fs.copyFileSync('jndb.json', 'jndbBackup.json');
	}
	reloadCommands(folder) {
		folder = path.resolve(folder);
		const commandFiles = fs
			.readdirSync(folder)
			.filter((file) => file.endsWith('.js'));
		const subDirs = fs
			.readdirSync(folder)
			.filter((file) => fs.statSync(folder + '/' + file).isDirectory());
		for (const file of commandFiles) {
			delete require.cache[require.resolve(`${folder}/${file}`)];
			try {
				const command = require(`${folder}/${file}`);
				// @ts-ignore
				this.commands.delete(command.help.name);
				// @ts-ignore
				this.commands.set(command.help.name, command);
			} catch (err) {
				console.log(err);
			}
		}
		subDirs.forEach((category) => {
			category = path.resolve(path.join(folder, category));
			const catfiles = fs
				.readdirSync(category)
				.filter(
					(f) =>
						f.split('.').pop() === 'js' &&
						!fs.statSync(category + '/' + f).isDirectory()
				);

			catfiles.forEach((f, i) => {
				f = path.resolve(category + '/' + f);
				delete require.cache[require.resolve(f)];
				try {
					const props = require(f); // => load each one
					props.help.category = category.split('\\').pop();

					if (props.help.aliases && !Array.isArray(props.help.aliases))
						props.help.aliases = [props.help.aliases];
					this.commands.set(props.help.name, props); // => add command to command list
				} catch (err) {
					console.log(
						`${i} ${f} failed to in ${category} load!\n${err}\n${err.stack}\n`
					);
				}
			});
		});
	}
	/**
	 * 
	 * @param {string} cmd 
	 */
	unload(cmd) {
		this.commands.delete(cmd);
	}
	/**
	 * 
	 * @param {string} cmd 
	 */
	load(cmd) {
		if (!this._allCmds.has(cmd)) return;
		const file = this._allCmds.get(cmd);
		const props = require(file);
		this.commands.set(props.help.name, props);
	}
}
module.exports = Bot;
