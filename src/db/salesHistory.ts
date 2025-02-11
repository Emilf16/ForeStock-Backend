import mongoose, { Document, Schema } from "mongoose";
import { IInvoice } from "./invoice";
import { IProduct } from "./product";

const salesHistorySchema = new Schema(
  {
    month: { type: Number, required: true }, // Mes de la venta (por ejemplo, 'Enero 2025')
    year: { type: Number, required: true }, // Año de la venta
    totalSalesAmount: { type: Number, required: true }, // Monto total de ventas
    totalProductsSold: { type: Number, required: true }, // Total de productos vendidos
    totalCategorySold: { type: Number, required: true }, // Total de productos vendidos
    mostSoldProducts: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        }, // Producto más vendido
        totalProducts: { type: Number, required: true }, // Cantidad total vendida de ese producto
        totalAmount: { type: Number, required: true }, // Cantidad vendida
      },
    ],
    salesByCategory: [
      {
        category: { type: String, required: true }, // Categoría del producto
        totalProducts: { type: Number, required: true }, // Cantidad total vendida de esa categoría
        totalAmount: { type: Number, required: true }, // Cantidad total vendida de esa categoría
      },
    ],
    totalInvoices: { type: Number, required: true }, // Total de facturas emitidas
  },
  { timestamps: true } // Timestamps para createdAt y updatedAt
);

export interface ISalesHistory extends Document {
  month: number;
  year: number;
  totalSalesAmount: number;
  totalProductsSold: number;
  totalCategorySold: number;
  mostSoldProducts: Array<{
    productId: IProduct; 
    totalProducts: number;
    totalAmount: number;
  }>;
  salesByCategory: Array<{
    category: string;
    totalProducts: number;
    totalAmount: number;
  }>;
  totalInvoices: number;
}

export const SalesHistoryModel = mongoose.model<ISalesHistory>(
  "SalesHistory",
  salesHistorySchema
);

// Métodos CRUD
export const createSalesHistory = async (data: ISalesHistory) => {
  return await SalesHistoryModel.create(data);
};

export const getSalesHistory = () => SalesHistoryModel.find();

export const getSaleHistoryById = async (id: string) => {
  const saleHistory = await SalesHistoryModel.findById(id)
    .populate("mostSoldProducts.productId", "name description price stock category"); // Cargar los detalles del producto

  return saleHistory;
};
export const updateSalesHistory = async (
  id: string,
  data: Partial<ISalesHistory>
) => {
  return await SalesHistoryModel.findByIdAndUpdate(id, data, { new: true });
};

export const deleteSalesHistory = async (id: string) => {
  return await SalesHistoryModel.findByIdAndDelete(id);
};
export const getSalesHistoryByYear = async (year: number) => {
  const salesHistory = await SalesHistoryModel.aggregate([
    {
      $match: { year: year }, // Filtra por el año específico
    },
    {
      $sort: { month: 1, createdAt: -1 }, // Ordena por mes y fecha de creación descendente
    },
    {
      $group: {
        _id: "$month", // Agrupa por mes
        latestSale: { $first: "$$ROOT" }, // Obtiene el primer registro (más reciente) de cada mes
      },
    },
    {
      $replaceRoot: { newRoot: "$latestSale" }, // Reemplaza el documento por el registro más reciente
    },
    {
      $sort: { month: 1 }, // Ordena por mes
    },
  ]);

  // Usamos populate para cargar los detalles del producto
  return await SalesHistoryModel.populate(salesHistory, {
    path: "mostSoldProducts.productId", // Carga los detalles del producto
    select: "name description price stock category", // Campos del producto que quieres cargar
  });
};

