module.exports.config = {
  name: "join",
  eventType: ["log:subscribe", "log:unsubscribe"],
  version: "1.0.5",
  credits: "Messie Osango",
  description: " Notification d'arrivée, départ et expulsion ",
  dependencies: {
    "fs-extra": "",
    "moment-timezone": ""
  }
};

module.exports.run = async function ({ api, event, Threads, Users, botname, prefix }) {
  try {
    const { threadID, logMessageType } = event;
    const moment = require("moment-timezone");
    const timeNow = moment().tz("Africa/Lubumbashi").format("HH:mm DD/MM/YYYY");
    
    if (logMessageType === "log:unsubscribe") {
      const leftParticipant = event.logMessageData.leftParticipantFbId;
      const userInfo = await Users.getData(leftParticipant);
      const name = userInfo.name || "un membre";
      
      const wasKicked = event.logMessageData.removerFbId && 
                       event.logMessageData.removerFbId !== leftParticipant;
      
      const goodbyeMsg = wasKicked ? `
╭─── 𝐸𝑋𝑃𝑈𝐿𝑆𝐼𝑂𝑁───⌾
│
│   ${name} a été supprimé(e) du groupe
│
│   ${timeNow}
│
│  Action effectuée par un administrateur
╰────────────────────⌾
      ` : `
╭─── 𝐴𝑈 𝑅𝐸𝑉𝑂𝐼𝑅 ───⌾
│
│   ${name} a quitté le groupe...
│
│   ${timeNow}
│
│  Passez une bonne journée !
╰────────────────────⌾
      `;
      
      return api.sendMessage(goodbyeMsg, threadID);
    }

    const data = (await Threads.getData(threadID)).data || {};
    if (data.banOut?.includes(threadID)) return;

    const added = event.logMessageData?.addedParticipants || [];
    const botID = await api.getCurrentUserID();

    if (added.some(i => i.userFbId == botID)) {
      await api.changeNickname(`[🤖] ${botname}`, threadID, botID);
      const botWelcome = `
╭─── 𝐽𝐸 𝑉𝑂𝑈𝑆 𝑅𝐸𝑀𝐸𝑅𝐶𝐼𝐸 ───⌾
│
│  ✨ 𝑀𝐸𝑆𝑆𝐼𝐸 𝐴𝑈𝑇𝑂𝐵𝑂𝑇 ✨  
│
│  Merci pour l'invitation !
│
│  ➤ Prefix : ${prefix}
│  ➤ Heure : ${timeNow}
│
│  Je suis votre assistant virtuel Facebook
│  Tapez « ${prefix}help » pour voir
│  mes fonctionnalités.
╰────────────────────⌾
      `;
      return api.sendMessage(botWelcome, threadID);
    } 
    else if (added.length > 0) {
      const threadInfo = await api.getThreadInfo(threadID);
      const names = added.map(p => p.fullName).join(', ');
      const memberCount = threadInfo.participantIDs.length;
      
      const welcomeMsg = `
╭─── 𝗕𝗜𝗘𝗡𝗩𝗘𝗡𝗨𝗘 ───⌾
│
│   𝐵𝐼𝐸𝑁𝑉𝐸𝑁𝑈𝐸 ${names} !
│  
│  ${timeNow}
│   Membre n°${memberCount}
│
│  Passez un bon séjour parmi nous !
│  Je suis votre assistant virtuel Facebook
╰────────────────────⌾
      `;
      
      return api.sendMessage({
        body: welcomeMsg,
        mentions: added.map(p => ({
          tag: p.fullName,
          id: p.userFbId
        }))
      }, threadID);
    }
  } catch (error) {
    console.error("Erreur dans le module join/leave:", error);
  }
};
