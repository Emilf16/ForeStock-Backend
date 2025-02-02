import express from "express";
import { getAllUsers, deleteUser, updateUserData } from "../controllers/users";
import { isAuthenticated } from "../middlewares/index";

 
export default (router: express.Router) => {
 
  router.get("/users", isAuthenticated, getAllUsers);

 
  router.patch("/users/:id", isAuthenticated, updateUserData);

 
  router.delete("/users/:id", deleteUser);
};
