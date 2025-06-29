const axios = require('axios');

module.exports = {
  config: {
    name: "dalle2",
    aliases: [],
    version: "0.0.1",
    author: "ArYAN",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Generate image using DALL·E API"
    },
    longDescription: {
      en: "Send a prompt to the DALL·E API and get back an image."
    },
    category: "ai",
    guide: {
      en: "{pn} [prompt text]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return api.sendMessage("Please provide a prompt.\nExample: dalle cute cat", event.threadID, event.messageID);
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    const apiUrl = `http://193.149.164.168:5404/aryan/dalle?prompt=${encodeURIComponent(prompt)}`;

    try {
      const res = await axios.get(apiUrl, { responseType: 'stream' });

      await api.sendMessage({
        body: `🦆 𝗗𝗔𝗟𝗟·𝗘 𝗔𝗜 𝗜𝗺𝗮𝗴𝗲 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗲𝗱 🧡\n\n📝 Prompt: ${prompt}`,
        attachment: res.data
      }, event.threadID, null, event.messageID);

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (error) {
      console.error("DALL·E API Error:", error);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};
