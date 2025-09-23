import app from "./src/app.js";
import sequelize from "./src/database/config.js";
import "./src/models/associations.js";

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Conexão com o banco de dados estabelecida.");

        await sequelize.sync();
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
