import { Honocord } from "honocord";
import * as handlers from "./handlers/index.js";

// Initialize Honocord
const bot = new Honocord({ isCFWorker: true, debugRest: true });

// Load the command
bot.loadHandlers(Object.values(handlers));

// Export the app
export default bot.getApp();
