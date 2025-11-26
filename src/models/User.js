import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const User = sequelize.define(
    "User",
    {
        idUser: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: "idUser",
        },
        email: {
            type: DataTypes.STRING(60),
            allowNull: false,
            unique: true,
        },
        name: {
            type: DataTypes.STRING(60),
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING(60),
            allowNull: true, 
        },
        googleId: {
            type: DataTypes.STRING(100),
            allowNull: true,
            unique: true,
            field: "googleId",
        },
    },
    {
        tableName: "users",
        timestamps: false,
    }
);

export default User;
