import express from "express";
import {
  getUserByEmail,
  createUser,
  getUserById,
  updateUserById,
} from "../db/users";
import { random, authentication } from "../helpers/index";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Faltan campos por llenar" });
      return;
    }

    const user = await getUserByEmail(email).select(
      "+authentication.salt +authentication.password"
    );
    if (!user) {
      res.status(400).json({ message: "El usuario no existe" });
      return;
    }

    const expectedHash = authentication(user.authentication.salt, password);

    if (user.authentication.password !== expectedHash) {
      res.status(403).json({ message: "Contraseña incorrecta" });
      return;
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login exitoso", token });
    return;
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error interno del servidor" });
    return;
  }
};

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password, username, role } = req.body;
    let missingFields: string[] = [];

    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");
    if (!username) missingFields.push("username");
    if (!role) missingFields.push("role");

    if (missingFields.length > 0) {
      res.status(400).json({
        message: `Faltan los siguientes campos: ${missingFields.join(", ")}`,
      });
      return;
    }
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ message: "El usuario ya existe" });
      return;
    }

    const salt = random();
    const user = await createUser({
      email,
      username,
      role, // Ahora se incluye el rol
      authentication: { password: authentication(salt, password), salt },
    });

    res.status(200).json({ message: "Registro exitoso", user });
    return;
  } catch (error) {
    console.error("Error en register:", error);
    res.status(500).json({ message: "Error interno del servidor" });
    return;
  }
};
