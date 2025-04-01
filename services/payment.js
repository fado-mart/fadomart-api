import https from 'https';
import axios from 'axios';

export class PaystackService {
    constructor() {
        this.secretKey = process.env.PAYSTACK_SECRET_KEY;
        this.baseURL = 'https://api.paystack.co';
    }

    async initializePayment(orderData) {
        try {
            const response = await axios.post(`${this.baseURL}/transaction/initialize`, {
                email: orderData.shippingAddress.email,
                amount: orderData.totalPrice * 100, // Convert to pesewas
                currency: 'GHS',
                callback_url: `${process.env.FRONTEND_URL}/payment/verify`,
                metadata: {
                    order_id: orderData.id,
                    custom_fields: [
                        {
                            display_name: "Order ID",
                            variable_name: "order_id",
                            value: orderData.id
                        }
                    ]
                }
            }, {
                headers: {
                    Authorization: `Bearer ${this.secretKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            throw new Error(`Payment initialization failed: ${error.message}`);
        }
    }

    async verifyPayment(reference) {
        try {
            const response = await axios.get(
                `${this.baseURL}/transaction/verify/${reference}`,
                {
                    headers: {
                        Authorization: `Bearer ${this.secretKey}`
                    }
                }
            );

            return response.data;
        } catch (error) {
            throw new Error(`Payment verification failed: ${error.message}`);
        }
    }
} 