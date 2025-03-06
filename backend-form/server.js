import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

// Permite requisições do frontend
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json({ limit: "50mb" }));

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbykDDaCmjuFWXOKZNmOUb56wD_K6QjDXd72AneGl99bJ4mh1XOmlBHcseb7nOvHym9x/exec";
const MICROSOFT_FORMS_URL = "https://forms.microsoft.com/formapi/api/0b057354-0fc9-47e5-8674-8449dd7e88b8/users/29901e3c-fd87-4cc9-8197-f7c6a3f03201/forms('VHMFC8kP5UeGdIRJ3X6IuDwekCmH_clMgZf3xqPwMgFUN0NGWks5SkVXQ0o2VVRUSEU3UDE3N0tYSi4u')/responses";

app.post("/upload", async (req, res) => {
  try {
    const { folderName, fileName, mimeType, file } = req.body;

    if (!fileName || !file || !folderName) {
      console.error("Dados inválidos recebidos:", req.body);
      return res.status(400).json({ success: false, error: "Dados inválidos" });
    }

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ folderName, fileName, mimeType, file }),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (!result.success) {
      console.error("Erro ao salvar no Google Drive:", result.error);
      return res
        .status(500)
        .json({ success: false, error: "Erro ao salvar no Google Drive" });
    }

    res.json(result);
  } catch (error) {
    console.error("Erro inesperado:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});


// 🔥 Rota para enviar respostas ao Microsoft Forms
app.post("/submit-form", async (req, res) => {
  const payload = req.body;

  try {
    const response = await fetch(MICROSOFT_FORMS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

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

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
