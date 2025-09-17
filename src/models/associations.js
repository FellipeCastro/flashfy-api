import User from "./User.js";
import Progress from "./Progress.js";
import Subject from "./Subject.js";
import Deck from "./Deck.js";
import Card from "./Card.js";

// Definir associações
User.hasOne(Progress, {
    foreignKey: "idUser",
    as: "progress",
    onDelete: "CASCADE",
});

Progress.belongsTo(User, {
    foreignKey: "idUser",
    as: "user",
});

User.hasMany(Subject, {
    foreignKey: "idUser",
    as: "subjects",
    onDelete: "CASCADE",
});

Subject.belongsTo(User, {
    foreignKey: "idUser",
    as: "user",
});

User.hasMany(Deck, {
    foreignKey: "idUser",
    as: "decks",
    onDelete: "CASCADE",
});

Deck.belongsTo(User, {
    foreignKey: "idUser",
    as: "user",
});

Subject.hasMany(Deck, {
    foreignKey: "idSubject",
    as: "decks",
    onDelete: "CASCADE",
});

Deck.belongsTo(Subject, {
    foreignKey: "idSubject",
    as: "subject",
});

Deck.hasMany(Card, {
    foreignKey: "idDeck",
    as: "cards",
    onDelete: "CASCADE",
});

Card.belongsTo(Deck, {
    foreignKey: "idDeck",
    as: "deck",
});

export { User, Progress, Subject, Deck, Card };
