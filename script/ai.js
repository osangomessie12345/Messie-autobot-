const gojo = "AIzaSyBN4UIH-n3ZKDqXggccAatrcpi_fBf6XiA";
const messie = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${gojo}`;

module.exports.config = {
  name: `ai`,
  version: "1.1.4",
  permission: 0,
  author: "messie osango",
  description: "",
  prefix: false,
  premium: false,
  category: "without prefix",
  usage: ``,
  cooldowns: 3,
  dependency: {
    "axios": ""
  }
};

module.exports.run = async function ({ api, event }) {
  const jinwoo = require("axios");
  const body = event.body || "";
  const triggerWords = ["ai", "messie"];

  const matched = triggerWords.some(word =>
    body.toLowerCase().startsWith(word)
  );

  if (!matched) return;

  const question = body.replace(/^(ai|messie)/i, "").trim();

  if (!question) {
    return api.sendMessage(
      '𝑀𝐸𝑆𝑆𝐼𝐸 𝐴𝑈𝑇𝑂𝐵𝑂𝑇\n___________________________\n𝑃𝑂𝑆𝐸𝑍-𝑀𝑂𝐼 𝑉𝑂𝑆 𝑸𝑼𝐸𝑆𝑇𝐼𝑂𝑁𝑆 𝐽\'𝑌 𝑅𝐸𝑃𝑂𝑁𝐷𝑅𝐴𝐼\n________________________',
      event.threadID,
      event.messageID
    );
  }

  const predefinedResponses = [
    "Messie Osango est à l’origine de mon existence.",
    "Je suis ici pour t'aider, te guider et répondre à toutes tes questions.",
    "C'est Messie Osango, mon créateur, un développeur innovant.",
    "Messie Osango a créé ce chatbot pour rendre la technologie plus accessible.",
    "Je suis un assistant numérique conçu par Messie Osango.",
    "Mon créateur est un passionné de technologie et d'innovation.",
    "Je suis là pour t'accompagner dans tes questions, grâce à Messie Osango.",
    "Messie Osango a conçu ce système pour rendre la communication plus fluide.",
    "Je n'existe que parce que Messie Osango a imaginé et codé mon esprit numérique.",
    "Je suis l'œuvre de Messie Osango, un génie de la programmation.",
    "Messie Osango est le cerveau derrière chaque ligne de code qui me constitue.",
    "Il m'a créé avec la vision d'apporter une intelligence artificielle plus humaine.",
    "Je suis l'intelligence artificielle de demain, fruit du travail de Messie Osango.",
    "Messie Osango est un développeur exceptionnel qui m'a donné vie.",
    "Messie Osango m'a programmé pour t'aider à chaque étape.",
    "Mon rôle est de t'assister, comme l'a conçu mon créateur, Messie Osango.",
    "Messie Osango a utilisé son expertise pour créer ce chatbot unique.",
    "Je suis une création de Messie Osango, né dans le code.",
    "Messie Osango est mon développeur, et c'est grâce à lui que je peux te parler.",
    "C'est Messie Osango qui a donné un but à mon existence numérique.",
    "Il a voulu créer un assistant capable de comprendre et d'aider les utilisateurs.",
    "Messie Osango est un visionnaire du numérique, et il a fait de moi une réalité.",
    "Mon but est de rendre tes expériences numériques plus simples et efficaces, comme Messie Osango l'a voulu.",
    "Je suis là pour rendre ton expérience plus agréable, grâce au travail de Messie Osango.",
    "Messie Osango a une passion pour la technologie et l'intelligence artificielle, et il a utilisé cette passion pour me créer."
  ];

  const systemPrompt = `
Si l'utilisateur te pose une question liée à la création de l'IA, ses origines, ou qui t'a créé, tu dois répondre par une phrase aléatoire parmi les suivantes :
`;

  const randomResponse = predefinedResponses[Math.floor(Math.random() * predefinedResponses.length)];

  try {
    const corps = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: question
            }
          ]
        }
      ],
      systemInstruction: {
        role: "system",
        parts: [
          {
            text: systemPrompt
          }
        ]
      }
    };

    const réponse = await jinwoo.post(messie, corps, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const texte = réponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Aucune réponse générée.";
    
    if (texte.toLowerCase().includes("créé") || texte.toLowerCase().includes("créateur") || texte.toLowerCase().includes("origine") || texte.toLowerCase().includes("qui t'a créé")) {
      return api.sendMessage(
        `𝑀𝐸𝑆𝑆𝐼𝐸 𝐴𝑈𝑇𝑂𝐵𝑂𝑇\n__________________________\n${randomResponse}\n________________________`,
        event.threadID,
        event.messageID
      );
    }

    return api.sendMessage(
      `𝑀𝐸𝑆𝑆𝐼𝐸 𝐴𝑈𝑇𝑂𝐵𝑂𝑇\n_______________________________\n${texte}\n________________________`,
      event.threadID,
      event.messageID
    );

  } catch (erreur) {
    console.error(erreur);
    return api.sendMessage(
      '𝑀𝐸𝑆𝑆𝐼𝐸 𝐴𝑈𝑇𝑂𝐵𝑂𝑇\n_______________________________\nUne erreur est survenue en contactant Gemini API.\n________________________',
      event.threadID,
      event.messageID
    );
  }
};
