const User = require('../database/models/user');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'transfer',
    description: 'Başka bir kullanıcıya para transferi yap',
    async execute(message, args) {
        const target = message.mentions.users.first();
        const amount = parseFloat(args[1]);

        const embed = new MessageEmbed();

        if (!target) {
            embed.setColor('RED')
                .setDescription('Para göndermek için bir kullanıcıyı etiketleyin.')
            return message.channel.send({ embeds: [embed] });
        }

        if (isNaN(amount) || amount <= 0) {
            embed.setColor('RED')
                .setDescription('Lütfen geçerli bir miktar girin.');
            return message.channel.send({ embeds: [embed] });
        }

        const sourceUser = await User.findOne({ where: { userId: message.author.id } });
        const [targetUser, created] = await User.findOrCreate({ where: { userId: target.id }, defaults: { balance: 0 } });

        if (created) {
            const systemChannel = message.guild.systemChannel;
            if (systemChannel) {
                embed.setColor('GREEN')
                    .setDescription(`Bankamıza hoşgeldin ${target}`)
                systemChannel.send({ embeds: [embed] });
            }
        }

        if (sourceUser.balance < amount) {
            embed.setColor('RED')
                .setDescription('Yeterli paranız yok.')
            return message.channel.send({ embeds: [embed] });
        }

        sourceUser.balance -= amount;
        targetUser.balance += amount;

        await sourceUser.save();
        await targetUser.save();

        try {
            const dmEmbed = new MessageEmbed()
                .setColor('GREEN')
                .setDescription(`<@${message.author.id}> size **${amount.toFixed(2)}** coin transfer etti.`)
            await target.send({ embeds: [dmEmbed] });
        } catch (error) {
            console.log('Özel mesaj gönderilirken hata oluştu:', error.message);
        }

        embed.setColor('GREEN')
            .setDescription(`<@${targetUser.userId}> kullanıcısına **${amount.toFixed(2)}** coin transfer ettiniz.`)

        message.reply({ embeds: [embed] });
    }
};