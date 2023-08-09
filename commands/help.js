const Discord = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Tüm kullanılabilir komutları listeler',
    execute(message, args, client) {
        const { prefix } = require('../config.json');

        if (!client.commands || client.commands.size === 0) {
            return message.channel.send("Hiçbir komut bulunamadı.");
        }

        const commands = client.commands.map(cmd => `${prefix}**${cmd.name}** - ${cmd.description}`).join('\n');

        const embed = new Discord.MessageEmbed()
            .setTitle('Kullanılabilir Komutlar')
            .setDescription(commands)
            .setColor('#0099ff')

        message.channel.send({ embeds: [embed] });
    }
};