import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Subject = sequelize.define(
    "Subject",
    {
        idSubject: {
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
        name: {
            type: DataTypes.STRING(60),
            allowNull: false,
        },
        color: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
    },
    {
        tableName: "subjects",
        timestamps: false,
    }
);

export default Subject;
