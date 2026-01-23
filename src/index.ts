import { Honocord } from "honocord";

// Initialize Honocord
const bot = new Honocord({ isCFWorker: true, debugRest: true });

// Load the command
bot.loadHandlers();

// Export the app
export default bot.getApp();
