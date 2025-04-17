import jwt from "jsonwebtoken";
import "dotenv/config";

const secret = process.env.TOKEN_SECRET;

class Token {
    Create(idUser) {
        const token = jwt.sign({ idUser }, secret, {
            expiresIn: "7d",
        });

        return token;
    }

    Validate(req, res, next) {
        const authToken = req.headers.authorization;

        if (!authToken) {
            return res.status(401).json({ error: "Token não informado." });
        }

        const token = authToken.split(" ")[1];

        jwt.verify(token, secret, (error, tokenDecoded) => {
            if (error) {
                return res.status(401).json({ error: "Token inválido." });
            }

            req.idUser = tokenDecoded.idUser;

            next();
        });
    }
}

export default new Token();
