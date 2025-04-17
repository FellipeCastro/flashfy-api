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
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ error: "Token não informado" });
        }

        jwt.verify(token, secret, (error, tokenDecoded) => {
            if (error) {
                return res.status(401).json({ error: "Token inválido" });
            }

            req.idUser = tokenDecoded.idUser;

            next();
        });
    }
}

export default new Token();
