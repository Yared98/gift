# 🎁 Minha Lista de Presentes (Wishlist Homelab & PWA)

Um portal web pessoal, elegante e moderno, projetado para cadastrar e compartilhar listas de desejos e ideias de presentes com amigos e familiares de forma discreta e privada (estilo lista de casamento, sem mecanismo de reserva obrigatório).

Projetado especificamente para rodar com **consumo mínimo de recursos no Homelab** (~15 a 25 MB de RAM) e com suporte completo a **PWA (Progressive Web App)** para celulares Android e iOS.

---

## ✨ Principais Funcionalidades

- **📱 PWA & Web Share Target (Celular & Desktop):**
  - Instale como app nativo na tela inicial do Android e iPhone.
  - **Compartilhe direto de outros apps:** Ao navegar na Amazon, Mercado Livre, Shopee ou navegadores móveis, basta tocar no botão nativo "Compartilhar" do celular e selecionar "Presentes" para capturar a foto, o título e o preço com 1 toque.
  - Gaveta inferior rápida com preenchimento automático e preservação de link se o usuário estiver deslogado.
- **🎨 Identidade Visual & Temas Personalizados:**
  - **12 Paletas Prontas:** Sálvia, Terracota, Lavanda, Oceano, Blush, Café, Esmeralda, Ocre, Menta, Ameixa, Sakura e Grafite.
  - **Editor Estilo Slack:** Crie sua própria paleta usando 4 códigos hexadecimais (Navegação, Destaques, Favoritos, Papel de Fundo), com botão *Surpreenda-me* e compartilhamento de paleta.
  - **Modo Padrão da Lista:** Escolha se os convidados verão sua lista em modo Automático, Claro ou Escuro por padrão.
- **🔒 Privacidade & Sem Indexação:**
  - Link de visualização não listado com token secreto (`https://seusite.com/u/seu-slug?token=seu_token`).
  - Cabeçalhos HTTP e meta tags `noindex, nofollow, noarchive, nosnippet` em todas as páginas e `robots.txt` bloqueando rastreadores.
- **✨ Link Mágico (Auto-Scraper):**
  - Cole qualquer URL de e-commerce e o backend extrai automaticamente o título, a foto e o preço via OpenGraph/metadados.
- **🏷️ Filtros Ricos e Intuitivos:**
  - Categorias dinâmicas, faixa de preço, nível de desejo (estrelas) e busca instantânea.
- **🔐 Autenticação Google OAuth & Multi-Usuário:**
  - Login seguro com conta Google (Gmail) com verificação criptográfica.
  - Super-Admin configurável via `ADMIN_EMAIL` com painel de moderação de acessos e Whitelist.
  - Listas públicas isoladas por usuário (`/u/:slug?token=...`).
- **🚀 Ultraleve:**
  - Backend em **Rust (Axum + SQLite)** + Frontend em **React (Vite + Tailwind CSS)** compilado e servido pelo próprio binário estático.

---

## 🐳 Como Rodar Containerizado (Docker & Docker Compose)

### 1. Clonar o repositório
```bash
git clone https://github.com/Yared98/gift.git
cd gift
```

### 2. Configurar Variáveis de Ambiente
Copie o arquivo de exemplo e preencha as credenciais:
```bash
cp .env.example .env
```

Edite o `.env`:
```env
PORT=8080
DATA_DIR=/app/data
RUST_LOG=info
GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret
ADMIN_EMAIL=seu-email@gmail.com
```

### 3. Iniciar o container
```bash
docker compose up -d --build
```

O container compila o frontend e o backend em multi-stage leve (base Alpine) e inicializa com consumo de ~20MB de RAM.

### 4. Acessar a Aplicação
- Abra no navegador: `http://localhost:8080` (ou o domínio/túnel configurado).
- O banco de dados SQLite é persistido no volume `./data/wishlist.db`.

---

## 💻 Como Rodar em Desenvolvimento Local

### 1. Frontend (React)
```bash
cd client
npm install
npm run dev
```
O frontend iniciará em `http://localhost:5173`.

### 2. Backend (Rust)
```bash
cd server
cargo run
```
O servidor iniciará em `http://localhost:8080`.

Para gerar a build estática de produção atendida diretamente pelo Rust:
```bash
cd client
npm run build
cd ../server
cargo run
```

---

## ⚙️ Variáveis de Ambiente

| Variável | Padrão | Descrição |
| :--- | :--- | :--- |
| `PORT` | `8080` | Porta HTTP do servidor |
| `DATA_DIR` | `./data` | Pasta onde o banco `wishlist.db` é salvo |
| `GOOGLE_CLIENT_ID` | - | Client ID OAuth 2.0 do Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | - | Client Secret OAuth 2.0 do Google Cloud Console |
| `ADMIN_EMAIL` | - | E-mail do Super-Administrador padrão |
| `RUST_LOG` | `info` | Nível de logs do Axum |
