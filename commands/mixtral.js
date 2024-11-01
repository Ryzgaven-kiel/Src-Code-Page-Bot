const axios = require('axios');
const moment = require('moment');
const { sendMessage } = require('../handles/sendMessage');

// Simulated user context storage (consider replacing with a real database)
const userContext = {};

module.exports.config = {
  name: "mixtral",
  version: "1.0.0",
  hasPermission: 0,
  credits: "nones",
  description: "Mixtral AI for text generation",
  usePrefix: false,
  commandCategory: "GPT4",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
  const { messageID, messageReply } = event;
  let prompt = args.join(' ');

  if (messageReply) {
    const repliedMessage = messageReply.body;
    prompt = `${repliedMessage} ${prompt}`;
  }

  if (!prompt) {
    return api.sendMessage('🐱 𝙷𝚎𝚕𝚕𝚘, 𝙸 𝚊𝚖 𝙼𝚒𝚡𝚝𝚛𝚊𝚕 𝚝𝚛𝚊𝚒𝚗𝚎𝚍 𝚋𝚢 𝙶𝚘𝚘𝚐𝚕𝚎\n\n𝙷𝚘𝚠 𝚖𝚊𝚢 𝚒 𝚊𝚜𝚜𝚒𝚜𝚝 𝚢𝚘𝚞 𝚝𝚘𝚍𝚊𝚢?', event.threadID, messageID);
  }

  api.sendMessage('🗨️ | 𝙼𝚒𝚡𝚝𝚛𝚊𝚕 𝚒𝚜 𝚜𝚎𝚊𝚛𝚌𝚑𝚒𝚗𝚐, 𝙿𝚕𝚎𝚊𝚜𝚎 𝚠𝚊𝚒𝚝...', event.threadID);

  // Delay
  await new Promise(resolve => setTimeout(resolve, 2000)); // Adjust the delay time as needed

  try {
    // Retrieve previous context for the user
    const previousContext = userContext[event.senderID] || '';
    const fullPrompt = `${previousContext} ${prompt}`.trim();

    const gpt4_api = `https://jerai.onrender.com/chat?query=${encodeURIComponent(fullPrompt)}&model=mixtral`;

    const response = await axios.get(gpt4_api);

    if (response.data && response.data.message) {
      const generatedText = response.data.message;

      // Send the generated text to the user
      api.sendMessage(`🎓  𝐌𝐢𝐱𝐭𝐫𝐚𝐥 (𝐀𝐢) 𝐀𝐧𝐬𝐰𝐞𝐫\n━━━━━━━━━━━━━━━━\n\n🖋️ 𝙰𝚜𝚔: '${prompt}'\n\n𝗔𝗻𝘀𝘄𝗲𝗿: ${generatedText}\n\n🗓️ | ⏰ 𝙳𝚊𝚝𝚎 & 𝚃𝚒𝚖𝚎: ${moment().format('MMMM D, YYYY h:mm A')}\n━━━━━━━━━━━━━━━━`, event.threadID, messageID);
      
      // Update user context with the new prompt and response for future interactions
      userContext[event.senderID] = `${fullPrompt}\n${generatedText}`;
      
    } else {
      console.error('API response did not contain expected data:', response.data);
      api.sendMessage(`❌ An error occurred while generating the text response. Please try again later. Response data: ${JSON.stringify(response.data)}`, event.threadID, messageID);
    }
  } catch (error) {
    console.error('Error:', error);
    api.sendMessage(`❌ An error occurred while generating the text response. Please try again later. Error details: ${error.message}`, event.threadID, messageID);
  }
};
  
