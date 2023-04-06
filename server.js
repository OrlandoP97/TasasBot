import { Telegraf } from "telegraf";
import axios from "axios";
import moment from "moment";
import flatCache from "flat-cache";
import Table from "cli-table3";

const token = "6219172685:AAGQYED-jD08yh3LbnsbewO_En9UgNaqZwo";

const bot = new Telegraf(token);

let data = flatCache.load("data");

// Crear la tabla
const table = new Table({
  head: ["Moneda", "Valor"],
  colWidths: [10, 10],
});

/* const data = JSON.parse(fs.readFileSync("./public/datos.json", "utf8")); */
let cached = false;

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
  if (!ctx.message.text.startsWith("/") && !isNaN(ctx.message.text)) {
    try {
      const now = new Date();
      console.log(now);
      if (cached) {
        let lastUpdate = moment(data.lastUpdate);
        const hoursDiff = moment
          .duration(moment(now).diff(lastUpdate))
          .asHours();
        if (hoursDiff > 8) {
          cached = false;
        }
      }

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

      const config = {
        headers: {
          accept: "*/*",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY2OTg2ODY5MCwianRpIjoiNjI5NDcxYzAtOWE3NS00YTg3LWI0YmUtNjU1MWI3YmMzN2VlIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjYzODgyYzkyZTNhYzlkNWM2NDcwOWM5YyIsIm5iZiI6MTY2OTg2ODY5MCwiZXhwIjoxNzAxNDA0NjkwfQ.KEsO3N7klvVFA6JzoPGV7DxSB-ZGpf-ATYKolcskQDg",
        },
      };

      // Obtiene la tasa de cambio actual de CUP a USD desde la caché o la API
      if (cached) {
        const value = parseFloat(ctx.message.text);
        const rate = data.getKey("data");
        const result = JSON.parse(rate);
        // Convierte el valor de CUP a USD
        const convertedUSD = value / result.rates.USD;
        const convertedMLC = value / result.rates.MLC;
        const convertedEUR = value / result.rates.EUR;
        table.push(
          ["USD", `${convertedValue.toFixed(2)} 💵`],
          ["MLC", `${convertedValue.toFixed(2)} 🇨🇺`],
          ["EUR", `${convertedEUR.toFixed(2)} 🇪🇺`]
        );

        const response = `${value} CUP =\n${table.toString()}`;

        ctx.reply(response);
      } else {
        await axios.get(url, config).then((response) => {
          const rateUSD = response.data.tasas.USD;
          const rateMLC = response.data.tasas.MLC;
          const rateEUR = response.data.tasas.ECU;
          // Obtiene el valor ingresado por el usuario
          const value = parseFloat(ctx.message.text);
          // Convierte el valor de CUP a USD
          const convertedValueUSD = value / rateUSD;
          const convertedValueMLC = value / rateMLC;
          const convertedValueEUR = value / rateEUR;
          const newData = {
            rates: { USD: rateUSD, EUR: rateEUR, MLC: rateMLC },
            lastUpdate: now.toISOString(),
          };
          /* fs.writeFileSync("./public/datos.json", JSON.stringify(newData)); */
          data.setKey("data", JSON.stringify(newData));
          data.save();
          cached = true;

          table.push(
            ["USD", `${convertedValueUSD.toFixed(2)} 💵`],
            ["MLC", `${convertedValueMLC.toFixed(2)} 🇨🇺`],
            ["EUR", `${convertedValueEUR.toFixed(2)} 🇪🇺`]
          );

          const response = `${value} CUP =\n${table.toString()}`;

          ctx.reply(response);
          // Envía la respuesta al usuario
        });
      }
    } catch (error) {
      console.log("error de fuera");
      // Si hay un error al obtener la tasa de cambio, envía un mensaje de error al usuario
      console.log("error ", error);
    }
  } else {
    ctx.reply(`Ingresa un valor numérico correcto`);
  }
});
// Inicia el bot
bot.launch();
