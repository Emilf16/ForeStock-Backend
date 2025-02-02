import { Request, Response } from "express";
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoiceById,
  deleteInvoiceById,
  getInvoicesByMonthAndYear,getInvoicesByUser
} from "../db/invoice"; // Importando los métodos del modelo de factura

// Obtener todas las facturas
export const getAllInvoices = async (req: Request, res: Response) => {
  try {
    const invoices = await getInvoices();
    res.status(200).json(invoices);
    return;
  } catch (error) {
    console.error("Error al obtener las facturas:", error);
    res.status(500).json({ message: "Error al obtener las facturas" });
    return;
  }
};

// Obtener una factura por ID
export const getInvoice = async (req: Request, res: Response) => {
  try {
    const invoiceId = req.params.id;
    const invoice = await getInvoiceById(invoiceId);
    if (!invoice) {
      res.status(404).json({ message: "Factura no encontrada" });
      return;
    }
    res.status(200).json(invoice);
    return;
  } catch (error) {
    console.error("Error al obtener la factura:", error);
    res.status(500).json({ message: "Error al obtener la factura" });
    return;
  }
};

// Crear una nueva factura
export const createNewInvoice = async (req: Request, res: Response) => {
  try {
    const newInvoice = await createInvoice(req.body);
    res.status(201).json(newInvoice);
    return;
  } catch (error) {
    console.error("Error al crear la factura:", error);
    res.status(500).json({ message: "Error al crear la factura" });
    return;
  }
};

// Actualizar una factura por ID
export const updateInvoiceData = async (req: Request, res: Response) => {
  try {
    const invoiceId = req.params.id;
    const updatedInvoice = await updateInvoiceById(invoiceId, req.body);
    if (!updatedInvoice) {
      res.status(404).json({ message: "Factura no encontrada" });
      return;
    }
    res.status(200).json(updatedInvoice);
    return;
  } catch (error) {
    console.error("Error al actualizar la factura:", error);
    res.status(500).json({ message: "Error al actualizar la factura" });
    return;
  }
};

// Eliminar una factura por ID
export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const invoiceId = req.params.id;
    const deletedInvoice = await deleteInvoiceById(invoiceId);
    if (!deletedInvoice) {
      res.status(404).json({ message: "Factura no encontrada" });
      return;
    }
    res.status(200).json({ message: "Factura eliminada con éxito" });
    return;
  } catch (error) {
    console.error("Error al eliminar la factura:", error);
    res.status(500).json({ message: "Error al eliminar la factura" });
    return;
  }
};

// Obtener facturas por mes y año
export const getInvoicesForMonthAndYear = async (
  req: Request,
  res: Response
) => {
  try {
    const { month, year } = req.params;
    const invoices = await getInvoicesByMonthAndYear(
      parseInt(month),
      parseInt(year)
    );
    res.status(200).json(invoices);
    return;
  } catch (error) {
    console.error("Error al obtener las facturas por mes y año:", error);
    res
      .status(500)
      .json({ message: "Error al obtener las facturas por mes y año" });
    return;
  }
};
// Obtener facturas por usuario
export const getInvoicesByUserId = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId; // Obtener el userId de los parámetros de la ruta
    const invoices = await getInvoicesByUser(userId); // Llamar a la función del modelo
    res.status(200).json(invoices);
    return;
  } catch (error) {
    console.error("Error al obtener las facturas por usuario:", error);
    res.status(500).json({ message: "Error al obtener las facturas por usuario" });
    return;
  }
};