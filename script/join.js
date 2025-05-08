const chalk = require('chalk');

module.exports.config = {
    name: "join",
    version: "1.0.1",
    permission: 2,
    credits: "Messie Osango",
    prefix: true,
    description: "Rejoindre les groupes où le bot se trouve.",
    category: "administration",
    premium: false,
    usages: "",
    cooldowns: 5
};

module.exports.handleReply = async function({ api, event, handleReply, Threads }) {
  var { threadID, messageID, senderID, body } = event;
  var { ID } = handleReply;

  if (!body || !parseInt(body)) return api.sendMessage('Votre sélection doit être un nombre.', threadID, messageID);
  if ((parseInt(body) - 1) > ID.length) return api.sendMessage("Votre choix n'est pas dans la liste.", threadID, messageID);
  
  try {
    var threadInfo = await Threads.getInfo(ID[body - 1]);
    var { participantIDs, approvalMode, adminIDs } = threadInfo;
    if (participantIDs.includes(senderID)) return api.sendMessage(`Vous êtes déjà membre de ce groupe.`, threadID, messageID);
    
    api.addUserToGroup(senderID, ID[body - 1]);
    if (approvalMode == true && !adminIDs.some(item => item.id) == api.getCurrentUserID()) {
      return api.sendMessage("Vous avez été ajouté à la liste d'approbation du groupe.", threadID, messageID);
    } else {
      return api.sendMessage(`Vous avez rejoint le groupe : ${threadInfo.threadName}. Vérifiez dans les demandes de message ou les messages indésirables. Si le groupe n'apparaît pas, c'est que l'approbation par l'administrateur est activée.`, threadID, messageID);
    }
  } catch (error) {
    return api.sendMessage(`Impossible de vous ajouter à ce groupe\nErreur : ${error}`, threadID, messageID);
  }
};

module.exports.run = async function({ api, event, Threads }) {
  var { threadID, messageID, senderID } = event;
  var msg = `╭─────『 𝗟𝗜𝗦𝗧𝗘 𝗗𝗘𝗦 𝗚𝗥𝗢𝗨𝗣𝗘𝗦 』─────╮\n\n`;
  var number = 0, ID = [];
  var allThreads = await Threads.getAll();

  for (var i of allThreads) {
    number++;
    msg += `│ ${number}. ${i.threadInfo.threadName}\n`;
    ID.push(i.threadID);
  }

  msg += `\n│ Réponds avec le **numéro** du groupe pour y être ajouté.\n`;
  msg += `╰────────────────────────────╯`;

  return api.sendMessage(msg, threadID, (error, info) => {
    global.client.handleReply.push({
      name: this.config.name,
      author: senderID,
      messageID: info.messageID,
      ID: ID      
    });
  }, messageID);
};
