module.exports.config = {
  name: "clear",
  version: "1.0.0",
  permission: 0,
  credits: "Messie Osango",
  prefix: true,
  description: "Supprime le message du bot en répondant avec la commande {prefix}clear",
  category: "admin",
  cooldowns: 5
};

module.exports.run = async function({ api, event, client }) {
  const { threadID, messageID, senderID, body } = event;
  const prefix = client.config.PREFIX;

  if (body && body.toLowerCase() === `${prefix}clear`) {
    if (event.messageReply && event.messageReply.senderID === api.getCurrentUserID()) {
      api.deleteMessage(event.messageReply.messageID);
      return api.sendMessage("Le message a été supprimé avec succès.", threadID, messageID);
    } else {
      return api.sendMessage(`Répondez à un message du bot avec la commande ${prefix}clear pour le supprimer.`, threadID, messageID);
    }
  }
};
