import express from "express";
import cors from "cors";
import router from "./routes.js";
import sequelize from "./database/config.js";
import "./models/associations.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(router);

// Função para iniciar o servidor
const startServer = async () => {
    try {
        // 1. Autenticar com o banco de dados
        await sequelize.authenticate();
        console.log("✅ Conexão com o banco de dados estabelecida.");

        // 2. Sincronizar modelos com o banco
        // { force: false } - Não recria tabelas existentes
        // { alter: true }  - Altera tabelas existentes para match com modelos
        await sequelize.sync({ alter: true });
        console.log("✅ Modelos sincronizados com o banco de dados.");

        // 3. Iniciar o servidor
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log("🚀 Servidor rodando em: http://localhost:" + PORT);
        });
    } catch (error) {
        console.error("❌ Erro ao iniciar o servidor:", error);
        process.exit(1); // Encerra o processo com erro
    }
};

// Iniciar o servidor
startServer();

export default app;
