const axios = require('axios');
const { getStreamFromURL } = global.utils;
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

module.exports = {
  config: {
    name: "flux1",
    version: "1.0",
    author: "Redwan",
    countDown: 20,
    longDescription: {
      en: "Generate ultra-realistic images using AI from Fluxx (Redwan's APIs)."
    },
    category: "Image Generation",
    role: 0,
    guide: {
      en: "{pn} <prompt>"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const prompt = args.join(' ').trim();
    if (!prompt) return message.reply("Please provide a prompt to generate the image.");

    api.setMessageReaction("⌛", event.messageID, () => {}, true);
    message.reply("Fluxx is processing your request. Please wait...", async (err, info) => {
      if (err) return console.error(err);

      try {
        const apiUrl = `http://65.109.80.126:20511/api/deto?prompt=${encodeURIComponent(prompt)}`;
        const response = await axios.get(apiUrl);
        const { images, status } = response.data;

        if (!status || !images || images.length !== 4) {
          api.setMessageReaction("❌", event.messageID, () => {}, true);
          return message.reply("Image generation failed. Please try again.");
        }

        const imageLinks = images.map(item => item.image_link);
        const imageObjs = await Promise.all(imageLinks.map(url => loadImage(url)));

        const canvas = createCanvas(1024, 1024);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(imageObjs[0], 0, 0, 512, 512);
        ctx.drawImage(imageObjs[1], 512, 0, 512, 512);
        ctx.drawImage(imageObjs[2], 0, 512, 512, 512);
        ctx.drawImage(imageObjs[3], 512, 512, 512, 512);

        const cacheDir = path.join(__dirname, 'cache');
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

        const outputPath = path.join(cacheDir, `fluxx_collage_${event.senderID}.png`);
        const out = fs.createWriteStream(outputPath);
        const stream = canvas.createPNGStream();
        stream.pipe(out);

        out.on("finish", async () => {
          api.setMessageReaction("✅", event.messageID, () => {}, true);
          const msg = {
            body: "Fluxx process completed✨\n\n❏ Select one by replying:\nU1, U2, U3, or U4",
            attachment: fs.createReadStream(outputPath)
          };
          message.reply(msg, (err, info) => {
            if (err) return console.error(err);
            global.GoatBot.onReply.set(info.messageID, {
              commandName: this.config.name,
              messageID: info.messageID,
              author: event.senderID,
              images: imageLinks
            });
          });
        });

      } catch (error) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        console.error(error);
        message.reply("An error occurred while generating the image. Please try again later.");
      }
    });
  },

  onReply: async function ({ api, event, Reply, message }) {
    const { author, images } = Reply;
    if (event.senderID !== author) {
      return message.reply("Only the user who initiated the command can select an image.");
    }

    const input = event.body.trim().toUpperCase();
    const match = input.match(/^U([1-4])$/);

    if (!match) {
      return message.reply("Invalid input. Please reply with U1, U2, U3, or U4 to select an image.");
    }

    const index = parseInt(match[1]) - 1;
    const selectedImage = images[index];

    try {
      const imageStream = await getStreamFromURL(selectedImage, `fluxx_selected_U${index + 1}.jpg`);
      message.reply({
        body: `Here is your selected image (U${index + 1}) from Fluxx.`,
        attachment: imageStream
      });
    } catch (error) {
      console.error(error);
      message.reply("Unable to retrieve the selected image. Please try again.");
    }
  }
};
