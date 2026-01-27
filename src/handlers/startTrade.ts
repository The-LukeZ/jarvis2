import {
  ModalHandler,
  ComponentHandler,
  ComponentType,
  ModalBuilder,
  LabelBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  FileUploadBuilder,
} from "honocord";
import type { MyContext } from "../types";
import { DBHelper } from "../db";
import { buildErrorMessage } from "../utils";

export const StartButtonHandler = new ComponentHandler<ComponentType.Button, MyContext>("startTrade").addHandler(async (ctx) => {
  const db = new DBHelper(ctx.context.env.DATABASE);
  ctx.context.set("db", db);

  const user = await db.getUser(ctx.user.id);
  if (user?.blocked) {
    await ctx.reply(buildErrorMessage("Du darfst keine Trades starten, da du blockiert bist."));
    return;
  }

  await ctx.showModal(
    new ModalBuilder()
      .setCustomId("startTrade")
      .setTitle("Neuen Trade starten")
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("Als wer möchtest du den Trade starten?")
          .setDescription("Gib an, ob du etwas bieten oder erhalten möchtest.")
          .setStringSelectMenuComponent(
            new StringSelectMenuBuilder().setCustomId("type").setRequired(true).setOptions(
              {
                label: "Ich biete etwas an",
                value: "give",
              },
              {
                label: "Ich suche etwas",
                value: "receive",
              }
            )
          )
      )
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("Was möchtest du handeln?")
          .setDescription("Beschreibe kurz, was du anbieten oder suchst.")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("description")
              .setStyle(2)
              .setMaxLength(2000)
              .setRequired(true)
              .setPlaceholder("z.B. Ich biete ein Waffe XY")
          )
      )
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("Screenshots")
          .setDescription("Füge optional Screenshots hinzu, um deinen Trade zu veranschaulichen.")
          .setFileUploadComponent(new FileUploadBuilder().setCustomId("attachments").setMaxValues(5).setRequired(false))
      )
  );
  return;
});

export const StartModalHandler = new ModalHandler<MyContext>("startTrade", async (ctx) => {});
