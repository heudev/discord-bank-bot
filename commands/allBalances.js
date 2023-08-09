const User = require('../database/models/user');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'allbalances',
    description: 'Sunucudaki tüm kullanıcıların bakiyesini ve sıralamasını gösterir',
    async execute(message, args) {
        const guildMembers = new Set(message.guild.members.cache.map(member => member.id));

        const users = await User.findAll();

        for (const user of users) {
            if (!guildMembers.has(user.userId.toString())) {
                await user.destroy();
            }
        }

        const sortedUsers = await User.findAll({ order: [['balance', 'DESC']] });

        const leaderboard = sortedUsers.map((user, index) => {
            const member = message.guild.members.cache.get(user.userId.toString());
            const name = member ? `*${member.displayName}*` : "Bilinmeyen Kullanıcı";
            return `${index + 1}. ${name}: **${parseFloat(user.balance).toFixed(2)}** coin`;
        }).join('\n');


        const embed = new MessageEmbed()
            .setTitle('Sunucu Bakiye Sıralaması')
            .setDescription(leaderboard)
            .setColor('#0099ff')
            .setFooter('Bakiye Sıralaması')
            .setAuthor(message.guild.name, message.guild.iconURL())

        message.channel.send({ embeds: [embed] });
    }
};