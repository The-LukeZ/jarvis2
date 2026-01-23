import { registerCommands } from "honocord";
// import { pingCommand } from "./index";

await registerCommands(
  process.env.DISCORD_TOKEN!,
  process.env.DISCORD_APPLICATION_ID!,
  // pingCommand
);