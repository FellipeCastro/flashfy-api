import express from "express";
import cors from "cors";
import timeout from "connect-timeout";
import router from "./routes.js";

const app = express();

app.use(timeout("3000s"));
app.use(express.json());
app.use(cors());
app.use(router);

export default app;
