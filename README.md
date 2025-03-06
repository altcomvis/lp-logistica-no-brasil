# Backend Formulário - Upload para Google Drive e Envio para Microsoft Forms

Este projeto é um backend para lidar com o upload de arquivos para o **Google Drive** e envio de dados para o **Microsoft Forms** via API.

## Tecnologias Utilizadas

- **Node.js**
- **Express**
- **Multer**
- **CORS**
- **Fetch API**
- **Vercel (Deploy)**

## Estrutura do Projeto
```
project/ 
├── api/ 
│ 
├── upload.js # Endpoint para upload de arquivos para o Google Drive 
│ 
├── submit-form.js # Endpoint para envio de respostas ao Microsoft Forms 
├── package.json # Dependências e scripts 
├── vercel.json # Configuração do deploy na Vercel
```


## ⚙️ Instalação

1. Clone o repositório:

   ```
   git clone https://github.com/seu-usuario/seu-repositorio.git
   cd seu-repositorio
   ```

2. Instale as dependências:
```
npm install
```
3. Crie um arquivo .env e defina as variáveis necessárias:

GOOGLE_SCRIPT_URL="https://script.google.com/macros/s/SEU_SCRIPT_ID/exec"
MICROSOFT_FORMS_URL="https://forms.microsoft.com/formapi/api/SEU_FORM_ID"


## Como Executar Localmente
1. Inicie o servidor:
```
npm start
```
2. Teste os endpoints via Postman ou cURL.

- Upload de Arquivo
```
curl -X POST http://localhost:3000/upload \
-H "Content-Type: application/json" \
-d '{
  "folderName": "Teste",
  "fileName": "documento.pdf",
  "mimeType": "application/pdf",
  "file": "BASE64_ENCODED_FILE"
}'
```

- Envio de Respostas ao Microsoft Forms
```
curl -X POST http://localhost:3000/submit-form \
-H "Content-Type: application/json" \
-d '{
  "name": "Usuário Teste",
  "document": "12345678901",
  "email": "teste@email.com"
}'
```

## Deploy na Vercel

1. Instale o CLI da Vercel:
```npm install -g vercel```

2. Faça login:
```vercel login```

3. Implante o projeto:
``` vercel --prod ```


## Problemas Conhecidos
- O CORS pode bloquear requisições. Verifique se o backend está permitindo conexões do frontend.
- O upload de múltiplos arquivos pode falhar se houver timeout na Vercel.
- Apenas os formatos Word, PowerPoint e PDF são aceitos.

### Desenvolvido por @altcomvis