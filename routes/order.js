import { Router } from "express";
import { addOrder, getUserOrders, updateOrderStatus } from "../controllers/order.js";
import { hasPermission, isAuthenticated } from "../middlewares/auth.js"


const orderRouter = Router();

orderRouter.post('/orders', isAuthenticated, addOrder);
orderRouter.get('/orders', isAuthenticated, hasPermission('get_userOders'), getUserOrders);
orderRouter.put('/order-status/:id', isAuthenticated, hasPermission('update_orderStatus'), updateOrderStatus);

export default orderRouter;