const axios = require("axios");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "mj",
    version: "2.1",
    author: "@Renz Mansueto",
    countDown: 5,
    role: 0,
    shortDescription: "Generate 4 MJ-style images",
    longDescription: "Generate 4 images and reply with U1-U4 to select a specific one.",
    category: "image",
    guide: "{pn} dog"
  },

  onStart: async function ({ api, event, args, message }) {
    const prompt = args.join(" ").trim();
    if (!prompt) return message.reply("❌ Please provide a prompt.\nExample: /mj cat");

    message.reply("🧠 Generating Midjourney-style images...", async (err, info) => {
      try {
        const res = await axios.get(`https://api.oculux.xyz/api/mjproxy5?prompt=${encodeURIComponent(prompt)}&usePolling=false`);
        const data = res.data;

        if (data.status !== "completed" || !data.urls || data.urls.length !== 4) {
          return message.reply("⚠️ Image generation failed or did not return 4 images.");
        }

        const attachments = await Promise.all(data.urls.map(url => getStreamFromURL(url)));

        message.reply({
          body: `✨U1,U2,U3,U4`,
          attachment: attachments
        }, (err, info2) => {
          global.GoatBot.onReply.set(info2.messageID, {
            commandName: this.config.name,
            author: event.senderID,
            imageUrls: {
              U1: data.urls[0],
              U2: data.urls[1],
              U3: data.urls[2],
              U4: data.urls[3]
            }
          });
        });
      } catch (error) {
        console.error(error);
        message.reply(`❌ Error: ${error.message}`);
      }
    });
  },

  onReply: async function ({ event, Reply, message }) {
    const { author, imageUrls } = Reply;
    if (event.senderID !== author) return;

    const choice = event.body.trim().toUpperCase();
    if (!["U1", "U2", "U3", "U4"].includes(choice)) {
      return message.reply("❌ Invalid choice. Please reply with U1, U2, U3, or U4 only.");
    }

    try {
      const selectedUrl = imageUrls[choice];
      const imageStream = await getStreamFromURL(selectedUrl, `${choice}.png`);
      return message.reply({
        body: `📷 Selected image: ${choice}`,
        attachment: imageStream
      });
    } catch (error) {
      console.error(error);
      message.reply(`❌ Failed to load image: ${error.message}`);
    }
  }
};
