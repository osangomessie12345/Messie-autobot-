module.exports.config = {
    name: "kick",
    version: "0.0.1",
    role: 2,
    credits: "Messie Osango",
    description: "Avertir un utilisateur, bannir, voir les avertissements",
    usages: "{p}kick [tag] [raison]",
    hasPrefix: false,
    cooldown: 5,
    info: [
        {
            key: '[tag] ou [réponse message] "raison"',
            prompt: '1er avertissement utilisateur',
            type: '',
            example: 'kick [tag] "raison pour avertissement"'
        },
        {
            key: 'listban',
            prompt: 'Voir la liste des utilisateurs bannis du groupe',
            type: '',
            example: 'kick listban'
        },
        {
            key: 'reset',
            prompt: 'Réinitialiser toutes les données dans votre groupe',
            type: '',
            example: 'kick reset'
        }
    ]
};

module.exports.run = async function({ api, args, Users, event, Threads, utils, client }) {
    let { messageID, threadID, senderID } = event;
    var info = await api.getThreadInfo(threadID);
    if (!info.adminIDs.some(item => item.id == api.getCurrentUserID())) return api.sendMessage('╭───────────────────╮\n│ Vous devez être administrateur pour utiliser cette commande.\n╰───────────────────╯', threadID, messageID);
    
    var fs = require("fs-extra");
    if (!fs.existsSync(__dirname + `/cache/bans.json`)) {
        const dataaa = { warns: {}, banned: {} };
        fs.writeFileSync(__dirname + `/cache/bans.json`, JSON.stringify(dataaa));
    }
    var bans = JSON.parse(fs.readFileSync(__dirname + `/cache/bans.json`));
    
    if (!bans.warns.hasOwnProperty(threadID)) {
        bans.warns[threadID] = {};
        fs.writeFileSync(__dirname + `/cache/bans.json`, JSON.stringify(bans, null, 2));
    }

    if (args[0] == "view") {
        var msg = "";
        if (!args[1]) {
            var mywarn = bans.warns[threadID][senderID];
            if (!mywarn) return api.sendMessage('╭───────────────────╮\n│ Vous n\'avez jamais été averti.\n╰───────────────────╯', threadID, messageID);
            var num = 1;
            for (let reasonwarn of mywarn) {
                msg += `${num}. ${reasonwarn}\n`;
                num++;
            }
            api.sendMessage(`╭───────────────────╮\n│ Avertissements de ${event.senderID}\n│ ${msg}\n╰───────────────────╯`, threadID, messageID);
        } else {
            var mentions = Object.keys(event.mentions);
            var message = "";
            for (let id of mentions) {
                var name = (await api.getUserInfo(id))[id].name;
                var mywarn = bans.warns[threadID][id];
                if (!mywarn) message += `⭐️ ${name} : Aucun avertissement.\n`;
                else {
                    var num = 1;
                    message += `⭐️ ${name} :\n`;
                    for (let reason of mywarn) {
                        message += `  ${num}. ${reason}\n`;
                        num++;
                    }
                }
            }
            api.sendMessage(`╭───────────────────╮\n│ Avertissements des utilisateurs\n│ ${message}\n╰───────────────────╯`, threadID, messageID);
        }
    } 
    else if (args[0] == "listban") {
        var mybox = bans.banned[threadID];
        var msg = "╭───────────────────╮\n│ Liste des bannis :\n";
        if (mybox.length === 0) {
            msg += "│ Aucun utilisateur banni.\n";
        } else {
            for (let iduser of mybox) {
                var name = (await api.getUserInfo(iduser))[iduser].name;
                msg += `│ - ${name} (ID: ${iduser})\n`;
            }
        }
        msg += "╰───────────────────╯";
        api.sendMessage(msg, threadID, messageID);
    } 
    else if (args[0] == "reset") {
        bans.warns[threadID] = {};
        bans.banned[threadID] = [];
        fs.writeFileSync(__dirname + `/cache/bans.json`, JSON.stringify(bans, null, 2));
        api.sendMessage("╭───────────────────╮\n│ Toutes les données du groupe ont été réinitialisées.\n╰───────────────────╯", threadID, messageID);
    } 
    else if (args[0] == "kick") {
        var reason = args.slice(1).join(" ");
        if (!reason) reason = "Aucune raison spécifiée.";

        if (event.type == "message_reply") {
            var iduser = event.messageReply.senderID;
            bans.warns[threadID][iduser] = bans.warns[threadID][iduser] || [];
            bans.warns[threadID][iduser].push(reason);
            api.removeUserFromGroup(iduser, threadID);
            api.sendMessage(`╭───────────────────╮\n│ ${iduser} a été averti pour :\n│ ${reason}\n╰───────────────────╯`, threadID, messageID);
        } else if (Object.keys(event.mentions).length !== 0) {
            var mentions = Object.keys(event.mentions);
            for (let id of mentions) {
                bans.warns[threadID][id] = bans.warns[threadID][id] || [];
                bans.warns[threadID][id].push(reason);
                api.removeUserFromGroup(id, threadID);
            }
            api.sendMessage(`╭───────────────────╮\n│ Utilisateur(s) banni(s) avec raison : ${reason}\n╰───────────────────╯`, threadID, messageID);
        }
        fs.writeFileSync(__dirname + `/cache/bans.json`, JSON.stringify(bans, null, 2));
    }
};
