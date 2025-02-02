import express from "express";
import https from "https";
import fs from "fs";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import router from "./router/index";

dotenv.config();
const app = express();
const PORT = 8080;
app.use(
  cors({
    credentials: true,
  })
);
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
// Configurar HTTPS
const options = {
  key: fs.readFileSync("server.key"),
  cert: fs.readFileSync("server.crt"),
};
const server = https.createServer(options, app);


const startServer = (port: number) => {
  server.listen(port, () => {
    console.log(`✅ Server is running on https://localhost:${port}/`);
  }).on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`⚠️ El puerto ${port} está en uso. Intentando con otro...`);
      startServer(port + 1); // Intenta con el siguiente puerto disponible
    } else {
      console.error("❌ Error en el servidor:", err);
    }
  });
};

startServer(PORT);

 
mongoose.Promise = Promise;
 
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("La variable de entorno MONGODB_URI no está definida.");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado a MongoDB");
  } catch (error) {
    console.error("❌ Error de conexión a MongoDB:", error);
    process.exit(1);
  }
};

connectDB();

app.use("/", router());
