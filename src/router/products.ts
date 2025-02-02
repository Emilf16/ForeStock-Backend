import express from "express";
import { getAllProducts,getProduct, createNewProduct, updateProductData, deleteProduct } from "../controllers/products";
import { isAuthenticated } from "../middlewares/index";

export default (router: express.Router) => {
  // Ruta para obtener todos los productos
  // Esta ruta maneja solicitudes GET para obtener todos los productos.
  router.get("/products", isAuthenticated, getAllProducts);

  // Ruta para obtener un producto por su ID
  // Esta ruta maneja solicitudes GET para obtener un producto específico utilizando su ID.
  router.get("/products/:id", isAuthenticated, getProduct);

  // Ruta para crear un nuevo producto
  // Esta ruta maneja solicitudes POST para crear un nuevo producto.
  router.post("/products", isAuthenticated, createNewProduct);

  // Ruta para actualizar los datos de un producto existente
  // Esta ruta maneja solicitudes PATCH para actualizar un producto por su ID.
  router.patch("/products/:id", isAuthenticated, updateProductData);

  // Ruta para eliminar un producto
  // Esta ruta maneja solicitudes DELETE para eliminar un producto por su ID.
  router.delete("/products/:id", isAuthenticated, deleteProduct);
};

