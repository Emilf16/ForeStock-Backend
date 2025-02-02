import express from "express";
import {
  getAllInvoices,
  getInvoice,
  createNewInvoice,
  updateInvoiceData,
  deleteInvoice,
  getInvoicesForMonthAndYear,
} from "../controllers/invoice";

import { isAuthenticated } from "../middlewares";

export default (router: express.Router) => {
  // Route to get all invoices
  // This route handles GET requests to retrieve all invoices.
  router.get("/invoices", isAuthenticated, getAllInvoices);

  // Route to get an invoice by ID
  // This route handles GET requests to retrieve a specific invoice by its ID.
  router.get("/invoices/:id", isAuthenticated, getInvoice);

  // Route to delete an invoice by ID
  // This route handles DELETE requests to remove an invoice by its ID.
  router.delete("/invoices/:id", isAuthenticated, deleteInvoice);

  // Route to get invoices for a specific month and year
  // This route handles GET requests to retrieve invoices for a specific month and year.
  // The month and year are provided in the URL.
  router.get(
    "/invoices/month/:month/year/:year",
    isAuthenticated,
    getInvoicesForMonthAndYear
  );
};
