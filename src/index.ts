import express from "express";
import bodyParser from "body-parser";
import "dotenv/config";
import cors from "cors";
import router from "./routes";

const app = express();
const port = 1337;

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cors({ origin: "*" }));

app.all("/", function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
app.use(router);

app.listen(port, () => {
  console.log(`Servidor está rodando na porta ${port}`);
});
