import { Router } from 'express';
import { getSalesReport, getInventoryReport, getUserActivityReport, getProductPerformanceReport, getLowStockReport } from '../controllers/reporting.js';
import { isAuthenticated } from '../middlewares/auth.js';

const reportingRouter = Router();

reportingRouter.get('/sales-report', isAuthenticated, getSalesReport);
reportingRouter.get('/inventory-report', isAuthenticated, getInventoryReport);
reportingRouter.get('/user-activity-report', isAuthenticated, getUserActivityReport);
reportingRouter.get('/product-performance-report', isAuthenticated, getProductPerformanceReport);
reportingRouter.get('/low-stock-report', isAuthenticated, getLowStockReport);

export default reportingRouter; 