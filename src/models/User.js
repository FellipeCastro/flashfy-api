import { DataTypes } from 'sequelize';
import sequelize from '../database/config.js';

const User = sequelize.define('User', {
    idUser: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'idUser'
    },
    email: {
        type: DataTypes.STRING(60),
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING(60),
        allowNull: false
    },
    password: {
        type: DataTypes.STRING(60),
        allowNull: false
    }
}, {
    tableName: 'users',
    timestamps: false
});

export default User;