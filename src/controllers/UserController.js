import UserService from "../services/UserService.js";

class UserController {
    async Register(req, res) {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                return res
                    .status(400)
                    .json({ error: "Todos os campos são obrigatórios." });
            }

            const formattedEmail = email.toLowerCase().trim();

            const result = await UserService.Register(
                name,
                formattedEmail,
                password
            );
            return res.status(201).json(result);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    async Login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res
                    .status(400)
                    .json({ error: "Todos os campos são obrigatórios." });
            }

            const formattedEmail = email.toLowerCase().trim();

            const result = await UserService.Login(formattedEmail, password);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(401).json({ error: error.message });
        }
    }

    async Profile(req, res) {
        try {
            const idUser = req.idUser;
            const user = await UserService.Profile(idUser);
            return res.status(200).json(user);
        } catch (error) {
            return res.status(404).json({ error: error.message });
        }
    }

    async Edit(req, res) {
        try {
            const idUser = req.idUser;
            const { name, email, password } = req.body;

            const result = await UserService.Edit(name, email, password, idUser);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    async Delete(req, res) {
        try {
            const idUser = req.idUser;

            const result = await UserService.Delete(idUser);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
}

export default new UserController();
