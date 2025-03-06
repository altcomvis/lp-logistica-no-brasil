import express from "express";
import fetch from "node-fetch";
import cors from "cors"; // Importe o middleware CORS

const app = express();

// Permite requisições de outros domínios
app.use(cors({ origin: "http://localhost:5173" })); // Substitua pelo URL do frontend, se necessário
app.use(express.json()); // Middleware para parsear JSON

app.post("/submit-form", async (req, res) => {
  const payload = req.body;

  try {
    const response = await fetch(
      "https://forms.microsoft.com/formapi/api/0b057354-0fc9-47e5-8674-8449dd7e88b8/users/29901e3c-fd87-4cc9-8197-f7c6a3f03201/forms('VHMFC8kP5UeGdIRJ3X6IuDwekCmH_clMgZf3xqPwMgFUN0NGWks5SkVXQ0o2VVRUSEU3UDE3N0tYSi4u')/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (response.ok) {
      res.status(200).send({ message: "Formulário enviado com sucesso!" });
    } else {
      const errorText = await response.text();
      res.status(response.status).send({ error: errorText });
    }
  } catch (error) {
    console.error("Erro ao enviar para o Microsoft Forms:", error);
    res.status(500).send({ error: "Erro ao conectar ao Microsoft Forms." });
  }
});

// Inicia o servidor na porta 3000
app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
