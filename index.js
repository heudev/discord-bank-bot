const { Client, Collection, Intents, MessageEmbed } = require('discord.js');
const { token, prefix, amountOnVoiceChannel, amountOnMessage } = require('./config.json');
const db = require('./database/db');
const User = require('./database/models/user');
const keep_alive = require('./keep_alive');
keep_alive();

const intents = new Intents([
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_PRESENCES
]);

const client = new Client({ intents });

client.commands = new Collection();

const commandFiles = ['balance', 'allBalances', 'transfer', 'delete', 'help'];

for (const file of commandFiles) {
    const command = require(`./commands/${file}.js`);
    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log('Bot is ready!');

    client.user.setPresence({
        activities: [{ name: '?help', type: 'PLAYING' }],
        status: 'online'
    });

    db.sync();
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    const [user, created] = await User.findOrCreate({ where: { userId: newState.id }, defaults: { balance: 0 } });
    const welcomeEmbed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Welcome')
        .setDescription(`Bankamıza hoşgeldin <@${newState.id}>!`);
    if (created) {
        const systemChannel = newState.guild.systemChannel;
        if (systemChannel) {
            systemChannel.send({ embeds: [welcomeEmbed] });
        }
    }
    if (!oldState.channelID && newState.channelID) {
        const interval = setInterval(async () => {
            const currentMember = newState.guild.members.cache.get(newState.id);
            if (currentMember.voice.channelID) {
                user[0].balance += amountOnVoiceChannel;
                await user[0].save();
            } else {
                clearInterval(interval);
            }
        }, 1000);
    }
});

client.on('messageCreate', async message => {
    if (!message.guild || message.author.bot) return;
    const [user, created] = await User.findOrCreate({ where: { userId: message.author.id }, defaults: { balance: 0 } });
    const welcomeEmbed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Welcome')
        .setDescription(`Bankamıza hoşgeldin <@${message.author.id}>!`);
    if (created) {
        const systemChannel = message.guild.systemChannel;
        if (systemChannel) {
            systemChannel.send({ embeds: [welcomeEmbed] });
        }
    }
    user.balance += amountOnMessage;
    await user.save();
    if (!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    if (!client.commands.has(commandName)) return;
    try {
        client.commands.get(commandName).execute(message, args, client);
    } catch (error) {
        console.error(error);
        const errorEmbed = new MessageEmbed()
            .setColor('#ff0000')
            .setTitle('Error')
            .setDescription('Command execution error!');
        message.reply({ embeds: [errorEmbed] });
    }
});

client.login(token);