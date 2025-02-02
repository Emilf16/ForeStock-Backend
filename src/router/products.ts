import express from "express";
import { getAllProducts,getProduct, createNewProduct, updateProductData, deleteProduct } from "../controllers/products";
import { isAuthenticated } from "../middlewares/index";

export default (router: express.Router) => {
  // Route to get all products
  // This route handles GET requests to retrieve all products.
  router.get("/products", isAuthenticated, getAllProducts);

  // Route to get a product by its ID
  // This route handles GET requests to retrieve a specific product by its ID.
  router.get("/products/:id", isAuthenticated, getProduct);

  // Route to create a new product
  // This route handles POST requests to create a new product.
  router.post("/products", isAuthenticated, createNewProduct);

  // Route to update an existing product
  // This route handles PATCH requests to update a product by its ID.
  router.patch("/products/:id", isAuthenticated, updateProductData);

  // Route to delete a product
  // This route handles DELETE requests to remove a product by its ID.
  router.delete("/products/:id", isAuthenticated, deleteProduct);
};

