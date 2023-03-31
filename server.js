import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import moment from "moment";

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
  ctx.reply(ctx.message.text);
  // Si el mensaje no es un comando, procesa la conversión
  if (!ctx.message.text.startsWith("/")) {
    try {
      const now = new Date();
      // Formatear la fecha y hora actual en el formato deseado
      const formattedDateFrom = moment(now)
        .startOf("day")
        .format("YYYY-MM-DD 00:00:01");
      const formattedDateTo = moment(now)
        .endOf("day")
        .format("YYYY-MM-DD 23:59:01");
      // Codificar las fechas formateadas
      const encodedDateFrom = encodeURIComponent(formattedDateFrom);
      const encodedDateTo = encodeURIComponent(formattedDateTo);
      // Construir la URL con los parámetros de las fechas
      const url = `https://tasas.eltoque.com/v1/trmi?date_from=${encodedDateFrom}&date_to=${encodedDateTo}`;
      console.log(url);

      const config = {
        headers: {
          accept: "*/*",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY2OTg2ODY5MCwianRpIjoiNjI5NDcxYzAtOWE3NS00YTg3LWI0YmUtNjU1MWI3YmMzN2VlIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjYzODgyYzkyZTNhYzlkNWM2NDcwOWM5YyIsIm5iZiI6MTY2OTg2ODY5MCwiZXhwIjoxNzAxNDA0NjkwfQ.KEsO3N7klvVFA6JzoPGV7DxSB-ZGpf-ATYKolcskQDg",
        },
      };

      await axios
        .get(url, config)
        .then((response) => {
          console.log(response);
          const rate = response.data.tasas.USD;

          // Obtiene el valor ingresado por el usuario
          const value = parseFloat(ctx.message.text);

          // Convierte el valor de CUP a USD
          const convertedValue = value / rate;

          // Envía la respuesta al usuario
          ctx.reply(`${value} CUP = ${convertedValue.toFixed(2)} USD`);
        })
        .catch(function (error) {
          // handle error
          ctx.reply(error);
        });
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
