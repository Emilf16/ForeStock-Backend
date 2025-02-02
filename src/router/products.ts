import express from "express";
import { getAllProducts,getProduct, createNewProduct, updateProductData, deleteProduct } from "../controllers/products";
import { isAuthenticated } from "../middlewares/index";

export default (router: express.Router) => {
  // Obtener todos los productos
  router.get("/products", isAuthenticated, getAllProducts);

  // Obtener producto por id
  router.get("/products/:id", isAuthenticated, getProduct);

  // Crear un nuevo producto
  router.post("/products", isAuthenticated, createNewProduct);

  // Actualizar un producto existente
  router.patch("/products/:id", isAuthenticated, updateProductData);

  // Eliminar un producto
  router.delete("/products/:id", isAuthenticated, deleteProduct);
};
