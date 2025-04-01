import axios from "axios";
import crypto from 'crypto';
import { orderModel } from "../models/order.js";

export const createPaymentLink = async (req, res, next) => {
    try {
        const { email, amount } = req.body;

        const amountInPesewas = Math.round(amount * 100);

        const response = axios.post(
            'https://api.paystack.co/transaction/initialize',
            {
                email,
                amount: amountInPesewas, // Send amount in pesewas
                currency: 'GHS', // Ensure the currency is set to GHS
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                },
            }
        );

        res.status(200).json({
            message: 'Payment link generated successfully',
            date: response.data
        })
    } catch (error) {
        next(error)
    }
}



export const handleWebhook = async (req, res) => {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    const hash = crypto
        .createHmac('sha512', secret)
        .update(JSON.stringify(req.body))
        .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
        return res.status(400).json({ message: 'Invalid signature' });
    }

    const event = req.body;

    if (event.event === 'charge.success') {
        const { reference } = event.data;

        await orderModel.findByIdAndUpdate(
            { paymentReference: reference },
            { status: 'Paid' }
        );
    }

    res.status(200).send('webhook received');
}