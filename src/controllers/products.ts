import { Request, Response } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProductById,
  deleteProductById,
  updateProductStock,
} from "../db/product"; // Importando los métodos del modelo de producto

// Obtener todos los productos
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await getProducts();
    res.status(200).json(products);
    return;
  } catch (error) {
    console.error("Error al obtener los productos:", error);
    res.status(500).json({ message: "Error al obtener los productos" });
    return;
  }
};

// Obtener un producto por ID
export const getProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const product = await getProductById(productId);
    if (!product) {
      res.status(404).json({ message: "Producto no encontrado" });
      return;
    }
    res.status(200).json(product);
    return;
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    res.status(500).json({ message: "Error al obtener el producto" });
    return;
  }
};

// Crear un nuevo producto
export const createNewProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, stock, category } = req.body;
    const missingFields = [];

    if (!name) missingFields.push("name");
    if (!description) missingFields.push("description");
    if (price === undefined || price === null) missingFields.push("price");
    if (stock === undefined || stock === null) missingFields.push("stock");
    if (!category) missingFields.push("category");

    if (missingFields.length > 0) {
      res.status(400).json({
        message: `Faltan los siguientes campos: ${missingFields.join(", ")}`,
      });
      return;
    }

    // Si no hay campos faltantes, proceder a crear el producto
    const newProduct = await createProduct(req.body);
    res.status(201).json(newProduct);
    return;
  } catch (error) {
    console.error("Error al crear el producto:", error);
    res.status(500).json({ message: "Error al crear el producto" });
    return;
  }
};

// Actualizar un producto por ID
export const updateProductData = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const updatedProduct = await updateProductById(productId, req.body);
    if (!updatedProduct) {
      res.status(404).json({ message: "Producto no encontrado" });
      return;
    }
    res.status(200).json(updatedProduct);
    return;
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    res.status(500).json({ message: "Error al actualizar el producto" });
    return;
  }
};

// Eliminar un producto por ID
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const deletedProduct = await deleteProductById(productId);
    if (!deletedProduct) {
      res.status(404).json({ message: "Producto no encontrado" });
      return;
    }
    res.status(200).json({ message: "Producto eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    res.status(500).json({ message: "Error al eliminar el producto" });
    return;
  }
};

// Actualizar el stock de un producto
export const updateStock = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const { quantityChange } = req.body;

    if (typeof quantityChange !== "number") {
      res.status(400).json({ message: "La cantidad debe ser un número" });
      return;
    }

    const updatedProduct = await updateProductStock(productId, quantityChange);
    res.status(200).json(updatedProduct);
    return;
  } catch (error) {
    console.error("Error al actualizar el stock del producto:", error);
    res
      .status(500)
      .json({ message: "Error al actualizar el stock del producto" });
    return;
  }
};
