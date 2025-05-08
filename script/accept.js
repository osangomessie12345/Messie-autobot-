module.exports.config = {
  name: "accept",
  version: "1.0.0",
  permission: 2,
  credits: "Messie Osango",
  prefix: true,
  premium: false,
  description: "Accepte ou supprime des demandes d'amis via l'ID Facebook.",
  category: "admin",
  usages: "uid",
  cooldowns: 0
};  

module.exports.handleReply = async ({ handleReply, event, api }) => {
  const { author, listRequest } = handleReply;
  if (author != event.senderID) return;
  const args = event.body.replace(/ +/g, " ").toLowerCase().split(" ");
  
  const form = {
    av: api.getCurrentUserID(),
    fb_api_caller_class: "RelayModern",
    variables: {
      input: {
        source: "friends_tab",
        actor_id: api.getCurrentUserID(),
        client_mutation_id: Math.round(Math.random() * 19).toString()
      },
      scale: 3,
      refresh_num: 0
    }
  };
  
  const success = [];
  const failed = [];
  
  if (args[0] == "add") {
    form.fb_api_req_friendly_name = "FriendingCometFriendRequestConfirmMutation";
    form.doc_id = "3147613905362928";
  }
  else if (args[0] == "del") {
    form.fb_api_req_friendly_name = "FriendingCometFriendRequestDeleteMutation";
    form.doc_id = "4108254489275063";
  }
  else return api.sendMessage("Veuillez sélectionner 'add' ou 'del', puis le numéro ou 'all' pour tout traiter.", event.threadID, event.messageID);
  
  let targetIDs = args.slice(1);
  
  if (args[1] == "all") {
    targetIDs = [];
    const lengthList = listRequest.length;
    for (let i = 1; i <= lengthList; i++) targetIDs.push(i);
  }
  
  const newTargetIDs = [];
  const promiseFriends = [];
  
  for (const stt of targetIDs) {
    const u = listRequest[parseInt(stt) - 1];
    if (!u) {
      failed.push(`La demande à la position ${stt} n'a pas été trouvée dans la liste.`);
      continue;
    }
    form.variables.input.friend_requester_id = u.node.id;
    form.variables = JSON.stringify(form.variables);
    newTargetIDs.push(u);
    promiseFriends.push(api.httpPost("https://www.facebook.com/api/graphql/", form));
    form.variables = JSON.parse(form.variables);
  }
  
  const lengthTarget = newTargetIDs.length;
  for (let i = 0; i < lengthTarget; i++) {
    try {
      const friendRequest = await promiseFriends[i];
      if (JSON.parse(friendRequest).errors) failed.push(newTargetIDs[i].node.name);
      else success.push(newTargetIDs[i].node.name);
    }
    catch(e) {
      failed.push(newTargetIDs[i].node.name);
    }
  }
  
  api.sendMessage(`
──────────────────────⌾
│ 
│ Demandes d'amis traitées
│
╰─────────────────────⌾

✔️ Demandes ${args[0] == 'add' ? 'acceptées' : 'supprimées'} ( ${success.length} utilisateur(s)) :
${success.join("\n")}

❌ Échec avec ${failed.length} utilisateur(s) :
${failed.join("\n")}

╰──────────────────⌾
  `, event.threadID, event.messageID);
};

module.exports.run = async ({ event, api }) => {
  const moment = require("moment-timezone");
  const form = {
    av: api.getCurrentUserID(),
    fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
    fb_api_caller_class: "RelayModern",
    doc_id: "4499164963466303",
    variables: JSON.stringify({input: {scale: 3}})
  };
  
  const listRequest = JSON.parse(await api.httpPost("https://www.facebook.com/api/graphql/", form)).data.viewer.friending_possibilities.edges;
  
  let msg = "";
  let i = 0;
  for (const user of listRequest) {
    i++;
    msg += `
──────────────────⌾
│
│ Nom : ${user.node.name}
│ ID : ${user.node.id}
│ URL : fb.com/${user.node.id}
│ Heure de la demande : ${moment(user.time*1009).tz("Asia/Manila").format("DD/MM/YYYY HH:mm:ss")}
│
╰─────────────────⌾
    `;
  }
  
  api.sendMessage(`
──────────────────────⌾
│ 
│ Liste des demandes d'amis en attente
│
╰─────────────────────⌾

${msg}

──────────────────────⌾

Répondez à ce message avec : 'add' ou 'del' suivi du numéro ou 'all' pour traiter toutes les demandes.
`, event.threadID, (e, info) => {
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID,
      listRequest,
      author: event.senderID
    });
  }, event.messageID);
};
