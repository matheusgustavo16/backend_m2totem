import axios from "axios";

const apiKey = "sk_test_ezKO1xNhjsw83MBZ";
const JWT_SECRET = process.env.JWT_SECRET || "4ft3rt1ck3t5";

const http = axios.create({
  baseURL: "https://api.pagar.me/core/v5/",
  auth: {
    username: apiKey,
    password: ""
  }
});

export { apiKey, http, JWT_SECRET };
