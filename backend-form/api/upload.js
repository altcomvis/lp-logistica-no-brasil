import fetch from "node-fetch";

export default async function handler(req, res) {
  // 🔥 Configurar CORS corretamente
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 🔥 Responder rapidamente requisições OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Método não permitido" });
  }

  try {
    const { folderName, fileName, mimeType, file } = req.body;

    if (!fileName || !file || !folderName) {
      return res.status(400).json({ success: false, error: "Dados inválidos" });
    }

    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbykDDaCmjuFWXOKZNmOUb56wD_K6QjDXd72AneGl99bJ4mh1XOmlBHcseb7nOvHym9x/exec";
    
    // 🔥 Enviando para o Google Apps Script
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ folderName, fileName, mimeType, file }),
      headers: { "Content-Type": "application/json" },
      
    });
    

    // 🔥 Garantir que recebemos uma resposta válida
    if (!response.ok) {
      return res.status(500).json({ success: false, error: "Erro ao salvar no Google Drive" });
    }

    const result = await response.json();

    res.json(result);
  } catch (error) {
    console.error("Erro no upload:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
