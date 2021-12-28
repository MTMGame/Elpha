const { SlashCommandBuilder } = require("@discordjs/builders")
const Discord = require('discord.js') 
const Modlog = require("../models/Modlog")
const Warning = require("../models/Warning")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("warn user")
    .addUserOption(option =>
        option.setName('user')
            .setDescription('user')
            .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('warning')
            .setDescription('warning')
            .setRequired(true)
    ),

    async execute(interaction) {

        var reason = interaction.options.getString('warning')
        var user = interaction.options.getUser('user')
        const modlog = await Modlog.findOne({guild_id: interaction.guild.id})
        if (interaction.guild.members.cache.get(interaction.user.id).permissions.has(Discord.Permissions.FLAGS.MANAGE_MESSAGES) || interaction.guild.members.cache.get(interaction.user.id).permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR) || interaction.user.id === '754381104034742415') {
            if (user.id === '754381104034742415') {return interaction.reply('You cannot warn my developer')}
            if (user === interaction.user) return interaction.reply('You cannot warn yourself')
            if (user === interaction.client.user) return interaction.reply('You cannot warn me')
            if (interaction.guild.members.cache.get(user.id).permissions.has(Discord.Permissions.FLAGS.MANAGE_MESSAGES) || interaction.guild.members.cache.get(user.id).permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR) || user.id === '754381104034742415') {return interaction.reply('You cannot warn Moder')}
            const embed = new Discord.MessageEmbed()
            .setColor('#00ffff')
             .setTitle(`Warned ${user.username}`)
             .setDescription(`warning: ${reason}`)
             .setThumbnail(user.displayAvatarURL())
             interaction.reply({ 
                 embeds: [embed] ,
                 content : `${user} you are warned : **${reason}**`,
                })
             Warning.findOne({ user_id: user.id , guild_id: interaction.guild.id}, (err, settings) => {
                if (err) {
                    console.log(err);
                    interaction.reply("An error occurred while adding warning to user's database!");
                    return;
                }
                if (!settings) {
                    settings = new Warning({
                        guild_id: interaction.guild.id,
                        user_id: user.id,
                        warning: interaction.options.getString('warning')
                    });
                } else {
                    settings.warning = interaction.options.getString('warning');
                }
                settings.save(err => {
                    if (err) {
                        console.log(err);
                        interaction.reply("An error occurred while adding warning to user's database!");
                        return;
                    }
    
                    interaction.channel.send(`Warning given to ${user.username}`);
                })
                
                if (!modlog) {
                    return
                }else{
                    const abc = interaction.guild.channels.cache.get(modlog.modlog_channel_id)
                    if(!abc)return
                    if (abc.type === 'voice') return
                    abc.send({
                        embeds: [embed] 
                    })	
                }
            })
        } else {
            interaction.reply('Insufficant Permissions')
        }
    }
}