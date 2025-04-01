import { Router } from "express";
import { 
    addOrder, 
    getUserOrders, 
    updateOrderStatus, 
    getOrderDetails 
} from "../controllers/order.js";
import { hasPermission, isAuthenticated } from "../middlewares/auth.js"

const orderRouter = Router();

orderRouter.post('/orders', isAuthenticated, addOrder);
orderRouter.get('/orders', isAuthenticated, getUserOrders);
orderRouter.get('/orders/:id', isAuthenticated, getOrderDetails);
orderRouter.put('/orders/:id/status', isAuthenticated, hasPermission('update_orderStatus'), updateOrderStatus);

export default orderRouter;