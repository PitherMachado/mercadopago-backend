const express = require("express");
const cors = require("cors");
const mercadopago = require("mercadopago");

// Configurar o Mercado Pago com sua chave
mercadopago.configure({
  access_token: "APP_USR-8829702683326757-122718-1c494ac162d7351e7a1761dc0b4f7bdb-230012383"
});

const app = express();
app.use(cors());
app.use(express.json());

// Rota de teste
app.get("/", (req, res) => {
  res.send("Servidor do Mercado Pago está funcionando!");
});

// ✅ ROTA FUNCIONAL PARA CRIAR PREFERÊNCIA
app.post("/create_preference", async (req, res) => {
  try {
    const preference = {
      items: [
        {
          title: "Nome do Produto AQUI",
          unit_price: 149.90,
          quantity: 1
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
    console.error("Erro ao criar preferência:", error);
    res.status(500).json({ error: "Erro ao criar preferência" });
  }
});

// Porta usada no Render (ele define pelo ambiente)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
