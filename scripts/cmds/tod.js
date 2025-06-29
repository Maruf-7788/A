const axios = require("axios");

module.exports = {
  config: {
    name: "tod",
    aliases: ["truthdare", "truthordare"],
    version: "1.4",
    author: "Mueid Mursalin Rifat",
    countDown: 3,
    role: 0,
    shortDescription: "🎲 Truth or Dare",
    longDescription: "Play Truth or Dare using API — CatX Edition 🐱",
    category: "fun",
    guide: {
      en: "{pn} truth (or t)\n{pn} dare (or d)"
    }
  },

  onStart: async function ({ message, args }) {
    const input = args[0]?.toLowerCase();

    try {
      if (input === "truth" || input === "t") {
        const res = await axios.get("https://truthordare-mmr.onrender.com/truth");
        return message.reply(`🧠 *Truth*\n➤ ${res.data.question}`);
      } else if (input === "dare" || input === "d") {
        const res = await axios.get("https://truthordare-mmr.onrender.com/dare");
        return message.reply(`🎯 *Dare*\n➤ ${res.data.challenge}`);
      } else {
        return message.reply("❗ Please use:\n• /tod truth (or t)\n• /tod dare (or d)");
      }
    } catch (err) {
      console.error(err);
      return message.reply("⚠️ Could not fetch a question. Try again later.");
    }
  }
};
