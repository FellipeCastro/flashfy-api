import UserService from "../services/UserService.js";

class UserController {
    async Register(req, res) {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({ error: "Todos os campos são obrigatórios." });
            }

            const formattedEmail = email.toLowerCase().trim();

            const result = await UserService.Register(name, formattedEmail, password);
            return res.status(201).json(result);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
}

export default new UserController();
