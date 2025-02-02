import express from "express";
import {
  getAllInvoices,
  getInvoice,
  createNewInvoice,
  updateInvoiceData,
  deleteInvoice,
  getInvoicesForMonthAndYear,getInvoicesByUserId
} from "../controllers/invoice";

import { isAuthenticated } from "../middlewares";

export default (router: express.Router) => {
  // Route to get all invoices
  // This route handles GET requests to retrieve all invoices.
  router.get("/invoices", isAuthenticated, getAllInvoices);

  // Route to get an invoice by ID
  // This route handles GET requests to retrieve a specific invoice by its ID.
  router.get("/invoices/:id", isAuthenticated, getInvoice);

  // Route to create a new invoice
  // This route handles POST requests to create a new invoice.
  router.post("/invoices", isAuthenticated, createNewInvoice);

  // Route to update an invoice by ID
  // This route handles PUT requests to update an existing invoice by its ID.
  router.put("/invoices/:id", isAuthenticated, updateInvoiceData);

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

  // Route to get invoices by user ID
  // This route handles GET requests to retrieve all invoices for a specific user.
  // The user ID is provided in the URL.
  router.get("/invoices/user/:userId", isAuthenticated, getInvoicesByUserId);
};