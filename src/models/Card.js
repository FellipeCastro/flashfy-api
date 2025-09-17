import { DataTypes } from "sequelize";
import sequelize from "../database/config.js";

const Card = sequelize.define(
    "Card",
    {
        idCard: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        idDeck: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "decks",
                key: "idDeck",
            },
        },
        question: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        answer: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        difficulty: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        tableName: "cards",
        timestamps: false,
    }
);

export default Card;
