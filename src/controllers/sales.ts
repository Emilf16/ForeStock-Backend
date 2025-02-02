import { Request, Response } from "express";
import {
  getProductById,
  IProduct,
  ProductModel,
  updateProductStock,
} from "../db/product"; // Métodos de productos (para obtener y actualizar el stock)
import {
  createInvoice,
  getInvoicesByMonthAndYear,
  IInvoice,
  registerSalesHistory,
} from "../db/invoice"; // Método para crear una factura
import { GoogleGenerativeAI } from "@google/generative-ai"; // Clase de GoogleGenerativeAI
import {
  SalesHistoryModel,
  getSalesHistory,
  getSaleHistoryById,
  deleteSalesHistory,
  updateSalesHistory,
  getSalesHistoryByYear,
} from "../db/salesHistory"; // Modelo de SalesHistory

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
export const createSaleAndInvoice = async (req: Request, res: Response) => {
  try {
    const { products, userId } = req.body; // Productos vendidos y ID del usuario

    if (!products || products.length === 0 || !userId) {
      res.status(400).json({ message: "Faltan campos requeridos" });
      return;
    }

    let totalAmount = 0;
    const productUpdates: Array<Promise<any>> = []; // Promesas de actualización de stock
    const invoiceProducts: Array<{
      productId: string;
      quantity: number;
      price: number;
    }> = [];

    // Iterar por cada producto vendido
    for (const { productId, quantity } of products) {
      // Obtener el producto desde la base de datos
      const product = await getProductById(productId);
      if (!product) {
        res
          .status(400)
          .json({ message: `Producto con ID ${productId} no encontrado` });
        return;
      }

      // Verificar que haya suficiente stock
      if (product.stock < quantity) {
        res.status(400).json({
          message: `No hay suficiente stock para el producto ${product.name}`,
        });
        return;
      }

      // Calcular total de la venta usando el precio del producto en la base de datos
      totalAmount += product.price * quantity;

      // Guardar el producto con su precio real en la factura
      invoiceProducts.push({
        productId,
        quantity,
        price: product.price, // Se usa el precio de la base de datos
      });

      // Agregar la actualización del stock a la lista
      productUpdates.push(updateProductStock(productId, -quantity));
    }

    // Ejecutar todas las actualizaciones de stock en paralelo
    await Promise.all(productUpdates);

    // Crear la factura
    const invoiceData = {
      userId,
      totalAmount,
      products: invoiceProducts, // Usamos los productos con el precio real
      createdAt: new Date(),
    };
    const invoice = await createInvoice(invoiceData);

    // Devolver la respuesta con la factura generada
    res.status(200).json({
      message: "Venta registrada con éxito y factura generada",
      invoice,
    });
    return;
  } catch (error) {
    console.error("Error al registrar venta y crear factura:", error);
    res.status(500).json({ message: "Error interno del servidor" });
    return;
  }
};
export const registerSalesHistoryForMonth = async (
  req: Request,
  res: Response
) => {
  const { month, year } = req.body;

  try {
    const monthNum = Number(month);
    const yearNum = Number(year);

    if (isNaN(monthNum) || isNaN(yearNum) || monthNum < 1 || monthNum > 12) {
      res.status(400).json({ message: "Mes o año inválido" });
      return;
    }

    const firstHistory = await registerSalesHistory(monthNum, yearNum);

    res.status(201).json({
      message: "Historial de ventas registrado exitosamente",
      data: firstHistory,
    });
    return;
  } catch (error: any) {
    console.error("Error al registrar el historial de ventas:", error);

    // Verifica si el error fue lanzado manualmente y tiene un mensaje claro
    if (
      error.message.includes("No se encontraron facturas") ||
      error.message.includes("Mes o año inválido")
    ) {
      res.status(400).json({ message: error.message });
      return;
    }

    res.status(500).json({ message: "Error inesperado en el servidor." });
    return;
  }
};
export const generateGeminiSalesReport = async (
  req: Request,
  res: Response
) => {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Mes actual (1-12)

    // Obtener el historial de ventas por año y mes
    let salesHistory = await SalesHistoryModel.findOne({
      year: currentYear,
      month: currentMonth,
    });

    // Si no hay historial de ventas, registrar un historial nuevo
    if (!salesHistory) {
      console.log("No se encontró historial de ventas, generando uno nuevo...");

      try {
        salesHistory = await registerSalesHistory(currentMonth, currentYear);
      } catch (error) {
        console.error("Error al registrar el historial de ventas:", error);

        // Verifica si el error fue lanzado manualmente y tiene un mensaje claro
        if (
          error.message.includes("No se encontraron facturas") ||
          error.message.includes("Mes o año inválido")
        ) {
          res.status(400).json({ message: error.message });
          return;
        }

        res.status(500).json({ message: "Error inesperado en el servidor." });
        return;
      }
    }

    if (!salesHistory) {
      res.status(400).json({
        message: "El historial de ventas no se pudo generar correctamente.",
      });
      return;
    }

    // Obtener el historial de ventas de meses anteriores
    const previousSalesHistory = await getSalesHistoryByYear(currentYear);
    console.log(previousSalesHistory, "previousSalesHistory");
    if (previousSalesHistory.length === 0) {
      res.status(404).json({
        message: "No se encontraron registros para el año proporcionado",
      });
      return;
    }
    // Filtrar ventas anteriores al mes actual
    const filteredSalesHistory = previousSalesHistory
      .filter((history) => history.month < currentMonth)
      .map((history) => ({
        mes: history.month,
        año: history.year,
        totalVentas: history.totalSalesAmount,
        totalProductosVendidos: history.totalProductsSold,
        totalFacturas: history.totalInvoices,
        productosMasVendidos: history.mostSoldProducts.map((p) => ({
          idProducto: p.productId._id, // Acceso a _id del producto
          nombreProducto: p.productId.name, // Nombre del producto
          descripcionProducto: p.productId.description, // Descripción del producto
          cantidadVendida: p.totalProducts,
          montoTotal: p.totalAmount,
          precio: p.productId.price, // Precio del producto
          categoria: p.productId.category, // Categoría del producto
        })),
        ventasPorCategoria: history.salesByCategory.map((c) => ({
          categoria: c.category,
          totalProductos: c.totalProducts,
          montoTotal: c.totalAmount,
        })),
      }));
    
    console.log(filteredSalesHistory, "filteredSalesHistory");
    
    // Construcción del prompt con datos bien estructurados
    const prompt = `
      Eres un analista de negocios especializado en ventas. A partir del siguiente historial de ventas, quiero que generes un informe detallado de minimo 1000 palabras que incluya los siguientes puntos:
    
      1️⃣ **Resumen General**:  
        - Presenta un resumen del desempeño de ventas en ${currentMonth} ${currentYear}.  
        - Destaca si las ventas aumentaron o disminuyeron en comparación con los meses anteriores.  
        - Historial de ventas pasadas: ${JSON.stringify(
          filteredSalesHistory,
          null,
          2
        )}.
    
      2️⃣ **Análisis de Ventas**:  
        - **Monto Total de Ventas:** ${salesHistory.totalSalesAmount}  
        - **Total de Productos Vendidos:** ${salesHistory.totalProductsSold}  
        - **Total de Facturas Emitidas:** ${salesHistory.totalInvoices}  
        - Comenta si el ticket promedio de venta es alto o bajo.  
    
      3️⃣ **Productos Más Vendidos**:  
        - Enumera los productos más vendidos y la cantidad vendida de cada uno.  
        - Indica si hay un producto estrella y si representa un porcentaje significativo de las ventas totales.  
        - Ejemplo de producto: ${JSON.stringify(
          salesHistory.mostSoldProducts,
          null,
          2
        )}.  
    
      4️⃣ **Desempeño por Categoría**:  
        - Desglosa las ventas por categoría (${JSON.stringify(
          salesHistory.salesByCategory,
          null,
          2
        )}).  
        - ¿Cuál es la categoría con más ventas y cuál la de menor desempeño?  
        - ¿Existen categorías con baja demanda que podrían mejorarse con promociones o descuentos?  
    
      5️⃣ **Tendencias y Patrones**:  
        - Identifica si hay patrones en las ventas (por ejemplo, si ciertos productos se venden más en ciertas fechas o días de la semana).  
        - ¿Existen variaciones estacionales?  
    
      6️⃣ **Recomendaciones Estratégicas**:  
        - Sugerencias para mejorar las ventas en los próximos meses.  
        - ¿Es conveniente aumentar el stock de algún producto en particular?  
        - ¿Existen oportunidades para lanzar campañas de marketing basadas en los datos actuales?  
        - ¿Qué ajustes se pueden hacer en la estrategia de precios?  

      7️⃣ **Conclusión**:  
        - Cierra con una visión general del desempeño del mes y los próximos pasos sugeridos para mejorar las ventas.  

      🔹 **IMPORTANTE:** Sé específico, estructurado y proporciona insights accionables para el equipo de ventas.
      `;

    // Llamar a Gemini para generar el informe de ventas
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const responseText = await result.response.text();

      res.status(200).json({
        message: "Reporte generado con éxito",
        salesData: salesHistory,
        aiGeneratedReport: responseText,
      });
      return;
    } catch (error) {
      console.error("Error al generar el reporte con IA:", error);
      res.status(500).json({
        message: "Hubo un error al generar el reporte con la IA.",
        error: error.message || error,
      });
      return;
    }
  } catch (error) {
    console.error("Error general en la generación del reporte:", error);
    res.status(500).json({
      message: "Hubo un error inesperado al generar el reporte.",
      error: error.message || error,
    });
    return;
  }
};

export const getSalesHistoryByYearController = async (
  req: Request,
  res: Response
) => {
  try {
    const year = parseInt(req.params.year); // Obtén el año de los parámetros de la ruta

    if (!year || isNaN(year)) {
      res.status(400).json({ message: "Año inválido" });
      return;
    }

    const salesHistory = await getSalesHistoryByYear(year); // Llama al método del modelo

    if (salesHistory.length === 0) {
      res.status(404).json({
        message: "No se encontraron registros para el año proporcionado",
      });
      return;
    }

    res.status(200).json(salesHistory); // Devuelve los resultadosreturn
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Hubo un error al obtener el historial de ventas",
      error,
    });
    return;
  }
};
export const getSalesReports = async (req: Request, res: Response) => {
  try {
    const sales = await getSalesHistory();
    res.status(200).json(sales);
    return;
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    res.status(500).json({ message: "Error interno del servidor" });
    return;
  }
};

export const getSaleReport = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    if (id == null || id == undefined) {
      res.status(404).json({ message: "id debe ser provisto" });
      return;
    }
    const sale = await getSaleHistoryById(id);
    res.status(200).json(sale);
    return;
  } catch (error) {
    console.error(`Error al obtener venta con id ${id}:`, error);
    res.status(500).json({ message: "Error interno del servidor" });
    return;
  }
};

export const deleteSaleReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedSaleReport = await deleteSalesHistory(id);

    if (!deletedSaleReport) {
      res.status(404).json({ message: "Venta no encontrado" });
      return;
    }

    res
      .status(200)
      .json({ data: deletedSaleReport, message: "Venta eliminada" });
  } catch (error) {
    console.error("Error al eliminar venta:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const updateSaleReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      month,
      year,
      totalSalesAmount,
      totalProductsSold,
      mostSoldProducts,
      salesByCategory,
      totalInvoices,
    } = req.body;

    // Validación para asegurarse de que ninguno de los campos sea nulo o vacío
    if (
      !month ||
      !year ||
      !totalSalesAmount ||
      !totalProductsSold ||
      !mostSoldProducts ||
      !salesByCategory ||
      !totalInvoices
    ) {
      res.status(400).json({ message: "Todos los campos son requeridos" });
      return;
    }

    const saleReportToUpdate = await getSaleHistoryById(id);

    if (!saleReportToUpdate) {
      res.status(404).json({ message: "Reporte no encontrado" });
      return;
    }

    // Actualiza los campos del reporte con los valores enviados
    saleReportToUpdate.month = month;
    saleReportToUpdate.year = year;
    saleReportToUpdate.totalSalesAmount = totalSalesAmount;
    saleReportToUpdate.mostSoldProducts = mostSoldProducts;
    saleReportToUpdate.salesByCategory;
    saleReportToUpdate.totalInvoices = totalInvoices;

    await updateSalesHistory(id, saleReportToUpdate);

    res
      .status(200)
      .json({ message: "Reporte actualizado", reporte: saleReportToUpdate });
  } catch (error) {
    console.error("Error al actualizar reporte:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
