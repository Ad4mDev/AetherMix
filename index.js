const Discord = require('discord.js');
const fetch = require('node-fetch');
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES" , "GUILD_MEMBERS" , "GUILD_VOICE_STATES"] })
const { MessageActionRow, MessageButton } = require('discord.js');
const adam = '764447645673455616'
const nizar = '992481631917064342'
const moment = new require("moment");
const fs = require('fs')
const jimp = require('jimp')
const cheerio = require('cheerio')
const snipes = new Discord.Collection()
const { Collection } = require('discord.js');
const { Client, MessageEmbed } = require('discord.js')
const db = require('quick.db');
const ms = require('ms');
const path = require('path')
const prettyMS = import("pretty-ms");
const parseTime = require("parse-duration").default;
const cooldown = new Set ();
const mongoose = require("mongoose");
const express = require("express")
const app = express();
const session = require("express-session");
const ejs = require('ejs')
const MemoryStore = require("memorystore")(session);
const passport = require("passport");
const Strategy = require("passport-discord").Strategy;
const bodyParser = require("body-parser");
const disbut = require('discord-buttons')
disbut(client)

client.setMaxListeners(2000);
require('events').defaultMaxListeners = 1000;


client.on("ready" , () => {
    console.log('im online')
    client.user.setActivity('-help'); 
})

function getGuildPrefix(guildID) {
  const prefix = db.get(`settings.${guildID}.prefix`);
  return prefix || '-';
}

const listener = app.listen("8080", () => { console.log("Your app is listening on port " + listener.address().port) })


const dataDir = path.resolve(`${process.cwd()}${path.sep}dashboard`);
const templateDir = path.resolve(`${dataDir}${path.sep}templates`);

app.use(express.static(__dirname + '/public'));

var scopes = ["identify", "guilds"]
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj))
passport.use(new Strategy({
  clientID: process.env.ID,
  clientSecret: process.env.sc,
  callbackURL: process.env.clb,
  scope: scopes
}, (accessToken, refreshToken, profile, done) => {
  process.nextTick(function() {
    return done(null, profile)
  })



}));


app.use(session({
  secret: '@#$%^&^%$#@#$%^&*&^%$#@#$&*',
  cookie: {
    maxAge: 60000 * 60 * 24
  },
  resave: false,
  saveUninitialized: false,
  name: 'OAuth2'
}));

app.use(passport.initialize());
app.use(passport.session());

app.locals.domain = process.env.domain;
app.use(express.static("dashboard"));
const https = require('https');
const e = require("express");
app.set("view engine", "ejs", "html");


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));


const checkAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  req.session.backURL = req.url;
  res.redirect("/login");
}


/// ------ GET & POST method------- \\\


app.get('/login', passport.authenticate('discord'));
app.get('/login/redirect', passport.authenticate('discord'), (req, res) => {
  res.redirect(process.env.domain)
});

app.get("/logout", function(req, res) {
  req.session.destroy(() => {
    req.logout();
    res.redirect("/");
  });
});

app.get('/', async function(req, res) {
  const user = req.isAuthenticated() ? req.user : null;
  res.render('../dashboard/views/index.ejs', {
    user,
    client,
  })
})

app.get('/invite', async function(req, res) {
  res.redirect("https://discord.com/oauth2/authorize?client_id=899760741186424862&permissions=8&scope=bot%20applications.commands")
})

app.get('/support', async function(req, res) {
  res.redirect("https://discord.gg/jpCmvBt5Hv")
})

app.get('/terms-of-use', async function(req, res) {
  res.redirect("https://discord.com/terms")
})

app.get('/privacy-policy', async function(req, res) {
  res.redirect("https://discord.com/privacy")
})


app.get('/dashboard', checkAuth, async function(req, res) {
  let blacklist = db.get(`sccblack_${req.user.id}.reason`)
  res.render('../dashboard/views/dashboard.ejs', {
    client,
    user: req.user,
    blacklist,
    guilds: req.user.guilds.filter(u => (u.permissions & 2146958591) === 2146958591),
  })
})

app.get('/guild/:guildID/',  checkAuth,  async function(req, res) {
  let blacklist = db.get(`sccblack_${req.user.id}.reason`)
  const guild = client.guilds.cache.get(req.params.guildID)
  if (!guild) return res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=-1&guild_id=${req.params.guildID}`)
  if (!client.guilds.cache.get(req.params.guildID).members.cache.get(req.user.id).hasPermission("MANAGE_GUILD")) return res.redirect('/dashboard');
  res.render('../dashboard/views/server.ejs', {
    guild,
    client,
    user: req.user,
    blacklist,
    guilds: req.user.guilds.filter(u => (u.permissions & 2146958591) === 2146958591),
  })
})

app.get('/guild/:guildID/setting',  checkAuth, async function(req, res) {
  
  let blacklist = db.get(`sccblack_${req.user.id}.reason`)
  const guild = client.guilds.cache.get(req.params.guildID)
  if (!guild) return res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=-1&guild_id=${req.params.guildID}`)
  if (!client.guilds.cache.get(req.params.guildID).members.cache.get(req.user.id).hasPermission("MANAGE_GUILD")) return res.redirect('/dash');
  const { guildID } = req.params;
    const currentPrefix = db.get(`settings.${guildID}.prefix`) || '-';
  
 res.render('../dashboard/views/setting.ejs', {
    guild, 
    currentPrefix,
    client,
    user: req.user,
    blacklist,
    guilds: req.user.guilds.filter(u => (u.permissions & 2146958591) === 2146958591),
  })
      })

app.post('/guild/:guildID/setting', (req, res) => {
  const { guildID } = req.params;
  const newPrefix = req.body.prefix; 
  db.set(`settings.${guildID}.prefix`, newPrefix);
  res.redirect(303, `/guild/${guildID}/setting`);
});


app.get('/guild/:guildID/logs',  checkAuth, async function(req, res) {
  let blacklist = db.get(`sccblack_${req.user.id}.reason`)
  const guild = client.guilds.cache.get(req.params.guildID)
  if (!guild) return res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=-1&guild_id=${req.params.guildID}`)
  if (!client.guilds.cache.get(req.params.guildID).members.cache.get(req.user.id).hasPermission("MANAGE_GUILD")) return res.redirect('/dashboard');
 res.render('../dashboard/views/logging.ejs', {
    guild,
    client,
    user: req.user,
    blacklist,
    guilds: req.user.guilds.filter(u => (u.permissions & 2146958591) === 2146958591),
  })
})

app.get('/guild/:guildID/roles', checkAuth,  async function(req, res) {
  let blacklist = db.get(`sccblack_${req.user.id}.reason`)
  const guild = client.guilds.cache.get(req.params.guildID)
  if (!guild) return res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=-1&guild_id=${req.params.guildID}`)
  if (!client.guilds.cache.get(req.params.guildID).members.cache.get(req.user.id).hasPermission("MANAGE_GUILD")) return res.redirect('/dashboard');
 res.render('../dashboard/views/roles.ejs', {
    guild,
    client,
    user: req.user,
    blacklist,
    guilds: req.user.guilds.filter(u => (u.permissions & 2146958591) === 2146958591),
  })
})

app.get('/guild/:guildID/roles/:roleID', checkAuth,  async function(req, res) {
  let blacklist = db.get(`sccblack_${req.user.id}.reason`)
  const guild = client.guilds.cache.get(req.params.guildID)
  if (!guild) return res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=-1&guild_id=${req.params.guildID}`)
  const role = guild.roles.cache.find((role) => role.id === req.params.roleID);
  if (!client.guilds.cache.get(req.params.guildID).members.cache.get(req.user.id).hasPermission("MANAGE_GUILD")) return res.redirect('/dashboard');
  res.render('../dashboard/views/roleinfo.ejs', {
    guild,
    client,
    user: req.user,
    blacklist,
    guilds: req.user.guilds.filter(u => (u.permissions & 2146958591) === 2146958591),
    role,
  })
})



app.get('/profile', checkAuth, async function(req, res) {

  let blacklist = db.get(`sccblack_${req.user.id}.reason`)
  let creditu = db.get(`sccredit_${req.user.id}.credit`)
     if (creditu === null) creditu = 0; 
    const userCredits = db.get(`sccredit_${req.user.id}.credit`);
    const isUserPremium = db.get(`sccprem_${req.user.id}`);
  res.render('../dashboard/views/profile.ejs', {
    client,
    user: req.user,
    blacklist,
    creditu,
    userCredits, isUserPremium
  });
});

app.post('/profile', (req, res) => {
    const userCredits = parseInt(db.get(`sccredit_${req.user.id}.credit`));
    const isUserPremium = db.get(`sccprem_${req.user.id}`);

    if (!isUserPremium && !isNaN(userCredits) && userCredits >= 10000) {
        db.subtract(`sccredit_${req.user.id}.credit`, 10000); 
        db.set(`sccprem_${req.user.id}`, true);

        setTimeout(() => {
            res.redirect(303, `/profile`);
        }, 1500);
    } else {
        res.send('error');
    }
});





const defaultWelcomeMessage = `[user] just joined [server]! Welcome to the server!`;

client.on('guildMemberAdd', async (member) => {
  const welcomeMessageEnabled = db.get(`welcome_message_enabled_${member.guild.id}`);

  if (!welcomeMessageEnabled) {
    return; 
  }

  const welcomeMessage = db.get(`welcome_message_${member.guild.id}`) || defaultWelcomeMessage;

  const replacedMessage = welcomeMessage
    .replace('[user]', member.toString())
    .replace('[userName]', member.user.username)
    .replace('[memberCount]', member.guild.memberCount)
    .replace('[server]', member.guild.name)
    .replace('[inviter]', (await getInviter(member)).toString())
    .replace('[inviterName]', await getInviterName(member))
    .replace('[invites]', await getInvitesCount(member));

  const welcomeChannelID = db.get(`welcome_channel_${member.guild.id}`);
  if (welcomeChannelID) {
    const welcomeChannel = member.guild.channels.cache.get(welcomeChannelID);
    if (welcomeChannel) {
      welcomeChannel.send(replacedMessage);
    }
  } else {
    member.send(replacedMessage);
  }
});


async function getInviter(member) {
  const invites = await member.guild.fetchInvites();
  const inviter = invites.find((invite) => invite.inviter && invite.inviter.id !== client.user.id && invite.uses > 0);
  return inviter ? inviter.inviter : null;
}

async function getInviterName(member) {
  const inviter = await getInviter(member);
  return inviter ? inviter.username : null;
}

async function getInvitesCount(member) {
  const inviter = await getInviter(member);
  const invites = inviter ? inviter.invites : 0;
  return invites;
}

app.get('/guild/:guildID/welcomer',  checkAuth, async (req, res) => {
  const guildID = req.params.guildID;
  const guild = client.guilds.cache.get(guildID);
  if (!guild)
    return res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=-1&guild_id=${req.params.guildID}`);

  let blacklist = db.get(`sccblack_${req.user.id}.reason`);
  const welcomeMessage = db.get(`welcome_message_${guildID}`) || defaultWelcomeMessage;
  const welcomeChannelID = db.get(`welcome_channel_${guildID}`);
  const channels = guild.channels.cache.filter((channel) => channel.type === 'text');
  const welcomeMessageEnabled = db.get(`welcome_message_enabled_${guildID}`);
  
  res.render('../dashboard/views/welcomer.ejs', { welcomeMessageEnabled, guildID, welcomeMessage, welcomeChannelID, guild, client, user: req.user, blacklist, channels: Array.from(channels.values()) });
});

app.post('/guild/:guildID/welcomer', async (req, res) => {
  const guildID = req.params.guildID;
  const welcomeMessage = req.body.welcomeMessage;
  const welcomeChannelID = req.body.welcomeChannelID;
  const welcomeMessageEnabled = req.body.enableWelcome === 'on';
  
  if (!welcomeMessage || !welcomeChannelID) {
    
    return res.send('eror');
  }

  
  db.set(`welcome_message_${guildID}`, welcomeMessage);
  db.set(`welcome_channel_${guildID}`, welcomeChannelID);
  db.set(`welcome_message_enabled_${guildID}`, welcomeMessageEnabled);
  
  res.redirect('/guild/' + guildID + '/welcomer');
});



/////////// guildCreate & delete event

client.on('gulidCreate' , guild => {
if (server.memberCount < 50){
server.leave()
}
})


client.on('guildCreate', async Guild => {
    let Channel = client.channels.cache.find(CH => CH.id === '1223428829520068730')
    let Embed = new MessageEmbed()
       .setColor()
       .setTitle(`**${client.user.username} Joined New Server**`)
       .addField('**Server Name**', Guild.name, true)
       .addField('**Server ID**', Guild.id, true)
       .addField('**Server MemberCount**', Guild.memberCount, true)
       .addField('**Server CreatedAt**', `**<t:${parseInt(Guild.createdAt / 1000)}:R>**`, true)
       .addField('**Server Boosts**', Guild.premiumSubscriptionCount, true)
       .addField('**Server count**', Guild.client.guilds.cache.size, true)
       .setThumbnail(Guild.iconURL())
    Channel.send(Embed)
})

client.on('guildDelete', async Guild => {
  const channelId = '1223428852852723792';
  const Channel = Guild.client.channels.cache.get(channelId);

  if (!Channel) {
    console.log(`Channel with ID ${channelId} not found.`);
    return;
  }

  const Embed = new MessageEmbed()
    .setColor()
    .setTitle(`${Guild.client.user.username} Left a Server!`)
    .addField('**Server Name**', Guild.name, true)
    .addField('**Server ID**', Guild.id, true)
    .addField('**Server Member Count**', Guild.memberCount, true)
    .addField('**Server Created At**', `**<t:${parseInt(Guild.createdAt / 1000)}:R>**`, true)
    .addField('**Server Boosts**', Guild.premiumSubscriptionCount, true)
    .addField('**Server Count**', Guild.client.guilds.cache.size, true)
    .setThumbnail(Guild.iconURL());

  Channel.send(Embed)
    .catch(error => console.error('Error sending embed:', error));
});


/////// blacklist {Owner : 'adam'}

client.on("message", message => {
    if (!message.guild) {
    return;
  }

  const guildPrefix = getGuildPrefix(message.guild.id);

  if (message.content.startsWith(guildPrefix + 'blacklist')) {
    if (message.author.id !== adam) {
      return;
    }
    
    if (message.author.bot || message.channel.type === "dm") {
      return message.reply("Server only commands");
    }

    let user = message.mentions.users.first();
    let res = message.content.split(" ").slice(2).join(" ");
    
    if (!user) {
      return message.channel.send(`**${message.author.username}**, please mention a user.`);
    }
    
    if (user.bot) {
      return;
    }
    
    if (user.id === message.author.id) {
      return;
    }
    
    let blacklist = db.get(`sccblack_${user.id}`);
    
    if (blacklist) {
      return message.channel.send(`**${user.username}** is already in the blacklist.`);
    }

    if (!res) {
      return;
    }
    
    db.set(`sccblack_${user.id}`, { reason: res });
    
    let guild = client.guilds.cache.get("1066082140661485568"); 
    let member = guild.members.cache.get(user.id);
    
    if (!member) {
      return message.channel.send(`**${user.username}** is not a member of the server.`);
    }
    
    let roleId = "1125534349018804336"; 
    let role = guild.roles.cache.get(roleId);
    
    if (!role) {
      return message.channel.send("Blacklist role not found. Please make sure the role ID is correct.");
    }
    
    member.roles.add(role)
      .then(() => {
        const commandExecutionTime = new Date().toLocaleString('en-US', { timeZone: 'CET' });
        let log = client.channels.cache.get("1223428909568098404"); 
        message.channel.send(`**${user.username}** has been blacklisted by **${message.author.username}** for reason: **${res}** in (${commandExecutionTime}).`);
        log.send(`**${user.username}** has been blacklisted by **${message.author.username}** (<@${user.id}>) for **${res}** in (${commandExecutionTime}).`);
      })
      .catch(error => {
        console.error("Failed to assign blacklist role:", error);
        message.channel.send(`Failed to assign the blacklist role to **${user.username}**.`);
      });
  }
});

client.on("message", message => {
    if (!message.guild) {
    return;
  }

  const guildPrefix = getGuildPrefix(message.guild.id);

  if (message.content.startsWith(guildPrefix + 'whitelist')) {
    if (message.author.id !== adam) {
      return;
    }
    
    if (message.author.bot || message.channel.type === "dm") {
      return;
    }

    let user = message.mentions.users.first();
    
    if (!user) {
      return message.channel.send(`**${message.author.username}**, please mention a user.`);
    }
    
    if (user.bot) {
      return;
    }
    
    if (user.id === message.author.id) {
      return;
    }
    
    let blacklist = db.get(`sccblack_${user.id}.reason`);
    
    if (!blacklist) {
      return message.channel.send(`<@${user.id}> isn't blacklisted.`);
    }

    db.delete(`sccblack_${user.id}`);
    
    let guild = client.guilds.cache.get("1066082140661485568"); 
    let member = guild.members.cache.get(user.id);
    
    if (!member) {
      return message.channel.send(`**${user.username}** is not a member of the server.`);
    }
    
    let roleId = "1125534349018804336"; 
    let role = guild.roles.cache.get(roleId);
    
    if (!role) {
      return message.channel.send("Blacklist role not found. Please make sure the role ID is correct.");
    }
    
    member.roles.remove(role)
      .then(() => {
        const commandExecutionTime = new Date().toLocaleString('en-US', { timeZone: 'CET' });
        let log = client.channels.cache.get("1223428888160505936"); 
        message.channel.send(`**${user.username}** has been whitelisted by **${message.author.username}** in (${commandExecutionTime}).`);
        log.send(`**${user.username}** has been whitelisted by **${message.author.username}** (<@${user.id}>) in (${commandExecutionTime}).`);
      })
      .catch(error => {
        console.error("Failed to remove blacklist role:", error);
        message.channel.send(`Failed to remove the blacklist role from **${user.username}**.`);
      });
  }
});



client.on("messageCreate", message => {
    if (!message.guild) {
        return;
    }

    const guildPrefix = getGuildPrefix(message.guild.id);

    if (message.content.startsWith(guildPrefix + 'info')) {
        if (message.author.id !== adam) {
            return;
        }
        if (message.author.bot || message.channel.type == "DM") return;

        const args = message.content.slice(guildPrefix.length).trim().split(/ +/g);
        if (args.length === 1) {
            return; // No arguments provided
        }

        const user = message.mentions.members.first() || message.guild.members.cache.get(args[1]);

        if (!user) {
            return message.channel.send(`**${message.author.username}**, mention a user.`);
        }
        if (user.user.bot) {
            return;
        }

        let info1 = new MessageEmbed()
            .setColor('2f3136')
            .addField('**Joined Discord**', `**<t:${parseInt(user.user.createdAt / 1000)}:R>**`, true)
            .addField('**Joined Server**', `**<t:${parseInt(user.joinedAt / 1000)}:R>**`, true)
            .addField('**Blacklisted ??**', `Yes`, true)
            .addField('**premium ??**', `No`, true)
            .setThumbnail(user.user.displayAvatarURL({ dynamic: true }))
            .setFooter(user.user.username, user.user.displayAvatarURL({ dynamic: true }))

        let info2 = new MessageEmbed()
            .setColor('2f3136')
            .addField('**Joined Discord**', `**<t:${parseInt(user.user.createdAt / 1000)}:R>**`, true)
            .addField('**Joined Server**', `**<t:${parseInt(user.joinedAt / 1000)}:R>**`, true)
            .addField('**Blacklisted ??**', `No`, true)
            .addField('**premium ??**', `Yes`, true)
            .setThumbnail(user.user.displayAvatarURL({ dynamic: true }))
            .setFooter(user.user.username, user.user.displayAvatarURL({ dynamic: true }))

        let info3 = new MessageEmbed()
            .setColor('2f3136')
            .addField('**Joined Discord**', `**<t:${parseInt(user.user.createdAt / 1000)}:R>**`, true)
            .addField('**Joined Server**', `**<t:${parseInt(user.joinedAt / 1000)}:R>**`, true)
            .addField('**Blacklisted ??**', `No`, true)
            .addField('**premium ??**', `No`, true)
            .setThumbnail(user.user.displayAvatarURL({ dynamic: true }))
            .setFooter(user.user.username, user.user.displayAvatarURL({ dynamic: true }))

        let blacklist = db.get(`sccblack_${user.id}.reason`);
        if (!blacklist) {
            let premium = db.get(`sccprem_${user.id}`);
            if (premium) {
                message.channel.send(info2);
            } else {
                message.channel.send(info3);
            }
        } else {
            message.channel.send(info1);
        }
    }
});


///////////// Blacklist {Owner : 'nizar'}

client.on("message", message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
  if (message.content.startsWith(guildPrefix + "blacklist")) {
    if (message.author.id !== nizar) {
      return;
    }
    
    if (message.author.bot || message.channel.type === "dm") {
      return message.reply("Server only commands");
    }

    let user = message.mentions.users.first();
    let res = message.content.split(" ").slice(2).join(" ");
    
    if (!user) {
      return message.channel.send(`**${message.author.username}**, please mention a user.`);
    }
    
    if (user.bot) {
      return;
    }
    
    if (user.id === message.author.id) {
      return;
    }
    
    let blacklist = db.get(`sccblack_${user.id}`);
    
    if (blacklist) {
      return message.channel.send(`**${user.username}** is already in the blacklist.`);
    }

    if (!res) {
      return;
    }
    
    db.set(`sccblack_${user.id}`, { reason: res });
    
    let guild = client.guilds.cache.get("1066082140661485568"); 
    let member = guild.members.cache.get(user.id);
    
    if (!member) {
      return message.channel.send(`**${user.username}** is not a member of the server.`);
    }
    
    let roleId = "1125534349018804336"; 
    let role = guild.roles.cache.get(roleId);
    
    if (!role) {
      return message.channel.send("Blacklist role not found. Please make sure the role ID is correct.");
    }
    
    member.roles.add(role)
      .then(() => {
        const commandExecutionTime = new Date().toLocaleString('en-US', { timeZone: 'CET' });
        let log = client.channels.cache.get("1223428909568098404"); 
        message.channel.send(`**${user.username}** has been blacklisted by **${message.author.username}** for reason: **${res}** in (${commandExecutionTime}).`);
        log.send(`**${user.username}** has been blacklisted by **${message.author.username}** (<@${user.id}>) for **${res}** in (${commandExecutionTime}).`);
      })
      .catch(error => {
        console.error("Failed to assign blacklist role:", error);
        message.channel.send(`Failed to assign the blacklist role to **${user.username}**.`);
      });
  }
});

client.on("message", message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
  if (message.content.startsWith(guildPrefix + "whitelist")) {
    if (message.author.id !== nizar) {
      return;
    }
    
    if (message.author.bot || message.channel.type === "dm") {
      return;
    }

    let user = message.mentions.users.first();
    
    if (!user) {
      return message.channel.send(`**${message.author.username}**, please mention a user.`);
    }
    
    if (user.bot) {
      return;
    }
    
    if (user.id === message.author.id) {
      return;
    }
    
    let blacklist = db.get(`sccblack_${user.id}.reason`);
    
    if (!blacklist) {
      return message.channel.send(`<@${user.id}> isn't blacklisted.`);
    }

    db.delete(`sccblack_${user.id}`);
    
    let guild = client.guilds.cache.get("1066082140661485568"); 
    let member = guild.members.cache.get(user.id);
    
    if (!member) {
      return message.channel.send(`**${user.username}** is not a member of the server.`);
    }
    
    let roleId = "1125534349018804336"; 
    let role = guild.roles.cache.get(roleId);
    
    if (!role) {
      return message.channel.send("Blacklist role not found. Please make sure the role ID is correct.");
    }
    
    member.roles.remove(role)
      .then(() => {
        const commandExecutionTime = new Date().toLocaleString('en-US', { timeZone: 'CET' });
        let log = client.channels.cache.get("1223428888160505936"); 
        message.channel.send(`**${user.username}** has been whitelisted by **${message.author.username}** in (${commandExecutionTime}).`);
        log.send(`**${user.username}** has been whitelisted by **${message.author.username}** (<@${user.id}>) in (${commandExecutionTime}).`);
      })
      .catch(error => {
        console.error("Failed to remove blacklist role:", error);
        message.channel.send(`Failed to remove the blacklist role from **${user.username}**.`);
      });
  }
});


client.on("message",message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
  if(message.content.startsWith(guildPrefix +"info")){
    if(message.author.id !== nizar){
      return 
     }
        if(message.author.bot || message.channel.type == "dm") return 
 const args = message.content.slice(guildPrefix.length).trim().split(/ +/g); 
 const user =  message.mentions.members.first() ||  message.guild.members.cache.get(args[0])
  if(!user){
    return message.channel.send(`**${message.author.username}**, mentions user.`)
  }
  if(user.bot){
    return 
  }
          
         
  let info1 = new MessageEmbed()
            .setColor('2f3136')
            .addField('**Joined Discord**', `**<t:${parseInt(user.user.createdAt / 1000)}:R>**`, true)
            .addField('**Joined Server**', `**<t:${parseInt(user.joinedAt / 1000)}:R>**`, true)
            .addField('**Blacklisted ??**', `Yes`, true)
            .addField('**premium ??**', `No`, true)
            .setThumbnail(user.user.displayAvatarURL({ dynamic: true }))
            .setFooter(user.user.username, user.user.displayAvatarURL({ dynamic: true }))
  
  let info2 = new MessageEmbed()
            .setColor('2f3136')
            .addField('**Joined Discord**', `**<t:${parseInt(user.user.createdAt / 1000)}:R>**`, true)
            .addField('**Joined Server**', `**<t:${parseInt(user.joinedAt / 1000)}:R>**`, true)
            .addField('**Blacklisted ??**', `No`, true)
                .addField('**premium ??**', `Yes`, true)
            .setThumbnail(user.user.displayAvatarURL({ dynamic: true }))
            .setFooter(user.user.username, user.user.displayAvatarURL({ dynamic: true }))   

   let info3 = new MessageEmbed()
            .setColor('2f3136')
            .addField('**Joined Discord**', `**<t:${parseInt(user.user.createdAt / 1000)}:R>**`, true)
            .addField('**Joined Server**', `**<t:${parseInt(user.joinedAt / 1000)}:R>**`, true)
            .addField('**Blacklisted ??**', `No`, true)
                .addField('**premium ??**', `No`, true)
            .setThumbnail(user.user.displayAvatarURL({ dynamic: true }))
            .setFooter(user.user.username, user.user.displayAvatarURL({ dynamic: true }))      
  
  let blacklist = db.get(`sccblack_${user.id}.reason`)
  if(!blacklist){
        let premium = db.get(`sccprem_${user.id}`)
    if(premium) {
      message.channel.send(info2)
    } 
    if(!premium) {
      message.channel.send(info3)
    } 
  } else  {
  
  message.channel.send(info1)
  }
  
  }
  })

const AETHERMIXGUILDID = '862765780289716234';
const MEMBERROLEID = '1223266156224315412';

client.on('guildMemberAdd', async (member) => {
    if (member.guild.id === AETHERMIXGUILDID) {
        try {
            const role = member.guild.roles.cache.get(MEMBERROLEID);
            if (role) {
                await member.roles.add(role);
                console.log(`Added role ${role.name} to ${member.user.tag}`);
            } else {
                console.log(`Role with ID ${MEMBERROLEID} not found.`);
            }
        } catch (err) {
            console.error('Error adding role:', err);
        }
    }
});

client.on('guildMemberAdd', (member) => {
  const BLwelcomeChannel = member.guild.channels.cache.get('1125534252142952601');
  const roleId = '1125534349018804336';
  const roleblack = member.guild.roles.cache.get(roleId);
  
  let blacklist = db.get(`sccblack_${member.user.id}.reason`)
    if (blacklist) {

      if (role) {
        member.roles.add(roleblack)}
      
      if (BLwelcomeChannel) {
    BLwelcomeChannel.send(`too bad you're blacklisted from using AetherMix bot if you need help you can mention our staff for more information or just join the voice channel <#1125535137585700945> , ${member.user}!`);
    
      }
    } else {
        const premrole = member.guild.roles.cache.get("1126123559979331676");
        let premium = db.get(`sccprem_${member.id}`);
          
    }
});



/////////// premium system : 
                             //// { Adam } : 
client.on("message", message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
  if (message.content.startsWith(guildPrefix + "addprem")) {
    if (message.author.id !== adam) {
      return;
    }
    
    if (message.author.bot || message.channel.type === "dm") {
      return message.reply("Server only commands");
    }

    let user = message.mentions.users.first();
    
    if (!user) {
      return message.channel.send(`**${message.author.username}**, please mention a user.`);
    }
    
    if (user.bot) {
      return;
    }
    
    if (user.id === message.author.id) {
      return;
    }
    
    let guild = client.guilds.cache.get("1066082140661485568"); 
    let member = guild.members.cache.get(user.id);
    
    if (!member) {
      return message.channel.send(`**${user.username}** is not a member of the server.`);
    }
    
    let premium = db.get(`sccprem_${user.id}`);
    
    if (premium) {
      return message.channel.send(`**${user.username}** is already in the premium list.`);
    }

    db.set(`sccprem_${user.id}`, true);
    
    let roleId = "1126123559979331676"; 
    let role = guild.roles.cache.get(roleId);
    
    if (!role) {
      return 
    }
    
    member.roles.add(role)
      .then(() => {
        let premiumlog = client.channels.cache.get("1223428999682985985"); 
        message.channel.send(`**${user.username}** has been added to the premium list and given the premium role by **${message.author.username}**.`);
        premiumlog.send(`**${message.author.username}** added **${user.username}** to premium (<@${user.id}>) and assigned the premium role.`);
      })
      .catch(error => {
        console.error("Failed to assign premium role:", error);
        message.channel.send(`Failed to assign the premium role to **${user.username}**.`);
      });
  }
});


client.on("message", message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
  if (message.content.startsWith(guildPrefix + "removeprem")) {
    if (message.author.id !== adam) {
      return;
    }
    
    if (message.author.bot || message.channel.type === "dm") {
      return;
    }

    let user = message.mentions.users.first();
    
    if (!user) {
      return message.channel.send(`**${message.author.username}**, please mention a user.`);
    }
    
    if (user.bot) {
      return;
    }
    
    if (user.id === message.author.id) {
      return;
    }
    
    let guild = client.guilds.cache.get("1066082140661485568"); 
    let member = guild.members.cache.get(user.id);
    
    if (!member) {
      return message.channel.send(`**${user.username}** is not a member of the server.`);
    }
    
    let premium = db.get(`sccprem_${user.id}`);
    
    if (!premium) {
      return message.channel.send(`<@${user.id}> not found in premium list.`);
    }

    db.delete(`sccprem_${user.id}`);
    
    let roleId = "1126123559979331676"; 
    let role = guild.roles.cache.get(roleId);
    
    if (!role) {
      return
    }
    
    member.roles.remove(role)
      .then(() => {
        let premiumlog = client.channels.cache.get("1223428999682985985"); 
        message.channel.send(`**${user.username}** has been removed from the premium list and the premium role by **${message.author.username}**.`);
        premiumlog.send(`**${user.username}** has been removed from the premium list by **${message.author.username}** (<@${user.id}>) and the premium role has been removed.`);
      })
      .catch(error => {
        console.error("Failed to remove premium role:", error);
        message.channel.send(`Failed to remove the premium role from **${user.username}**.`);
      });
  }
});

                             //// { Nizar } : 

client.on("message", message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
  if (message.content.startsWith(guildPrefix + "addprem")) {
    if (message.author.id !== nizar) {
      return;
    }
    
    if (message.author.bot || message.channel.type === "dm") {
      return message.reply("Server only commands");
    }

    let user = message.mentions.users.first();
    
    if (!user) {
      return message.channel.send(`**${message.author.username}**, please mention a user.`);
    }
    
    if (user.bot) {
      return;
    }
    
    if (user.id === message.author.id) {
      return;
    }
    
    let guild = client.guilds.cache.get("1066082140661485568"); 
    let member = guild.members.cache.get(user.id);
    
    if (!member) {
      return message.channel.send(`**${user.username}** is not a member of the server.`);
    }
    
    let premium = db.get(`sccprem_${user.id}`);
    
    if (premium) {
      return message.channel.send(`**${user.username}** is already in the premium list.`);
    }

    db.set(`sccprem_${user.id}`, true);
    
    let roleId = "1126123559979331676"; 
    let role = guild.roles.cache.get(roleId);
    
    if (!role) {
      return 
    }
    
    member.roles.add(role)
      .then(() => {
        let premiumlog = client.channels.cache.get("1223428999682985985"); 
        message.channel.send(`**${user.username}** has been added to the premium list and given the premium role by **${message.author.username}**.`);
        premiumlog.send(`**${message.author.username}** added **${user.username}** to premium (<@${user.id}>) and assigned the premium role.`);
      })
      .catch(error => {
        console.error("Failed to assign premium role:", error);
        message.channel.send(`Failed to assign the premium role to **${user.username}**.`);
      });
  }
});

client.on("message", message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
  if (message.content.startsWith(guildPrefix + "removeprem")) {
    if (message.author.id !== nizar) {
      return;
    }
    
    if (message.author.bot || message.channel.type === "dm") {
      return;
    }

    let user = message.mentions.users.first();
    
    if (!user) {
      return message.channel.send(`**${message.author.username}**, please mention a user.`);
    }
    
    if (user.bot) {
      return;
    }
    
    if (user.id === message.author.id) {
      return;
    }
    
    let guild = client.guilds.cache.get("1066082140661485568"); 
    let member = guild.members.cache.get(user.id);
    
    if (!member) {
      return message.channel.send(`**${user.username}** is not a member of the server.`);
    }
    
    let premium = db.get(`sccprem_${user.id}`);
    
    if (!premium) {
      return message.channel.send(`<@${user.id}> not found in premium list.`);
    }

    db.delete(`sccprem_${user.id}`);
    
    let roleId = "1126123559979331676"; 
    let role = guild.roles.cache.get(roleId);
    
    if (!role) {
      return
    }
    
    member.roles.remove(role)
      .then(() => {
        let premiumlog = client.channels.cache.get("1223428999682985985"); 
        message.channel.send(`**${user.username}** has been removed from the premium list and the premium role by **${message.author.username}**.`);
        premiumlog.send(`**${user.username}** has been removed from the premium list by **${message.author.username}** (<@${user.id}>) and the premium role has been removed.`);
      })
      .catch(error => {
        console.error("Failed to remove premium role:", error);
        message.channel.send(`Failed to remove the premium role from **${user.username}**.`);
      });
  }
});


///////////////// Premium and blacklist Users List : 


client.on('message' , message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
  if(message.content === guildPrefix + 'premiumuser') {
    if (message.author.id !== nizar) {
      return;
    } else {

const embed = new Discord.MessageEmbed()
  .setTitle('Premium Users')
  .setColor('2f3136'); 

db.all().forEach((data) => {
  const key = data.ID;
  if (key.startsWith('sccprem_')) {
    const userId = key.split('_')[1];
    const user = client.users.cache.get(userId);
    if (user) {
      embed.addField(`${user.username}\n${user.id}`);
    }
  }
});
message.channel.send(embed);
      
    }
  }
});

client.on('message' , message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
  if(message.content === guildPrefix + 'blacklistuser') {
if (message.author.id !== nizar) {
      return;
    } else {

const embed = new Discord.MessageEmbed()
  .setTitle('Blacklist Users')
  .setColor('2f3136'); 

db.all().forEach((data) => {
  const key = data.ID;
  if (key.startsWith('sccblack_')) {
    const userId = key.split('_')[1];
    const user = client.users.cache.get(userId);
    if (user) {
      embed.addField(`${user.username}\n${user.id}`);
    }
  }
});
message.channel.send(embed);
      
    }
  }
});

client.on('message' , message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
  if(message.content === guildPrefix + 'premiumuser') {
    if (message.author.id !== adam) {
      return;
    } else {

const embed = new Discord.MessageEmbed()
  .setTitle('Premium Users')
  .setColor('2f3136'); 

db.all().forEach((data) => {
  const key = data.ID;
  if (key.startsWith('sccprem_')) {
    const userId = key.split('_')[1];
    const user = client.users.cache.get(userId);
    if (user) {
      embed.addField(`${user.username}\n${user.id}`);
    }
  }
});
message.channel.send(embed);
      
    }
  }
});

client.on('message' , message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
  if(message.content === guildPrefix + 'blacklistuser') {
if (message.author.id !== adam) {
      return;
    } else {

const embed = new Discord.MessageEmbed()
  .setTitle('Blacklist Users')
  .setColor('2f3136'); 

db.all().forEach((data) => {
  const key = data.ID;
  if (key.startsWith('sccblack_')) {
    const userId = key.split('_')[1];
    const user = client.users.cache.get(userId);
    if (user) {
      embed.addField(`${user.username}\n${user.id}`);
    }
  }
});
message.channel.send(embed);
      
    }
  }
});

/////// Commands

client.on("message", (message) => {
  const guildPrefix = getGuildPrefix(message.guild.id);
  let blacklist = db.get(`sccblack_${message.author.id}.reason`)
    if (blacklist) {
        return
    } else {
  if (message.mentions.has(client.user)) {
    message.channel.send(`My prefix is: ${guildPrefix}`);
  }}
});

client.on('message', message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
  let premium = db.get(`sccprem_${message.author.id}`)
    if (!premium) {
        return
    } else {
  if (message.author.bot) return; 
  if (!message.content.startsWith(guildPrefix)) return; 

  const args = message.content.slice(guildPrefix.length).trim().split(' ');
  const command = args.shift().toLowerCase();

  if (command === 'marry') {
    const targetUser = message.mentions.users.first();
    if (!targetUser) {
      return message.channel.send(`**${message.author.username}** Please mention a user to marry.`);
    }

    if (targetUser.bot) {
      return message.channel.send(`**${message.author.username}** You can't marry a bot!`);
    }

    const filter = (response) => {
      return response.author.id === targetUser.id;
    };

    message.channel.send(`**${targetUser.username}**, do you want to marry **${message.author.username}**? Reply with "yes" or "no".`);

    message.channel
      .awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
      .then((collected) => {
        const response = collected.first().content.toLowerCase();
        if (response === 'yes') {
          db.set(`marriage_${message.author.id}`, targetUser.id);
          db.set(`marriage_${targetUser.id}`, message.author.id);
          message.channel.send(`Congratulations! **${message.author.username}** and **${targetUser.username}** are now married.`);
        } else if (response === 'no') {
          message.channel.send(`**${message.author}** declined the marriage proposal.`);
        } else {
          message.channel.send(`**Invalid response**. Please reply with either "yes" or "no".`);
        }
      })
      .catch(() => {
        message.channel.send('No response received. Marriage proposal **cancelled**.');
      });
  }

  if (command === 'divorce') {
    const marriedUserID = db.get(`marriage_${message.author.id}`);
    if (!marriedUserID) {
      return message.channel.send(`**${message.author.username}** You are not married to anyone.`);
    }

    const marriedUser = client.users.cache.get(marriedUserID);
    if (!marriedUser) {
      return message.channel.send(`**${message.author.username}** The user you were married to is no longer in the server.`);
    }

    const filter = (response) => {
      return response.author.id === message.author.id;
    };

    message.channel.send(`**${message.author.username}**, are you sure you want to divorce **${marriedUser.username}**? Reply with "yes" or "no".`);

    message.channel
      .awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
      .then((collected) => {
        const response = collected.first().content.toLowerCase();
        if (response === 'yes') {
          
          db.delete(`marriage_${message.author.id}`);
          db.delete(`marriage_${marriedUser.id}`);
          message.channel.send(`**${message.author.username}** You are now divorced from **${marriedUser.username}**.`);
        } else if (response === 'no') {
          message.channel.send(`**${message.author.username}** Divorce cancelled. You are still married to **${marriedUser.username}**.`);
        } else {
          message.channel.send(`Invalid response. Please reply with either "yes" or "no".`);
        }
      })
      .catch(() => {
        message.channel.send('No response received. Divorce **cancelled**.');
      });
  }
}});


client.on('message' , message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
    if(message.content.startsWith(guildPrefix + "help")) {
  
  let blacklist = db.get(`sccblack_${message.author.id}.reason`)
    if (blacklist) {
        return
    } else {
      const embed = new MessageEmbed()
			.setColor("2f3136")
    .setFooter(`Requested By ${message.author.username}`, `${message.author.avatarURL()}`)
    .setTimestamp()
    .setDescription(`ㅤㅤㅤㅤㅤㅤㅤ[__**List of all available commands**__](https://discord.com/oauth2/authorize?client_id=899760741186424862&permissions=8&scope=bot%20applications.commands)ㅤㅤㅤ ㅤ\n\n
                    <:reply:1224126721071120425> Commands :
                    ${guildPrefix}server - \`Display server info.\`
                    ${guildPrefix}clear - \`Delete chat message , you can't delete more than 100 !\`
                    ${guildPrefix}servericon - \`Display server icon.\`
                    ${guildPrefix}avatar - \`Display user avatar.\`
                    ${guildPrefix}banner - \`Display user banner.\`
                    ${guildPrefix}support - \`Get our support server.\`
                    ${guildPrefix}invite - \`Get bot invite link.\`
                    ${guildPrefix}credits - \`Show your credits ammount.\`
                    ${guildPrefix}daily - \`Get a random ammound of creedits.\`
                    ${guildPrefix}transfer @user amount- \`Transfer credits to someone.\`
                    ${guildPrefix}snipe - \`Display the last deleted message.\`
                    ${guildPrefix}roleinfo - \`Get role information.\`
                    ${guildPrefix}guilds - \`Display guilds count.\`
                    ${guildPrefix}lock - \`Lock a channel\`
                    ${guildPrefix}unlock - \`Unlock a locked channel\`
                    ${guildPrefix}move - \`Move a user to a voice channel\`
                    ${guildPrefix}ping - \`Bot ping\`
                    ${guildPrefix}info @user - \`User info\`
                    ${guildPrefix}ban @user- \`Ban user.\`
                    ${guildPrefix}unban userID - \`Unban user.\`
                    ${guildPrefix}kick @user- \`Kick.\`
                    ${guildPrefix}marry @user - \`Premium only.\`
                    ${guildPrefix}divorce - \`Premium only.\`
                    ${guildPrefix}blacklist - \`Owner only.\`
                    ${guildPrefix}whitelist - \`Owner only.\`
                    ${guildPrefix}addprem - \`Owner only.\`
                    ${guildPrefix}removeprem - \`Owner only.\`
                    ${guildPrefix}-info - \`Owner only.\`
                    ${guildPrefix}blacklistuser - \`Owner only.\`
                    ${guildPrefix}premiumuser - \`Owner only.\`
                    `);
		
				let row1 = new disbut.MessageButton()
  					.setLabel('Support')
  					.setStyle('url')
					.setURL("https://discord.gg/jpCmvBt5Hv")
		

				let row2 = new disbut.MessageButton()
 					 .setLabel('Invite')
 					 .setStyle('url')
 					 .setURL("https://discord.com/oauth2/authorize?client_id=899760741186424862&permissions=8&scope=bot%20applications.commands")

        let row3 = new disbut.MessageButton()
          .setLabel('Dashboard!')
          .setStyle('url') 
          .setURL("https://0b48b991-287d-49d5-8252-488df2ce5f58-00-2ulo3arbnboq3.kirk.replit.dev/") 
          

			 message.channel.send(embed, { buttons: [row1 , row2 , row3]});
    }
}
})




client.on('message', message => {
    if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
  if (message.content === guildPrefix + 'banner') {

    const axios = require("axios");
    
    
    const user = message.mentions.users.first()
if(!user) return

axios
      .get(`https://discord.com/api/users/${user.id}`, {
          headers: {
              Authorization: `Bot ${process.env.token}`,
            },
        })
        .then((res) => {
          const { banner, accent_color } = res.data;
          
          if(banner) {
            const extension = banner.startsWith("a_") ? ".gif" : ".png";
            const url = `https://cdn.discordapp.com/banners/${user.id}/${banner}${extension}?size=2048`
            
            const embed = new Discord.MessageEmbed()
            .setAuthor(`${message.author.username}`, message.author.avatarURL({ dynamic: true }))
              .setDescription(`[**Banner Link**](${url})\n:reply:Hey, **${message.author.username}**, its cool right?`)
            .setImage(`${url}`)
            .setColor("2f3136")
            .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({ size: 4096, dynamic: true}))
	    
	    let bannerlink = new disbut.MessageButton()
		 .setLabel('Banner Link!')
 		 .setStyle('url')
		 .setURL(`${url}`)

            message.reply(embed , { buttons: [bannerlink] })
          } else {
             message.reply(`**${user}** , don't have banner!`)
          }
      })
  }
})

client.on('message', message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
  if (message.content === guildPrefix + 'banner') {
    let blacklist = db.get(`sccblack_${message.author.id}.reason`)
    if (blacklist) {
        return
    } else {
      const axios = require("axios");
      axios
      .get(`https://discord.com/api/users/${message.author.id}`, {
          headers: {
              Authorization: `Bot ${process.env.token}`,
            },
        })
        .then((res) => {
          const { banner, accent_color } = res.data;
        
          if(banner) {
            const extension = banner.startsWith("a_") ? ".gif" : ".png";
            const url2 = `https://cdn.discordapp.com/banners/${message.author.id}/${banner}${extension}?size=2048`
            
            const embed = new Discord.MessageEmbed()
            
            .setAuthor(`${message.author.username}`, message.author.avatarURL({ dynamic: true }))
              .setDescription(`[**Banner Link**](${url2})\n<:reply:977197754822557756> Hey, **${message.author.username}**, its cool right?`)
            .setImage(`${url2}`)
            .setColor("2f3136")
            .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({ size: 4096, dynamic: true}))

            let bannerlink2 = new disbut.MessageButton()
  .setLabel('Banner Link!')
  .setStyle('url')
  .setURL(`${url2}`)

            message.reply(embed , { buttons: [bannerlink2] })
          } else {
             message.channel.send(` <@${message.author.id}>, You don't have a banner!`)
          }
      })
    }
  }
})



client.on('message', message => {
    if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
  if (message.content === guildPrefix + 'unlock') {
      
    let blacklist = db.get(`sccblack_${message.author.id}.reason`)
    if (blacklist) {
        return
    } else {
      if (!message.member.hasPermission("MANAGE_CHANNELS")) return
      let everyone = message.guild.roles.cache.find(m => m.name === '@everyone');
      message.channel.createOverwrite(everyone, {
          SEND_MESSAGES: true,
          VIEW_CHANNEL : false,
      })
      message.channel.send(` **🔒 <#${message.channel.id}> has been unlocked.**  `)
    }
  }
}); 

client.on('message', message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
  if (message.content === guildPrefix + 'lock') {
    
  let blacklist = db.get(`sccblack_${message.author.id}.reason`)
    if (blacklist) {
        return
    } else {
      if (!message.member.hasPermission("MANAGE_CHANNELS")) return
    let everyone = message.guild.roles.cache.find(m => m.name === '@everyone');
    message.channel.createOverwrite(everyone, {
        SEND_MESSAGES: false,
        VIEW_CHANNEL : false,
    })
    message.channel.send("**🔒 this channel has been locked.** ");
    }
}
});

client.on('message', async message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);

  if (message.content.startsWith(guildPrefix + 'ban')) {
    if (!message.member.hasPermission('BAN_MEMBERS')) {
      return message.channel.send(` **<@${message.author.id}>**, You don't have permission to use this command.`);
    }

    const userToBan = message.mentions.users.first();
    if (!userToBan) {
      return message.channel.send(`**<@${message.author.id}>**, Please mention the user you want to ban.`);
    }

    try {
      await message.guild.members.ban(userToBan);
      message.channel.send(`Successfully banned ${userToBan.tag}`);
    } catch (error) {
      console.error(error);
      message.channel.send(`**<@${message.author.id}>**, An error occurred while trying to ban the user.`);
    }
  }
});

client.on('message', async message => {
  if (!message.guild) {
    return;
  }

  const guildPrefix = getGuildPrefix(message.guild.id);

  if (message.content.startsWith(guildPrefix + 'unban')) {
    if (!message.member.hasPermission('BAN_MEMBERS')) {
      return message.channel.send(`**<@${message.author.id}>**, You don't have permission to use this command.`);
    }

    const args = message.content.slice(guildPrefix.length + 'unban'.length).trim().split(/ +/);
    if (args.length !== 2) {
      return message.channel.send(`**<@${message.author.id}>**, Please provide the user's ID to unban.`);
    }

    const userId = args[1];
    
    try {
      await message.guild.members.unban(userId);
      message.channel.send(`Successfully unbanned user with ID ${userId}`);
    } catch (error) {
      console.error(error);
      message.channel.send(`**<@${message.author.id}>**, An error occurred while trying to unban the user.`);
    }
  }
});

client.on('message', async message => {
  if (!message.guild) {
    return;
  }

  const guildPrefix = getGuildPrefix(message.guild.id);

  if (message.content.startsWith(guildPrefix + 'kick')) {
    if (!message.member.hasPermission('KICK_MEMBERS')) {
      return message.channel.send(`**<@${message.author.id}>**, You don't have permission to use this command.`);
    }

    const userToKick = message.mentions.members.first();
    if (!userToKick) {
      return message.channel.send(`**<@${message.author.id}>**, Please mention the user you want to kick.`);
    }

    if (!userToKick.kickable) {
      return message.channel.send(`**<@${message.author.id}>**, I cannot kick this user.`);
    }

    try {
      await userToKick.kick();
      message.channel.send(`Successfully kicked ${userToKick.user.tag}`);
    } catch (error) {
      console.error(error);
      message.channel.send(`**<@${message.author.id}>**, An error occurred while trying to kick the user.`);
    }
  }
});

client.on('message', message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
if (message.content === guildPrefix + 'guilds') {
  let blacklist = db.get(`sccblack_${message.author.id}.reason`)
    if (blacklist) {
        return
    } else {
      message.reply(`**${client.guilds.cache.size} guild** `)
    }
}
})

client.on("message", message => {
if (message.channel.type === 'dm') {
  const developer = client.users.cache.find(y => y.id === '764447645673455616')
if (message.author.bot) return
if (message.content.length == 0) return
let embed = new Discord.MessageEmbed()
  .setTitle('NEW MESSAGE IN DM')
  .setColor("2f3136")
  .setAuthor(message.author.tag , message.author.avatarURL({dynamic: true}))
  .setFooter(client.user.username , client.user.avatarURL({dynamic: true}))
  .setTimestamp()
  .addField(`Message :`, ` \`\`\`\n- ${message.content} \`\`\` `)
developer.send(`**Message By : ${message.author}**\n**ID : ${message.author.id}**`,embed)
}
})

client.on('message', message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
  if (message.content === guildPrefix + 'ping') {
    let blacklist = db.get(`sccblack_${message.author.id}.reason`)
    if (blacklist) {
        return
    } else {
      message.reply(` ${client.ws.ping}📶 `)
    }
  }
})


client.on('messageDelete', message => {
if (message.attachments.first()) {
  snipes.set(message.channel.id, message, message.attachments.first().proxyURL)
}
snipes.set(message.channel.id, message)
})

client.on('message', message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
if (message.content.startsWith(guildPrefix + 'snipe')) {
  
  let blacklist = db.get(`sccblack_${message.author.id}.reason`)
    if (blacklist) {
        return
    } else {
      let user = message.mentions.users.first();
  var men = message.mentions.users.first();
  var heg;
if(men) {
     heg = men
} else {
     heg = message.author
}
  let sniped = snipes.get(message.channel.id)
  if (!sniped) return message.channel.send('**'+ message.author.username + `**noting deleted in**${message.channel}**` )
  const embed = new Discord.MessageEmbed()
    .setAuthor(`${sniped.author.tag}`, sniped.author.displayAvatarURL({ dynamic: true }))
    .setColor('2f3136')
    .setDescription(`**Deleted Message : **${sniped.content}`)    
    .setImage('https://media.discordapp.net/attachments/634854460102803456/803970383761244201/Genny_style.png')
    .setFooter(`${message.author.username}`)
    .setTimestamp()
    .setThumbnail(heg.avatarURL());
  if (sniped.attachments.first()) embed.setImage(sniped.attachments.first().proxyURL || null)
  let Btn = new disbut.MessageButton()
         .setStyle('red')
         .setEmoji('1125530206740955146')
         .setID('Btn')
   message.channel.send(embed, { buttons: [Btn]});
    }
}
})


client.on('clickButton', async b => {
let blacklist = db.get(`sccblack_${b.message.author.id}.reason`)
    if (blacklist) {
        return
    } else {
      if(b.id === 'Btn') {
        b.message.delete()
    }
    }
})

client.on('message', async message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
if(message.content === guildPrefix + 'server') {
  let blacklist = db.get(`sccblack_${message.author.id}.reason`)
    if (blacklist) {
        return
    } else {
      let text = message.guild.channels.cache.filter(text => text.type === 'text').size;
    let voice = message.guild.channels.cache.filter(voice => voice.type === 'voice').size;
    let online = message.guild.members.cache.filter(online => online.presence.status === 'online').size;
    let Embed = new Discord.MessageEmbed()
       .setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
       .setColor('2f3136')
       .addField(':calendar: Created On', `**<t:${parseInt(message.guild.createdAt / 1000)}:R>**`, true)
       .addField(':crown: Owned by', message.guild.owner, true)
       .addField(`:busts_in_silhouette: Members (${message.guild.memberCount})`, `**${online}** Online`, true)
       .addField(`:speech_balloon: Channels (${message.guild.channels.cache.size})`, `**${text}** Text | **${voice}** Voice`, true)
      .setTimestamp()
      .setFooter(message.author.username, message.author.displayAvatarURL({ dynamic: true }))  
       .setThumbnail(message.guild.iconURL({ dynamic: true }))
      message.channel.send(Embed)
    }
}
})

client.on("message", async message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
  let command = message.content.toLowerCase().split(" ")[0];
  command = command.slice(guildPrefix.length);
  if (command == "clear") {
      
      
    let blacklist = db.get(`sccblack_${message.author.id}.reason`)
    if (blacklist) {
        return
    } else {
      message.delete({ timeout: 0 })
      if (!message.channel.guild) return message.reply(`** :x: | Something Wrong !**`);
      if (!message.member.hasPermission('MANAGE_GUILD')) return message.channel.send(`:x: ** | You don't have unsufisant permssion **`);
      if (!message.guild.member(client.user).hasPermission('MANAGE_GUILD')) return message.channel.send(`:x: **| I don't have unsufisant permssion**`);
      let args = message.content.split(" ").slice(1)
      let messagecount = parseInt(args);
      if (args > 100) return message.channel.send(
          new Discord.MessageEmbed()
          .setDescription(`\`\`\`js
i cant delete more than 100 messages 
\`\`\``)
      ).then(messages => messages.delete({ timeout: 5000 }))
      if (!messagecount) messagecount = '100';
      message.channel.messages.fetch({ limit: 100 }).then(messages => message.channel.bulkDelete(messagecount)).then(msgs => {
          message.channel.send(
                  (`\`\`\`js
${msgs.size} messages cleared
\`\`\``)
          ).then(messages =>
              messages.delete({ timeout: 5000 }));
    
})}}});

client.on('message', async message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
if(message.content.startsWith(guildPrefix + 'servericon')) {
     
  let blacklist = db.get(`sccblack_${message.author.id}.reason`)
    if (blacklist) {
        return
    } else {
      const AvatarURL = message.guild.iconURL({ size: 4096, dynamic: true })
    let ServerAvatar = new Discord.MessageEmbed()
      .setColor('2f3136')
      .setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
      .setDescription(`[**Avatar Link**](${AvatarURL}) \n 
<:reply:1224126721071120425> Hey, **${message.author.username}**, its cool right?`)
      .addField("ㅤ",`[\**JPEG**\](${AvatarURL})`, true)
      .addField("ㅤ",`[\**PNG**\](${AvatarURL})`, true)
      .addField("ㅤ",`[\**WEBP**\](${AvatarURL})`, true)
      .setImage(message.guild.iconURL({ size: 4096, dynamic: true}))
      .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }))
    
	    let serverlink = new disbut.MessageButton()
		   .setLabel('Server Icon Link!')
 		   .setStyle('url')
		   .setURL(`${AvatarURL}`)
	    
      message.channel.send(ServerAvatar , { buttons: [serverlink] })
    }
    
}
})

client.on('message',async message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
if(message.content.startsWith(guildPrefix + "avatar")) {
      
  let blacklist = db.get(`sccblack_${message.author.id}.reason`)
    if (blacklist) {
        return
    } else {
      let args = message.content.split(" ").slice(1).join(" ");   
 let member = message.mentions.users.first() || message.author
  let avatar = member.displayAvatarURL ({size: 4096, dynamic: true, format: 'png'});
    const embed = new Discord.MessageEmbed()
      .setAuthor(`${member.tag}`, message.author.avatarURL({ dynamic: true }))
.setColor('2f3136')
.setDescription(`[**Avatar Link**](${avatar})
<:reply:1224126721071120425> Hey, **${message.author.username}**, its cool right?`)
.addField("ㅤ",`[\**JPEG**\](${member.displayAvatarURL({format: "jpg"})})`, true)
.addField("ㅤ",`[\**PNG\**](${member.displayAvatarURL({format: "png"})})`, true)
.addField("ㅤ",`[\**WEBP\**](${member.displayAvatarURL({format: "webp"})})`, true)
.setFooter(`Requested by ${message.author.tag}`, message.author.avatarURL({ dynamic: true }))
.setImage(avatar);
	    
	    let avatarlink = new disbut.MessageButton()
		   .setLabel('Avatar Link!')
 		   .setStyle('url')
		   .setURL(`${avatar}`)
	    
      message.channel.send(embed , { buttons: [avatarlink] });
    }
}}) 



client.on('message', message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
if(message.content.startsWith(guildPrefix + "support")) {
  let blacklist = db.get(`sccblack_${message.author.id}.reason`)
  if (blacklist) {
      return message.channel.send(message.author.username + `, You are blacklisted from using command if you want more info join our support server : https://discord.gg/jpCmvBt5Hv`)
  } else {
    message.channel.send("https://discord.gg/jpCmvBt5Hv");
  }
    
  }
})

client.on('message', message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
if(message.content.startsWith(guildPrefix + "invite")) {
    
    
  let blacklist = db.get(`sccblack_${message.author.id}.reason`)
    if (blacklist) {
        return
    } else {
      message.channel.send("https://discord.com/oauth2/authorize?client_id=899760741186424862&permissions=8&scope=bot%20applications.commands");
    }
  }
})



client.on("message",message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
if(message.content.startsWith(guildPrefix + "credit")){
  
  let blacklist = db.get(`sccblack_${message.author.id}.reason`)
    if (blacklist) {
        return
    } else {
      let args = message.content.substring(guildPrefix.length).split(" ");
    const user = message.mentions.users.first()
    if (!user && !args[1]) {
  if (db.get(`sccredit_${message.author.id}`) === null) 
db.set(`sccredit_${message.author.id}`,{credit:0})
let credit = db.get(`sccredit_${message.author.id}.credit`)
if (credit === null) credit = 0; 
message.channel.send(`:bank: ** ${message.author.username}** `+ ', your card balance is`' + `$${credit}`+ '` ! ')
    }
    if (user) {
      if (user.bot) return message.channel.send(":x:  **|** Bot don't have credits.");
      if (db.get(`sccredit_${user.id}`) === null);
       let creditu = 
        db.get(`sccredit_${user.id}.credit`)
     if (creditu === null) creditu = 0; 
message.channel.send(`:bank: ** ${message.author.username}** `+ ', your card balance is`' + `$${creditu}`+ '` ! ')
    }
    }
}
})

client.on("message",message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
if(message.content.startsWith(guildPrefix + "daily")){
  
  let blacklist = db.get(`sccblack_${message.author.id}.reason`)
    if (blacklist) {
        return
    } else {
      const cdtime = 86400 
if(cooldown.has(message.author.id)){
return message.channel.send("⌛ ** | Please wait 1 day**")
}
cooldown.add(message.author.id)
setTimeout(() => {
cooldown.delete(message.author.id)
}, cdtime * 1000)
  let random = Math.floor(Math.random() * (3000-6000) + 6000)
  db.add(`sccredit_${message.author.id}.credit`,random)
  message.channel.send('💰' + ` **${message.author.username}**`+', your balance was charged by $`' + `${random}`+ '` credits.')
    }
}
})

client.on("message",message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
if(message.content.startsWith(guildPrefix + "transfer")){

  let blacklist = db.get(`sccblack_${message.author.id}.reason`)
    if (blacklist) {
        return
    } else {
      let args = message.content.split(' ').slice(1)
  const user = message.mentions.users.first()
  let number = message.content.split(" ").slice(2).join(" ");
      if(!user) return 
  if (user.bot) return message.channel.send(":x: ** |** Bot don't have credit.");
  if (user.id === message.author.id) {
    return message.channel.send(`❌ ** | ${message.author.username}**, you can't transfer money to yourself!`)
}
  if(!number) return

 let member = db.fetch(`sccredit_${message.author.id}.credit`)
 
  if (member < args[1]) {
            return message.channel.send(`:x: ** |** You don't have credits.`)
        }

  db.add(`sccredit_${user.id}.credit`,number)
  db.subtract(`sccredit_${message.author.id}.credit`,number)

  message.channel.send(`**:moneybag:  ${message.author.username}**,` + ' has transferred `' + `$${number}` + '` to ' + `**<@${user.id}>**`) 
  user.send(`You have received **$${number}** from ** ${message.author.username} **(ID: ${message.author.id})`)
    }
}
})


client.on('message', async message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
  if(message.content.startsWith(guildPrefix + 'info')) {
      
    let blacklist = db.get(`sccblack_${message.author.id}.reason`)
    if (blacklist) {
        return
    } else {
      const args = message.content.slice(guildPrefix.length).trim().split(/ +/g); 
      const user = await message.mentions.members.first() || await message.guild.members.cache.get(args[0])
      const member = message.member;
      if(!member) return;
   
      let EmbedOne = new MessageEmbed()
        .setColor('2f3136')
        .addField('**Joined Discord**',  `**<t:${parseInt(message.author.createdAt / 1000)}:R>**`, true)
        .addField('**Joined Server**', `**<t:${parseInt(member.joinedAt / 1000)}:R>**`, true)
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setFooter(message.author.username, message.author.displayAvatarURL({ dynamic: true }))

      if(!user) return await message.channel.send(EmbedOne)

      let EmbedTwo = new MessageEmbed()
        .setColor('2f3136')
        .addField('**Joined Discord**', `**<t:${parseInt(user.user.createdAt / 1000)}:R>**`, true)
        .addField('**Joined Server**', `**<t:${parseInt(user.joinedAt / 1000)}:R>**`, true)
        .setThumbnail(user.user.displayAvatarURL({ dynamic: true }))
        .setFooter(user.user.username, user.user.displayAvatarURL({ dynamic: true }))

      if(user) return message.channel.send(EmbedTwo)
    }
  }
})

client.on('message', async message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
if(message.content.startsWith(guildPrefix + 'roleinfo')) {
    
  let blacklist = db.get(`sccblack_${message.author.id}.reason`)
    if (blacklist) {
        return
    } else {
      if(!message.guild) return
    var role = message.mentions.roles.first();
    if(!role) return

    var RoleAdministrator = ('True')

    if(!role.permissions.has('ADMINISTRATOR')) { RoleAdministrator = 'False'}

    var embed = new Discord.MessageEmbed()
        .setColor('2f3136')
        .setAuthor(message.author.username , message.author.displayAvatarURL({dynamic:true}))
        .addField('**Role Name**',`${role.name}`,true)
        .addField('**Role Color**', `${role.hexColor}`,true)
        .addField('**Role Created at**',`${role.createdAt.toUTCString()}`,true)
        .addField('**Role Member**',`${role.members.array().length}`,true)
        .addField('**Role Permission**',`${role.permissions.toArray().length}`,true)
        .addField('**Role Administrator**',`${RoleAdministrator}`,true)
        .setTimestamp()
  .setFooter(`Requested by ${message.author.tag}`, message.author.avatarURL({ dynamic: true }))
     message.channel.send(embed)
    }
}
})


////////////   log    \\\\\\\\\
  
client.on('message', message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
    if (!message.content.startsWith(guildPrefix) || message.author.bot) return;
    const channellog = client.channels.cache.find(channel => channel.id === "1223428976714977320");
    const args = message.content.slice(guildPrefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();
  
    if (command === 'help') {
      if (!args.length) {
        
        return channellog.send("**" + message.author.username + "**" + " used  **-help** in (**" + message.guild.name + "**)");
      }
      channellog.send("**" + message.author.username + "**" + " used  **-help** in (**" + message.guild.name + "**)" + `\nㅤㅤㅤArguments : ${args}`);
    }
  });  

  client.on('message', message => {
    if (!message.guild) {
    return;
  }
    const guildPrefix = getGuildPrefix(message.guild.id);
    if (!message.content.startsWith(guildPrefix) || message.author.bot) return;
    const channellog = client.channels.cache.find(channel => channel.id === "1223428976714977320");
    const args = message.content.slice(guildPrefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();
  
    if (command === 'ping') {
      if (!args.length) {
        
        return channellog.send("**" + message.author.username + "**" + " used  **-ping** in (**" + message.guild.name + "**)");
      }
      channellog.send("**" + message.author.username + "**" + " used  **-ping** in (**" + message.guild.name + "**)" + `\nㅤㅤㅤArguments : ${args}`);
    }
  });  

 client.on('message', message => {
   if (!message.guild) {
    return;
  }
   const guildPrefix = getGuildPrefix(message.guild.id);
    if (!message.content.startsWith(guildPrefix) || message.author.bot) return;
    const channellog = client.channels.cache.find(channel => channel.id === "1223428976714977320");
    const args = message.content.slice(guildPrefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();
  
    if (command === 'info') {
      if (!args.length) {
        
        return channellog.send("**" + message.author.username + "**" + " used  **-info** in (**" + message.guild.name + "**)");
      }
      channellog.send("**" + message.author.username + "**" + " used  **-info** in (**" + message.guild.name + "**)" + `\nㅤㅤㅤArguments : ${args}`);
    }
  });

  client.on('message', message => {
    if (!message.guild) {
    return;
  }
    const guildPrefix = getGuildPrefix(message.guild.id);
    if (!message.content.startsWith(guildPrefix) || message.author.bot) return;
    const channellog = client.channels.cache.find(channel => channel.id === "1223428976714977320");
    const args = message.content.slice(guildPrefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();
  
    if (command === 'snipe') {
      if (!args.length) {
        
        return channellog.send("**" + message.author.username + "**" + " used  **-snipe** in (**" + message.guild.name + "**)");
      }
      channellog.send("**" + message.author.username + "**" + " used  **-snipe** in (**" + message.guild.name + "**)" + `\nㅤㅤㅤArguments : ${args}`);
    }
  }); 

  client.on('message', message => {
    if (!message.guild) {
    return;
  }
    const guildPrefix = getGuildPrefix(message.guild.id);
    if (!message.content.startsWith(guildPrefix) || message.author.bot) return;
    const channellog = client.channels.cache.find(channel => channel.id === "1223428976714977320");
    const args = message.content.slice(guildPrefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();
  
    if (command === 'server') {
      if (!args.length) {
        
        return channellog.send("**" + message.author.username + "**" + " used  **-server** in (**" + message.guild.name + "**)");
      }
      channellog.send("**" + message.author.username + "**" + " used  **-server** in (**" + message.guild.name + "**)" + `\nㅤㅤㅤArguments : ${args}`);
    }
  }); 

client.on('message', message => {
  if (!message.guild) {
    return;
  }
    if (message.content === '🧍‍♀️') {
      
      message.channel.send("🧍‍♂️");
    }
  })

client.on('message', message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
    if (!message.content.startsWith(guildPrefix) || message.author.bot) return;
    const channellog = client.channels.cache.find(channel => channel.id === "1223428976714977320");
    const args = message.content.slice(guildPrefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();
  
    if (command === 'clear') {
      if (!args.length) {
        
        return channellog.send("**" + message.author.username + "**" + " used  **-clear** in (**" + message.guild.name + "**)");
      }
      channellog.send("**" + message.author.username + "**" + " used  **-clear** in (**" + message.guild.name + "**)" + `\nㅤㅤㅤArguments : ${args}`);
    }
  });

  client.on('message', message => {
    if (!message.guild) {
    return;
  }
    const guildPrefix = getGuildPrefix(message.guild.id); 
    if (!message.content.startsWith(guildPrefix) || message.author.bot) return;
    const channellog = client.channels.cache.find(channel => channel.id === "1223428976714977320");
    const args = message.content.slice(guildPrefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();
  
    if (command === 'servericon') {
      if (!args.length) {
        
        return channellog.send("**" + message.author.username + "**" + " used  **-servericon** in (**" + message.guild.name + "**)");
      }
      channellog.send("**" + message.author.username + "**" + " used  **-servericon** in (**" + message.guild.name + "**)" + `\nㅤㅤㅤArguments : ${args}`);
    }
  }); 

client.on('message', message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
    if (message.content === guildPrefix + 'guilds') {
      const channellog = client.channels.cache.find(channel => channel.id === "1223428976714977320");
      channellog.send("**" + message.author.username + "**" + " running  **-guilds** in (**" + message.guild.name + "**)" );
    }
  })

client.on('message', message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
    if (!message.content.startsWith(guildPrefix) || message.author.bot) return;
    const channellog = client.channels.cache.find(channel => channel.id === "1223428976714977320");
    const args = message.content.slice(guildPrefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();
  
    if (command === 'avatar') {
      if (!args.length) {
        
        return channellog.send("**" + message.author.username + "**" + " used  **-avatar** in (**" + message.guild.name + "**)");
      }
      channellog.send("**" + message.author.username + "**" + " used  **-avatar** in (**" + message.guild.name + "**)" + `\nㅤㅤㅤArguments : ${args}`);
    }
  });

  client.on('message', message => {
    if (!message.guild) {
    return;
  }
    const guildPrefix = getGuildPrefix(message.guild.id);
    if (!message.content.startsWith(guildPrefix) || message.author.bot) return;
    const channellog = client.channels.cache.find(channel => channel.id === "1223428976714977320");
    const args = message.content.slice(guildPrefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();
  
    if (command === 'support') {
      if (!args.length) {
        
        return channellog.send("**" + message.author.username + "**" + " used  **-support** in (**" + message.guild.name + "**)");
      }
      channellog.send("**" + message.author.username + "**" + " used  **-support** in (**" + message.guild.name + "**)" + `\nㅤㅤㅤArguments : ${args}`);
    }
  }); 

client.on('message', message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
    if (message.content === guildPrefix + 'invite') {
      const channellog = client.channels.cache.find(channel => channel.id === "1223428976714977320");
      channellog.send("**" + message.author.username + "**" + " running  **-invite** in (**" + message.guild.name + "**)" );
    }
  })        

client.on('message', message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
    if (message.content === guildPrefix + 'blacklistuser') {
      const channellog = client.channels.cache.find(channel => channel.id === "1223428976714977320");
      channellog.send("**" + message.author.username + "**" + " running  **-blacklistuser** in (**" + message.guild.name + "**)" );
    }
  })  

client.on('message', message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
    if (message.content === guildPrefix + 'premiumuser') {
      const channellog = client.channels.cache.find(channel => channel.id === "1223428976714977320");
      channellog.send("**" + message.author.username + "**" + " running  **-premiumuser** in (**" + message.guild.name + "**)" );
    }
  })  

client.on('message', message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
    if (message.content === guildPrefix + 'info') {
      const channellog = client.channels.cache.find(channel => channel.id === "1223428976714977320");
      channellog.send("**" + message.author.username + "**" + " running  **--info** in (**" + message.guild.name + "**)" );
    }
  })  

client.on('message', message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
    if (!message.content.startsWith(guildPrefix) || message.author.bot) return;
    const channellog = client.channels.cache.find(channel => channel.id === "1223428976714977320");
    const args = message.content.slice(guildPrefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();
  
    if (command === 'marry') {
      if (!args.length) {
        
        return channellog.send("**" + message.author.username + "**" + " used  **-marry** in (**" + message.guild.name + "**)");
      }
      channellog.send("**" + message.author.username + "**" + " used  **-marry** in (**" + message.guild.name + "**)" + `\nㅤㅤㅤArguments : ${args}`);
    }
  });

client.on('message', message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
    if (!message.content.startsWith(guildPrefix) || message.author.bot) return;
    const channellog = client.channels.cache.find(channel => channel.id === "1223428976714977320");
    const args = message.content.slice(guildPrefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();
  
    if (command === 'divorce') {
      if (!args.length) {
        
        return channellog.send("**" + message.author.username + "**" + " used  **-divorce** in (**" + message.guild.name + "**)");
      }
      channellog.send("**" + message.author.username + "**" + " used  **-divorce** in (**" + message.guild.name + "**)" + `\nㅤㅤㅤArguments : ${args}`);
    }
  });

client.on('message', message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
    if (!message.content.startsWith(guildPrefix) || message.author.bot) return;
    const channellog = client.channels.cache.find(channel => channel.id === "1223428976714977320");
    const args = message.content.slice(guildPrefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();
  
    if (command === 'xo') {
      if (!args.length) {
        
        return channellog.send("**" + message.author.username + "**" + " used  **-xo** in (**" + message.guild.name + "**)");
      }
      channellog.send("**" + message.author.username + "**" + " used  **-xo** in (**" + message.guild.name + "**)" + `\nㅤㅤㅤArguments : ${args}`);
    }
  });

client.on('message', message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
    if (!message.content.startsWith(guildPrefix) || message.author.bot) return;
    const channellog = client.channels.cache.find(channel => channel.id === "1223428976714977320");
    const args = message.content.slice(guildPrefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();
  
    if (command === 'nick') {
      if (!args.length) {
        
        return channellog.send("**" + message.author.username + "**" + " used  **-nick** in (**" + message.guild.name + "**)");
      }
      channellog.send("**" + message.author.username + "**" + " used  **-nick** in (**" + message.guild.name + "**)" + `\nㅤㅤㅤArguments : ${args}`);
    }
  });
//////////////////
client.on('message', message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
    if (!message.content.startsWith(guildPrefix) || message.author.bot) return;
    const channellog = client.channels.cache.find(channel => channel.id === "1223428976714977320");
    const args = message.content.slice(guildPrefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();
  
    if (command === 'lock') {
      if (!args.length) {
        
        return channellog.send("**" + message.author.username + "**" + " used  **-banner** in (**" + message.guild.name + "**)");
      }
      channellog.send("**" + message.author.username + "**" + " used  **-banner** in (**" + message.guild.name + "**)" + `\nㅤㅤㅤArguments : ${args}`);
    }
  });

  client.on('message', message => {
    if (!message.guild) {
    return;
  }
    const guildPrefix = getGuildPrefix(message.guild.id);
    if (!message.content.startsWith(guildPrefix) || message.author.bot) return;
    const channellog = client.channels.cache.find(channel => channel.id === "1223428976714977320");
    const args = message.content.slice(guildPrefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();
  
    if (command === 'unlock') {
      if (!args.length) {
        
        return channellog.send("**" + message.author.username + "**" + " used  **-clear** in (**" + message.guild.name + "**)");
      }
      channellog.send("**" + message.author.username + "**" + " used  **-clear** in (**" + message.guild.name + "**)" + `\nㅤㅤㅤArguments : ${args}`);
    }
  });

  client.on('message', message => {
    if (!message.guild) {
    return;
  }
    const guildPrefix = getGuildPrefix(message.guild.id);
    if (!message.content.startsWith(guildPrefix) || message.author.bot) return;
    const channellog = client.channels.cache.find(channel => channel.id === "1223428976714977320");
    const args = message.content.slice(guildPrefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();
  
    if (command === 'roleinfo') {
      if (!args.length) {
        
        return channellog.send("**" + message.author.username + "**" + " used  **-roleinfo** in (**" + message.guild.name + "**)");
      }
      channellog.send("**" + message.author.username + "**" + " used  **-roleinfo** in (**" + message.guild.name + "**)" + `\nㅤㅤㅤArguments : ${args}`);
    }
  });  

 client.on('message', message => {
   if (!message.guild) {
    return;
  }
   const guildPrefix = getGuildPrefix(message.guild.id);
    if (!message.content.startsWith(guildPrefix) || message.author.bot) return;
    const channellog = client.channels.cache.find(channel => channel.id === "1223428976714977320");
    const args = message.content.slice(guildPrefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();
  
    if (command === 'credits') {
      if (!args.length) {
        
        return channellog.send("**" + message.author.username + "**" + " used  **-credits** in (**" + message.guild.name + "**)");
      }
      channellog.send("**" + message.author.username + "**" + " used  **-credits** in (**" + message.guild.name + "**)" + `\nㅤㅤㅤArguments : ${args}`);
    }
  });  

 client.on('message', message => {
   if (!message.guild) {
    return;
  }
   const guildPrefix = getGuildPrefix(message.guild.id);
    if (!message.content.startsWith(guildPrefix) || message.author.bot) return;
    const channellog = client.channels.cache.find(channel => channel.id === "1223428976714977320");
    const args = message.content.slice(guildPrefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();
  
    if (command === 'daily') {
      if (!args.length) {
        
        return channellog.send("**" + message.author.username + "**" + " used  **-daily** in (**" + message.guild.name + "**)");
      }
      channellog.send("**" + message.author.username + "**" + " used  **-daily** in (**" + message.guild.name + "**)" + `\nㅤㅤㅤArguments : ${args}`);
    }
  });  

 client.on('message', message => {
   if (!message.guild) {
    return;
  }
   const guildPrefix = getGuildPrefix(message.guild.id);
    if (!message.content.startsWith(guildPrefix) || message.author.bot) return;
    const channellog = client.channels.cache.find(channel => channel.id === "1223428976714977320");
    const args = message.content.slice(guildPrefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();
  
    if (command === 'transfer') {
      if (!args.length) {
        
        return channellog.send("**" + message.author.username + "**" + " used  **-transfer** in (**" + message.guild.name + "**)");
      }
      channellog.send("**" + message.author.username + "**" + " used  **-transfer** in (**" + message.guild.name + "**)" + `\nㅤㅤㅤArguments : ${args}`);
    }
  });  

 client.on('message', message => {
   if (!message.guild) {
    return;
  }
   const guildPrefix = getGuildPrefix(message.guild.id);
    if (!message.content.startsWith(guildPrefix) || message.author.bot) return;
    const channellog = client.channels.cache.find(channel => channel.id === "1223428976714977320");
    const args = message.content.slice(guildPrefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();
  
    if (command === 'ban') {
      if (!args.length) {
        
        return channellog.send("**" + message.author.username + "**" + " used  **-ban** in (**" + message.guild.name + "**)");
      }
      channellog.send("**" + message.author.username + "**" + " used  **-ban** in (**" + message.guild.name + "**)" + `\nㅤㅤㅤArguments : ${args}`);
    }
  });  

 client.on('message', message => {
   if (!message.guild) {
    return;
  }
   const guildPrefix = getGuildPrefix(message.guild.id);
    if (!message.content.startsWith(guildPrefix) || message.author.bot) return;
    const channellog = client.channels.cache.find(channel => channel.id === "1223428976714977320");
    const args = message.content.slice(guildPrefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();
  
    if (command === 'unban') {
      if (!args.length) {
        
        return channellog.send("**" + message.author.username + "**" + " used  **-unban** in (**" + message.guild.name + "**)");
      }
      channellog.send("**" + message.author.username + "**" + " used  **-unban** in (**" + message.guild.name + "**)" + `\nㅤㅤㅤArguments : ${args}`);
    }
  });  

 client.on('message', message => {
   if (!message.guild) {
    return;
  }
   const guildPrefix = getGuildPrefix(message.guild.id);
    if (!message.content.startsWith(guildPrefix) || message.author.bot) return;
    const channellog = client.channels.cache.find(channel => channel.id === "1223428976714977320");
    const args = message.content.slice(guildPrefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();
  
    if (command === 'kick') {
      if (!args.length) {
        
        return channellog.send("**" + message.author.username + "**" + " used  **-kick** in (**" + message.guild.name + "**)");
      }
      channellog.send("**" + message.author.username + "**" + " used  **-kick** in (**" + message.guild.name + "**)" + `\nㅤㅤㅤArguments : ${args}`);
    }
  });  

client.on('message', message => {
  if (!message.guild) {
    return;
  }
  const guildPrefix = getGuildPrefix(message.guild.id);
    if (!message.content.startsWith(guildPrefix) || message.author.bot) return;
    const channellog = client.channels.cache.find(channel => channel.id === "1223428976714977320");
    const args = message.content.slice(guildPrefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();
  
    if (command === 'banner') {
      if (!args.length) {
        
        return channellog.send("**" + message.author.username + "**" + " used  **-banner** in (**" + message.guild.name + "**)");
      }
      channellog.send("**" + message.author.username + "**" + " used  **-banner** in (**" + message.guild.name + "**)" + `\nㅤㅤㅤArguments : ${args}`);
    }
  });

client.on('message', message => {
  if (message.content.startsWith('-')) {
    const command = message.content.slice(1);
    const user = message.author.username;
    const timestamp = new Date().toISOString();

    logCommand(command, user, timestamp);

    if (command === 'testsheets') {
      message.reply(`${client.ws.ping}📶`);
    }
  }
});

function logCommand(command, user, timestamp) {
  const url = 'https://script.google.com/u/0/home/projects/1DjvVz29SBL0qk7YRDVCa-AJh1AGm4wObIlNuhIcychhTf5dfWeFW1r_a/edit';
  const data = {
    command: command,
    user: user,
    timestamp: timestamp
  };

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then(response => {
      if (response.ok) {
        console.log('Command logged successfully');
      } else {
        console.error('Failed to log command');
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

////////////////        Login       ////////
client.on("error", console.error);
client.on("warn", console.warn);

client.login(process.env.token)