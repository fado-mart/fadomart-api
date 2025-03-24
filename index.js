import express from "express";
import mongoose from "mongoose";
import cors from "cors";

await mongoose.connect(process.env.MONGO_URI);

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cors());


app.listen(port, () => {
    console.log(`App is listening on port ${port}`)
})