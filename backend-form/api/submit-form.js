import fetch from "node-fetch";

const MICROSOFT_FORMS_URL =
  "https://forms.microsoft.com/formapi/api/0b057354-0fc9-47e5-8674-8449dd7e88b8/users/29901e3c-fd87-4cc9-8197-f7c6a3f03201/forms('VHMFC8kP5UeGdIRJ3X6IuDwekCmH_clMgZf3xqPwMgFUN0NGWks5SkVXQ0o2VVRUSEU3UDE3N0tYSi4u')/responses";

export default async function handler(req, res) {
    // 🔥 Permitir requisições CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
    // 🔥 Tratar requisições OPTIONS (Preflight)
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
    
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Método não permitido" });
  }

  try {
    const payload = req.body;

    const response = await fetch(MICROSOFT_FORMS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      res.status(200).json({ message: "Formulário enviado com sucesso!" });
    } else {
      const errorText = await response.text();
      res.status(response.status).json({ error: errorText });
    }
  } catch (error) {
    console.error("Erro ao enviar para o Microsoft Forms:", error);
    res.status(500).json({ error: "Erro ao conectar ao Microsoft Forms." });
  }
}
