import { DataTypes } from "sequelize";
import sequelize from "../database/config.js";

const Progress = sequelize.define(
    "Progress",
    {
        idProgress: {
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
        consecutiveDays: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        decksToStudy: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        studiedDecks: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        lastStudyDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "progress",
        timestamps: false,
    }
);

export default Progress;
