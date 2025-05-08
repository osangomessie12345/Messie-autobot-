module.exports.config = {
  name: "out",
  version: "1.0.0",
  role: 2,
  hasPrefix: true,
  credits: "Messie Osango",
  description: "Le bot quitte le fil de discussion",
  usages: "out",
  cooldowns: 10,
};

module.exports.run = async function({ api, event, args }) {
  try { 
    const { threadID, messageID } = event;
    const currentUserID = api.getCurrentUserID();
    
    if (!args[0]) {
      return api.removeUserFromGroup(currentUserID, threadID, () => {
        api.sendMessage(
          `╭───────────────────────────╮\n│                           │\n│ Je m'en vais d'ici afin    │\n│ d'obéir à mon maître.     │\n│                           │\n╰───────────────────────────╯`,
          threadID, messageID
        );
      });
    }

    if (!isNaN(args[0])) {
      return api.removeUserFromGroup(currentUserID, args.join(" "), () => {
        api.sendMessage(
          `╭───────────────────────────╮\n│                           │\n│ Je m'en vais d'ici afin    │\n│ d'obéir à mon maître.     │\n│                           │\n╰───────────────────────────╯`,
          threadID, messageID
        );
      });
    }
  } catch (error) {
    api.sendMessage(
      `╭───────────────────────────╮\n│                           │\n│ Erreur : ${error.message}  │\n│                           │\n╰───────────────────────────╯`,
      threadID, messageID
    );
  }
};
