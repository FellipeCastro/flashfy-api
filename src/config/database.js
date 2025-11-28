import { Sequelize } from "sequelize";
import "dotenv/config";

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging: false,
    dialectOptions: process.env.NODE_ENV === "production" ? {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    } : null,
    dialectModule: process.env.NODE_ENV === "production" ? await import("pg").then((mod) => mod.default) : null,
});

export default sequelize;
