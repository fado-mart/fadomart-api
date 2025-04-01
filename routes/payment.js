import { Router } from 'express';
import { initiatePayment, verifyPayment } from '../controllers/payment.js';
import { isAuthenticated } from '../middlewares/auth.js';

const paymentRouter = Router();

paymentRouter.post('/payment/initialize', isAuthenticated, initiatePayment);
paymentRouter.get('/payment/verify', verifyPayment);

export default paymentRouter; 