import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import userRouter from "./routes/user.js"
import categoryRouter from "./routes/category.js";
import productRouter from "./routes/product.js";

await mongoose.connect(process.env.MONGO_URI);

const app = express();
const port = process.env.PORT;


app.use(express.json());
app.use(cors());


app.use(userRouter);
app.use(categoryRouter);
app.use(productRouter);


app.listen(port, () => {
    console.log(`App is listening on port ${port}`)
})