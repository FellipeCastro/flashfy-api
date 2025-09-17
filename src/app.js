import express from "express";
import cors from "cors";
import router from "./routes.js";
import sequelize from "./database/config.js";
import "./models/associations.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(router);

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Conexão com o banco de dados estabelecida.");

        await sequelize.sync({ alter: true });
        console.log("✅ Modelos sincronizados com o banco de dados.");

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log("🚀 Servidor rodando em: http://localhost:" + PORT);
        });
    } catch (error) {
        console.error("❌ Erro ao iniciar o servidor:", error);
        process.exit(1);
    }
};

startServer();

export default app;
