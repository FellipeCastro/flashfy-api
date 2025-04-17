import mysql from "mysql2";
import "dotenv/config";

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

connection.connect((error) => {
    if (error) {
        console.error("Erro ao conectar ao banco de dados:", error.message);
        process.exit(1);
    }
    console.log("Conectado ao banco de dados com sucesso!");
});

export const consult = (command, params = []) => {
    return new Promise((resolve, reject) => {
        connection.query(command, params, (error, result) => {
            if (error) {
                console.error("Erro ao executar a consulta:", error.message);
                return reject(
                    new Error("Falha ao consultar o banco de dados.")
                );
            }
            return resolve(JSON.parse(JSON.stringify(result)));
        });
    });
};

export default connection;
