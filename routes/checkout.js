import express from "express"
import { Router } from "express";
import { createPaymentLink, handleWebhook } from "../controllers/checkout.js";



const checkoutRouter = Router();

checkoutRouter.post('/pay', createPaymentLink);
checkoutRouter.post('/webhook', express.json(), handleWebhook);

export default checkoutRouter;