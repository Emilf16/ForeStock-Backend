import express from "express";
import { getAllUsers, deleteUser,getUserData, updateUserData } from "../controllers/users";
import { isAuthenticated } from "../middlewares/index";
import { get } from "mongoose";

 
export default (router: express.Router) => { 
  // Route to get all users
  // This route handles GET requests to retrieve all users from the database. 
  router.get("/users", isAuthenticated, getAllUsers);

  
  // Route to get all users
  // This route handles GET requests to retrieve all users from the database. 
  router.get("/user/:id", isAuthenticated, getUserData);

  // Route to update a user's data
  // This route handles PATCH requests to update the data of a specific user.
  // The user's ID must be provided in the URL.
  router.patch("/users/:id", isAuthenticated, updateUserData);

  // Route to delete a user
  // This route handles DELETE requests to remove a user from the database.
  // The user's ID must be provided in the URL.
  router.delete("/users/:id", deleteUser);
};
