import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
    res.send("OAuth Server is Running!");
});

app.listen(PORT, () => {
    console.log(`OAuth server running on http://localhost:${PORT}`);
});
