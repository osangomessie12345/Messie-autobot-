module.exports.config = {
  name: "help",
  version: "1.0.2",
  permission: 0,
  credits: "Messie Autobot",
  description: "Guide pour les utilisateurs",
  prefix: true,
  premium: false,
  category: "guide",
  usages: "[Affiche les commandes]",
  cooldowns: 5,
};

module.exports.languages = {
  french: {
    moduleInfo: `
──────────────────⌾
│ Messie Autobot
╰─────────────────⌾

═══════════════════════════
│ **%1**  
╰══════════════════════════
│ **Description** : %2
│ **Usage** : %3
│ **Catégorie** : %4
│ **Cooldown** : %5 seconde(s)
│ **Permission** : %6
═══════════════════════════`,
    helpList: `Il y a **%1 commandes** réparties en **%2 catégories**.`,
    user: "Utilisateur",
    adminGroup: "Administrateur du groupe",
    adminBot: "Administrateur du bot",
  },
};

module.exports.handleEvent = function ({ api, event, getText, botname, prefix }) {
  const { commands } = global.client;
  const { threadID, messageID, body } = event;

  if (!body || typeof body === "undefined" || body.indexOf("help") !== 0) return;

  const splitBody = body.slice(body.indexOf("help")).trim().split(/\s+/);
  if (splitBody.length === 1 || !commands.has(splitBody[1].toLowerCase())) return;

  const command = commands.get(splitBody[1].toLowerCase());
  return api.sendMessage(
    getText(
      "moduleInfo",
      command.config.name,
      command.config.description,
      `${prefix}${command.config.name} ${command.config.usages ? command.config.usages : ""}`,
      command.config.category,
      command.config.cooldowns,
      command.config.permission === 0
        ? getText("user")
        : command.config.permission === 1
        ? getText("adminGroup")
        : getText("adminBot"),
      command.config.credits
    ),
    threadID,
    messageID
  );
};

module.exports.run = async function ({ api, event, args, getText, botname, prefix }) {
  const { commands } = global.client;
  const { threadID, messageID } = event;

  const command = commands.get((args[0] || "").toLowerCase());
  const autoUnsend = true;
  const delayUnsend = 60;

  if (!command) {
    const commandList = Array.from(commands.values());
    const categories = new Set(commandList.map((cmd) => cmd.config.category.toLowerCase()));
    const categoryCount = categories.size;

    const categoryNames = Array.from(categories);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(categoryNames.length / itemsPerPage);

    let currentPage = 1;
    if (args[0]) {
      const parsedPage = parseInt(args[0]);
      if (!isNaN(parsedPage) && parsedPage >= 1 && parsedPage <= totalPages) {
        currentPage = parsedPage;
      } else {
        return api.sendMessage(
          `❌ **Erreur** : veuillez choisir une page entre **1** et **${totalPages}**.`,
          threadID,
          messageID
        );
      }
    }

    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const visibleCategories = categoryNames.slice(startIdx, endIdx);

    let msg = `

─────────────────⌾
│ Messie Autobot
╰────────────────⌾

═══════════════════════════
│ **Commandes & Catégories**
═══════════════════════════
`;

    for (let i = 0; i < visibleCategories.length; i++) {
      const category = visibleCategories[i];
      const categoryCommands = commandList.filter(
        (cmd) => cmd.config.category.toLowerCase() === category
      );
      const commandNames = categoryCommands.map((cmd) => cmd.config.name);
      msg += `\n**${category.charAt(0).toUpperCase() + category.slice(1)}** :\n`;
      msg += `  - ${commandNames.join("\n  - ")}\n`;
    }

    msg += `\n📖 Page ${currentPage} sur ${totalPages}\n`;
    msg += getText("helpList", commands.size, categoryCount);

    msg += `
══════════════════════════════
`;

    api.sendMessage(msg, threadID, messageID);
  } else {
    return api.sendMessage(
      getText(
        "moduleInfo",
        command.config.name,
        command.config.description,
        `${prefix}${command.config.name} ${command.config.usages ? command.config.usages : ""}`,
        command.config.category,
        command.config.cooldowns,
        command.config.permission === 0
          ? getText("user")
          : command.config.permission === 1
          ? getText("adminGroup")
          : getText("adminBot"),
        command.config.credits
      ),
      threadID,
      async (error, info) => {
        if (autoUnsend) {
          await new Promise((resolve) =>
            setTimeout(resolve, delayUnsend * 1000)
          );
          return api.unsendMessage(info.messageID);
        }
      },
      messageID
    );
  }
};
