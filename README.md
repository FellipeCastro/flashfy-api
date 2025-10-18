# FlashFy API

![FlashFy](https://raw.githubusercontent.com/fellipecastro/flashfy/main/src/assets/logo.png)

API RESTful desenvolvida em Node.js para a aplicação *FlashFy*, um sistema de flashcards inteligentes com repetição espaçada e integração com IA para otimização dos estudos.

Esta API é responsável por gerenciar usuários, decks, cards, progresso de estudos e pela comunicação com a API do Google Gemini para geração de conteúdo.

## ✨ Funcionalidades

* **Autenticação de Usuários:** Sistema completo de registro e login com tokens JWT
* **Gerenciamento de Conteúdo:** Operações CRUD (Criar, Ler, Atualizar, Deletar) para Matérias (Subjects), Decks e Cards
* **Sistema de Repetição Espaçada:** Lógica para calcular a data da próxima revisão de um deck com base na dificuldade reportada pelo usuário
* **Acompanhamento de Progresso:** Rastreia os dias consecutivos de estudo, decks estudados e a data do último estudo
* **Integração com IA (Google Gemini):**
    * Gera questões de múltipla escolha sobre um tema específico
    * Cria decks e flashcards completos automaticamente com base em um tema fornecido pelo usuário

## 🛠 Tecnologias Utilizadas

* **Node.js**
* **Express.js**
* **Sequelize ORM** para interação com o banco de dados
* **PostgreSQL** como banco de dados
* **JWT (JSON Web Tokens)** para autenticação
* **Bcrypt** para hashing de senhas
* **Google Gemini API** para geração de conteúdo por IA

## 🚀 Começando

Siga as instruções abaixo para configurar e executar a API em seu ambiente local.

### Pré-requisitos

* Node.js (v18 ou superior)
* Uma instância de banco de dados PostgreSQL
* Uma chave de API para o Google Gemini

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/fellipecastro/flashfy-api.git
cd flashfy-api
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente. Crie um arquivo `.env` na raiz do projeto, baseado no exemplo abaixo:
```env
# URL de conexão do seu banco de dados PostgreSQL
DATABASE_URL="postgres://USER:PASSWORD@HOST:PORT/DATABASE"

# Chave secreta para gerar os tokens JWT
TOKEN_SECRET="sua_chave_secreta_aqui"

# Chave de API do Google Gemini
GEMINI_API_KEY="sua_chave_do_gemini_aqui"

# Porta em que o servidor irá rodar
PORT=5000
```

### Executando a Aplicação

Para iniciar o servidor em modo de desenvolvimento com hot-reload, execute:

```bash
npm run dev
```
