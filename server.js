const express = require("express");
const app = express();
const mercadopago = require("mercadopago");
const cors = require("cors");

// Configura Mercado Pago
mercadopago.configure({
  access_token: "APP_USR-8829702683326757-122718-1c494ac162d7351e7a1761dc0b4f7bdb-230012383"
});

app.use(express.json());
app.use(cors());

// Rota que cria a preferência de pagamento
app.post("/create_preference", async (req, res) => {
  try {
    const preference = {
      items: [
        {
          title: "Nome do Produto",
          unit_price: 149.9,
          quantity: 1
        }
      ]
    };

    const response = await mercadopago.preferences.create(preference);
    res.json({ id: response.body.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar preferência" });
  }
});

// Inicializa o servidor
app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
