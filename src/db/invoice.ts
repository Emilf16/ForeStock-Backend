import mongoose, { Document, Schema } from "mongoose";
import { IProduct } from "./product";
import { SalesHistoryModel } from "./salesHistory";

const invoiceSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

export interface IInvoice extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  products: {
    productId: IProduct; // Ahora es de tipo IProduct
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
}

export const InvoiceModel = mongoose.model<IInvoice>("Invoice", invoiceSchema);

// Métodos CRUD

// Obtener todas las facturas
export const getInvoices = () =>
  InvoiceModel.find().populate("userId products.productId");

// Obtener una factura por ID
export const getInvoiceById = (id: string) =>
  InvoiceModel.findById(id).populate("userId products.productId");

// Crear una nueva factura
export const createInvoice = (values: Record<string, any>) =>
  new InvoiceModel(values).save().then((invoice) => invoice.toObject());

// Eliminar una factura por ID
export const deleteInvoiceById = (id: string) =>
  InvoiceModel.findByIdAndDelete(id);

// Actualizar una factura por ID
export const updateInvoiceById = (id: string, values: Record<string, any>) =>
  InvoiceModel.findByIdAndUpdate(id, values, { new: true });
// Obtener facturas por mes y año
export const getInvoicesByMonthAndYear = (month: number, year: number) => {
  // Crear el primer y último día del mes
  const startDate = new Date(year, month - 1, 1); // El primer día del mes
  const endDate = new Date(year, month, 0, 23, 59, 59); // El último día del mes

  // Buscar las facturas en el rango de fechas
  return InvoiceModel.find({
    createdAt: {
      $gte: startDate, // Fecha de inicio (primer día del mes)
      $lte: endDate, // Fecha de fin (último día del mes)
    },
  }).populate("userId products.productId");
};

export const registerSalesHistory = async (month: number, year: number) => {
  try {
    if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
      throw new Error("Mes o año inválido");
    }

    const invoices: IInvoice[] = await getInvoicesByMonthAndYear(month, year);
    if (invoices.length === 0) {
      throw new Error("No se encontraron facturas para este mes y año.");
    }

    let totalSalesAmount = 0;
    let totalProductsSold = 0;
    let totalCategorySold = 0;
    const mostSoldProductsMap: Record<
      string,
      { productId: string; totalProducts: number; totalAmount: number }
    > = {};
    const salesByCategoryMap: Record<
      string,
      { category: string; totalProducts: number; totalAmount: number }
    > = {};
    let totalInvoices = invoices.length;

    for (const invoice of invoices) {
      totalSalesAmount += invoice.totalAmount;

      for (const product of invoice.products) {
        const populatedProduct = product.productId;
        const productTotalAmount = populatedProduct.price * product.quantity;
        totalProductsSold += product.quantity;

        const category = populatedProduct.category;
        if (!salesByCategoryMap[category]) {
          salesByCategoryMap[category] = {
            category,
            totalProducts: 0,
            totalAmount: 0,
          };
        }
        salesByCategoryMap[category].totalProducts += product.quantity;
        salesByCategoryMap[category].totalAmount += productTotalAmount;

        if (!mostSoldProductsMap[populatedProduct._id.toString()]) {
          mostSoldProductsMap[populatedProduct._id.toString()] = {
            productId: populatedProduct._id.toString(),
            totalProducts: 0,
            totalAmount: 0,
          };
        }
        mostSoldProductsMap[populatedProduct._id.toString()].totalProducts +=
          product.quantity;
        mostSoldProductsMap[populatedProduct._id.toString()].totalAmount +=
          productTotalAmount;
      }
    }

    totalCategorySold = Object.keys(salesByCategoryMap).length;

    const mostSoldProducts = Object.values(mostSoldProductsMap);
    const salesByCategory = Object.values(salesByCategoryMap);

    const salesHistoryData = {
      month,
      year,
      totalSalesAmount,
      totalProductsSold,
      totalCategorySold,
      mostSoldProducts,
      salesByCategory,
      totalInvoices,
    };

    return await SalesHistoryModel.create(salesHistoryData);
  } catch (error) {
    console.error("Error al registrar el historial de ventas:", error);
    throw error;
  }
};
