import mongoose, { Document, Schema } from 'mongoose';

const CATEGORIES = ["Electronics", "Clothing", "Home", "Toys", "Sports"];

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true, enum: CATEGORIES, default: "Electronics" },
  },
  { timestamps: true }
);

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

export const ProductModel = mongoose.model<IProduct>('Product', productSchema);

// Métodos CRUD

// Obtener todos los productos
export const getProducts = () => ProductModel.find();

// Obtener un producto por ID
export const getProductById = (id: string) => ProductModel.findById(id);

// Crear un nuevo producto
export const createProduct = (values: Record<string, any>) =>
  new ProductModel(values).save().then((product) => product.toObject());

// Eliminar un producto por ID
export const deleteProductById = (id: string) => ProductModel.findByIdAndDelete(id);

// Actualizar un producto por ID
export const updateProductById = (id: string, values: Record<string, any>) =>
  ProductModel.findByIdAndUpdate(id, values, { new: true });

// Actualizar stock de un producto
export const updateProductStock = async (id: string, quantityChange: number) => {
  const product = await getProductById(id);
  if (!product) {
    throw new Error("Producto no encontrado");
  }

  const newStock = product.stock + quantityChange;

  if (newStock < 0) {
    throw new Error("No hay suficiente stock");
  }

  product.stock = newStock;
  await product.save();
  return product;
};
