import express from "express";
import { register, login } from "../controllers/authentication";

export default (router: express.Router) => {
  // Route to register a new user
  // This route handles POST requests to register a new user in the system.
  router.post("/auth/register", register);

  // Route to log in with an existing user
  // This route handles POST requests to authenticate an already registered user and allow them to log in.
  router.post("/auth/login", login);
};
