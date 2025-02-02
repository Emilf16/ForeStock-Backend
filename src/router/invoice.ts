import express from "express";
import {
  getAllInvoices,
  getInvoice,
  createNewInvoice,
  updateInvoiceData,
  deleteInvoice,
  getInvoicesForMonthAndYear,
} from "../controllers/invoice"; // Importando los controladores de factura

import { isAuthenticated } from "../middlewares"; // Middleware para autenticación

export default (router: express.Router) => {
  // Obtener todas las facturas
  router.get("/invoices", isAuthenticated, getAllInvoices);

  // Obtener una factura por ID
  router.get("/invoices/:id", isAuthenticated, getInvoice);
   
  // Eliminar una factura por ID
  router.delete("/invoices/:id", isAuthenticated, deleteInvoice);

  // Obtener facturas por mes y año
  router.get(
    "/invoices/month/:month/year/:year",
    isAuthenticated,
    getInvoicesForMonthAndYear
  );
};
