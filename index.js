import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import userRouter from "./routes/user.js"
import categoryRouter from "./routes/category.js";
import productRouter from "./routes/product.js";
import orderRouter from "./routes/order.js";
import checkoutRouter from "./routes/checkout.js";
import cartRouter from "./routes/cart.js";
import inventoryRouter from "./routes/inventory.js";
import paymentRouter from "./routes/payment.js"

await mongoose.connect(process.env.MONGO_URI);

const app = express();
const port = process.env.PORT;


app.use(express.json());
app.use(cors());


app.use(userRouter);
app.use(categoryRouter);
app.use(productRouter);
app.use(orderRouter);
app.use(checkoutRouter);
app.use(cartRouter);
app.use(inventoryRouter);
app.use(paymentRouter);


app.listen(port, () => {
    console.log(`App is listening on port ${port}`)
})