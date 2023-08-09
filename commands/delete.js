const { MessageEmbed } = require('discord.js');
const User = require('../database/models/user');

module.exports = {
    name: 'delete',
    description: 'Banka veritabanından bir kullanıcıyı sil',
    async execute(message, args) {
        let embed;

        if (!message.member.permissions.has('ADMINISTRATOR')) {
            embed = new MessageEmbed()
                .setColor('#FF0000')
                .setDescription('Bir kullanıcıyı silme izniniz yok.')
            return message.channel.send({ embeds: [embed] });
        }

        const target = message.mentions.users.first();
        if (!target) {
            embed = new MessageEmbed()
                .setColor('#FF0000')
                .setDescription('Lütfen silmek için bir kullanıcıyı etiketleyin.')
            return message.channel.send({ embeds: [embed] });
        }

        await User.destroy({ where: { userId: target.id } });

        embed = new MessageEmbed()
            .setColor('#00FF00')
            .setDescription(`<@${target.id}> kullanıcısının banka kaydı silindi.`)
        message.channel.send({ embeds: [embed] });
    }
};