import express from "express";
import authentication from "./authentication";
import users from "./users";
import products from "./products";
import invoice from "./invoice";
import sales from "./sales";

const router = express.Router();

export default (): express.Router => {
  authentication(router);
  users(router);
  products(router);
  invoice(router);
  sales(router);
  return router;
};
