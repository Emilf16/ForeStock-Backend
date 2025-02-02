import express from "express";
import {
  getUsers,
  deleteUserById,
  getUserById,
  updateUserById,
  getUserByEmail,
} from "../db/users";

export const getAllUsers = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const users = await getUsers();
    res.status(200).json(users);
    return;
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: "Error interno del servidor" });
    return;
  }
};
export const getUserData = async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.params.id;
    const user = await getUserById(userId);
    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }
    res.status(200).json(user);
    return;
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
    res.status(500).json({ message: "Error al obtener el usuario" });
    return;
  }
};


export const deleteUser = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const deletedUser = await deleteUserById(id);

    if (!deletedUser) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }

    res.status(200).json({ data: deletedUser, message: "Usuario eliminado" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const updateUserData = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const { username, email, role } = req.body;

    // Validación para asegurarse de que ninguno de los campos sea nulo o vacío
    if (!username || !email || !role) {
      res.status(400).json({ message: "Todos los campos son requeridos" });
      return;
    }

    const userToUpdate = await getUserById(id);

    if (!userToUpdate) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }
    
    // Verificar si el correo ya existe en otro usuario
    const existingUser = await getUserByEmail(email);
    if (existingUser && existingUser.id !== id) {
      res.status(400).json({ message: "El correo ya está en uso" });
      return;
    }

    // Actualiza los campos del usuario con los valores enviados
    userToUpdate.username = username;
    userToUpdate.email = email;
    userToUpdate.role = role;

    await updateUserById(id, userToUpdate);

    res
      .status(200)
      .json({ message: "Usuario actualizado", user: userToUpdate });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
