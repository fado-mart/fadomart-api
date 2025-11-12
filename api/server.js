import express from "express";
import cors from "cors";
import connectDB from "../utils/db.js";

import userRouter from "../routes/user.js"
import categoryRouter from "../routes/category.js";
import productRouter from "../routes/product.js";
import orderRouter from "../routes/order.js";
import checkoutRouter from "../routes/checkout.js";
import cartRouter from "../routes/cart.js";
import inventoryRouter from "../routes/inventory.js";
import paymentRouter from "../routes/payment.js";
import reportingRouter from "../routes/reporting.js"


const app = express();

//--- MIDDLEWARE ---
app.use(express.json());
app.use(cors());

//--- ROUTES ---
app.use(userRouter);
app.use(categoryRouter);
app.use(productRouter);
app.use(orderRouter);
app.use(checkoutRouter);
app.use(cartRouter);
app.use(inventoryRouter);
app.use(paymentRouter);
app.use(reportingRouter);

// --- DATABASE CONNECTION ---
await connectDB();

console.log('✅ MongoDB connected successfully.');

export default app;