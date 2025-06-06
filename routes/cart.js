import { Router } from "express";
import { addToCart, removeFromCart, updateCartItem, viewCart, checkout } from "../controllers/cart.js";
import {isAuthenticated} from "../middlewares/auth.js";


const cartRouter = Router();

cartRouter.post('/cart', isAuthenticated, addToCart);
cartRouter.get('/cart', isAuthenticated, viewCart);
cartRouter.put('/cart/:id', isAuthenticated, updateCartItem);
cartRouter.delete('/cart/:id', isAuthenticated, removeFromCart);
cartRouter.post('/cart/checkout', isAuthenticated, checkout);

export default cartRouter;