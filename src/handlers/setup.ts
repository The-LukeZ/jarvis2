import { SlashCommandHandler } from "honocord";
import { buildSuccessMessage } from "../utils";

export const SetupHandler = new SlashCommandHandler()
  .setName("setup")
  .setContexts(0)
  .setDefaultMemberPermissions(32)
  .setDescription("Sende die Sticky Message im Kanal.")
  .addHandler(async (ctx) => {
    return ctx.reply(buildSuccessMessage("Die Setup Nachricht wurde erfolgreich gesendet."));
  });
