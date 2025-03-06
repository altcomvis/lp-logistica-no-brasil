import express from "express";
import fetch from "node-fetch";
import cors from "cors"; // Importe o middleware CORS

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors()); 
app.use(express.json({ limit: "50mb" })); 

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxCPndPkhvtJ6SCEhbz3EZR_P7JYLbaIHNoCNF9rr8e6p_5OYtKU8MTXXiHDG85DF-I/exec";

app.post("/upload", async (req, res) => {
  try {
    const { folderName, fileName, mimeType, file } = req.body;

    if (!fileName || !file || !folderName) {
      return res.status(400).json({ success: false, error: "Dados inválidos" });
    }

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ folderName, fileName, mimeType, file }),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (!result.success) {
      return res.status(500).json({ success: false, error: "Erro ao salvar no Google Drive" });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
