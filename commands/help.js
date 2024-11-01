const fs = require('fs');
const path = require('path');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'help',
  description: 'Show available commands',
  usage: 'help\nhelp [command name]',
  author: 'System',
  execute(senderId, args, pageAccessToken) {
    const commandsDir = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

    // Separate commands into educational and other
    const educationalCommands = [];
    const otherCommands = [];

    commandFiles.forEach(file => {
      const command = require(path.join(commandsDir, file));
      if (command.category === 'educational') {
        educationalCommands.push(command);
      } else {
        otherCommands.push(command);
      }
    });

    if (args.length > 0) {
      const commandName = args[0].toLowerCase();
      const commandFile = commandFiles.find(file => {
        const command = require(path.join(commandsDir, file));
        return command.name.toLowerCase() === commandName;
      });

      if (commandFile) {
        const command = require(path.join(commandsDir, commandFile));
        const commandDetails = `
━━━━━━━━━━━━━━
💡 **Command Name:** ${command.name}
📝 **Description:** ${command.description}
📖 **Usage:** ${command.usage}
✨ **Example:** ${command.example ? command.example : "No example available."}
━━━━━━━━━━━━━━`;
        
        sendMessage(senderId, { text: commandDetails }, pageAccessToken);
      } else {
        sendMessage(senderId, { text: `❌ Command "${commandName}" not found. Please check the command name and try again.` }, pageAccessToken);
      }
      return;
    }

    // Prepare the help message for both categories
    const educationalCommandsList = educationalCommands.map(command => `│ - ${command.name}`).join('\n');
    const otherCommandsList = otherCommands.map(command => `│ - ${command.name}`).join('\n');

    const helpMessage = `
━━━━━━━━━━━━━━
🌟 Available Educational Commands:
╭─╼━━━━━━━━╾─╮
${educationalCommandsList || 'No educational commands available.'}
╰─━━━━━━━━━╾─╯

🌟 Available Other Commands:
╭─╼━━━━━━━━╾─╮
${otherCommandsList || 'No other commands available.'}
╰─━━━━━━━━━╾─╯
📩 Type help [command name] to see command details.
━━━━━━━━━━━━━━`;

    sendMessage(senderId, { text: helpMessage }, pageAccessToken);
  }
};
