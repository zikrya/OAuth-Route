import express from "express";
import dotenv from "dotenv";
import oauthRoutes from "./routes/oauth";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api", oauthRoutes);

const PORT = process.env.PORT || 8080;


if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`OAuth server running on http://localhost:${PORT}`);
  });
}

export default app;
