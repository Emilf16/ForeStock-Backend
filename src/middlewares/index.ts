import express from "express"; 
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export function isAuthenticated(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  let token = req.header("Authorization") ?? "";

  // Verificar si el token es undefined o null
  if (!token || token === "") {
    res.status(401).json({ message: "Acceso denegado" });
    return;
  }

  // Si el token tiene el prefijo "Bearer ", eliminarlo
  if (token.startsWith("Bearer ")) {
    token = token.slice(7).trim();
  }
  
  try { 
    const verified = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user = verified;
    next();
  } catch {
    res.status(400).json({ message: "Token inválido" });
    return;
  }
}
