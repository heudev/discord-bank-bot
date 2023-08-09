const { MessageEmbed } = require('discord.js');
const User = require('../database/models/user');

module.exports = {
    name: 'balance',
    description: 'Kullanıcının bakiyesini gösterir',
    async execute(message, args) {
        let member;

        if (args.length === 0 || !message.mentions.users.first()) {
            member = message.author;
        } else {
            member = message.mentions.users.first();
        }

        const user = await User.findOne({ where: { userId: member.id } });

        let description;
        if (!user) {
            description = `<@${member.id}> henüz bir hesaba sahip değil!`;
        } else {
            description = `<@${member.id}> kullanıcısının **${parseFloat(user.balance).toFixed(2)}** coin bakiyesi bulunmaktadır.`;
        }

        const avatarURL = member.displayAvatarURL({ dynamic: true, format: 'png' });

        const embed = new MessageEmbed()
            .setTitle('Kullanıcı Bakiyesi')
            .setColor('BLUE')
            .setDescription(description)
            .setFooter('Bakiye Sorgulama')
            .setAuthor(member.username, avatarURL, avatarURL);

        if (embed) {
            message.channel.send({ embeds: [embed] });
        } else {
            const errorEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle('Hata')
                .setDescription("Embed oluşturulamadı.")

            message.channel.send({ embeds: [errorEmbed] });
        }
    }
};