import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Deck = sequelize.define(
    "Deck",
    {
        idDeck: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        idUser: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "idUser",
            },
        },
        idSubject: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "subjects",
                key: "idSubject",
            },
        },
        title: {
            type: DataTypes.STRING(60),
            allowNull: false,
        },
        nextReview: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "decks",
        timestamps: false,
    }
);

export default Deck;
