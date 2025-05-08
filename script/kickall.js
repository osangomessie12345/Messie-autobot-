module.exports.config = {
  name: "kickall",
  version: "1.0.0",
  role: 2,
  description: "Supprime tous les membres du groupe.",
  usages: "{p}kickall",
  hasPrefix: false,
  cooldown: 5,
  aliases: ["bura"],
};

module.exports.run = async function({ api, event, getText, args }) {
  const { participantIDs } = await api.getThreadInfo(event.threadID);
  
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  const botID = api.getCurrentUserID();
  const listUserID = participantIDs.filter(ID => ID != botID);

  return api.getThreadInfo(event.threadID, (err, info) => {
    if (err) {
      return api.sendMessage(`
╭──────────────────────╮
│  ❌ Une erreur s'est  │
│  produite. Réessayez │
╰──────────────────────╯
      `, event.threadID);
    }
    
    if (!info.adminIDs.some(item => item.id == api.getCurrentUserID())) {
      return api.sendMessage(`
╭──────────────────────────╮
│  ❌ je devais être admin│
│  du groupe pour utiliser │
│  cette commande.         │
╰──────────────────────────╯
      `, event.threadID, event.messageID);
    }
    
    if (info.adminIDs.some(item => item.id == event.senderID)) {
      setTimeout(function() { api.removeUserFromGroup(botID, event.threadID); }, 300000);
      
      return api.sendMessage(`
╭────────────────────────────╮
│  ⚠️ Suppression en cours  │
│  De tous les membres...  │
│  Bye tout le monde !      │
╰────────────────────────────╯
      `, event.threadID, async (error, info) => {
        for (let id of listUserID) {
          await delay(1000); /
          api.removeUserFromGroup(id, event.threadID);
        }
      });
    } else {
      return api.sendMessage(`
╭────────────────────────╮
│  ❌ Seuls les admins du  │
│  groupe peuvent supprimer. │
│          │
╰────────────────────────╯
      `, event.threadID, event.messageID);
    }
  });
};
