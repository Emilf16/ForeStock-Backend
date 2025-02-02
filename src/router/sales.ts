import express from "express";
import {
  registerSalesHistoryForMonth, 
  generateGeminiSalesReport,
  getSalesHistoryByYearController, 
  createSaleAndInvoice,
  deleteSaleReport,
} from "../controllers/sales"; // Controladores de ventas

import { isAuthenticated } from "../middlewares"; // Middleware para autenticación

export default (router: express.Router) => {
  // Crear una venta y factura
  // Esta ruta crea una venta y la factura correspondiente.
  router.post("/sales", isAuthenticated, createSaleAndInvoice);

  // Generar un reporte de ventas por mes y año
  router.post("/sales/report", isAuthenticated, registerSalesHistoryForMonth);
  
  // Generar un reporte de ventas específico para el Gemini AI, por ID
  // Esta ruta permite generar un reporte de ventas personalizado para Gemini utilizando el ID proporcionado en la URL.
  router.post(
    "/sales/report-ai",
    isAuthenticated,
    generateGeminiSalesReport
  );

  // Actualizar un reporte de venta existente
  // router.patch("/sales/report/:id", isAuthenticated, updateSaleReport);

  // Eliminar un reporte de venta
  // Esta ruta permite eliminar un reporte de ventas específico, utilizando el ID del reporte en la URL.
  router.delete("/sales/report/:id", isAuthenticated, deleteSaleReport);

  // Obtener el historial de ventas de un año específico
  // Esta ruta permite obtener el historial de ventas de un año específico.
  // El año se proporciona en la URL y se requiere que el usuario esté autenticado.
  router.get(
    "/sales-history/:year",
    isAuthenticated,
    getSalesHistoryByYearController
  );
};
