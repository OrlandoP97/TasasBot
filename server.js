import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";

const token = "6219172685:AAGQYED-jD08yh3LbnsbewO_En9UgNaqZwo";

const bot = new Telegraf(token);

// Maneja el comando /start
bot.start((ctx) => {
  ctx.reply(
    "Hola! Soy un bot de Telegram que convierte CUP a USD. Por favor, ingresa el valor en CUP que deseas convertir."
  );
});

// Maneja el comando /help
bot.help((ctx) => {
  ctx.reply(
    "Para usar este bot, simplemente ingresa el valor en CUP que deseas convertir."
  );
});

// Maneja los mensajes de texto
bot.on("text", async (ctx) => {
  // Si el mensaje no es un comando, procesa la conversión
  if (!ctx.message.text.startsWith("/")) {
    try {
      // Obtiene la tasa de cambio actual de CUP a USD desde la API
      const response = await axios.get("https://tasas.eltoque.com/v1/trmi");
      const rate = response.data[0].value;

      // Obtiene el valor ingresado por el usuario
      const value = parseFloat(ctx.message.text);

      // Convierte el valor de CUP a USD
      const convertedValue = value / rate;

      // Envía la respuesta al usuario
      ctx.reply(`${value} CUP = ${convertedValue.toFixed(2)} USD`);
    } catch (error) {
      // Si hay un error al obtener la tasa de cambio, envía un mensaje de error al usuario
      ctx.reply(
        "Lo siento, no pude obtener la tasa de cambio actual. Por favor, intenta de nuevo más tarde."
      );
    }
  }
});

// Inicia el bot
bot.launch();
