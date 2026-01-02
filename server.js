const express = require("express");
const cors = require("cors");
const mercadopago = require("mercadopago");

const app = express();
app.use(cors());
app.use(express.json());

mercadopago.configure({
  access_token: "SEU_ACCESS_TOKEN_SEGURO_AQUI"
});

app.post("/create_preference", async (req, res) => {
  try {
    const preference = {
      items: [
        {
          title: "Compra no Mercado Público Online",
          quantity: 1,
          unit_price: 149.90
        }
      ],
      back_urls: {
        success: "https://mercadopublicoonline.com/sucesso",
        failure: "https://mercadopublicoonline.com/erro",
        pending: "https://mercadopublicoonline.com/pendente"
      },
      auto_return: "approved"
    };

    const response = await mercadopago.preferences.create(preference);
    res.json({ id: response.body.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
