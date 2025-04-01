import { PaystackService } from '../services/payment.js';
import { orderModel } from '../models/order.js';
import { inventoryModel } from '../models/inventory.js';
import { productModel } from '../models/products.js';
import { syncProductWithInventory } from '../controllers/inventory.js';

const paystackService = new PaystackService();

export const initiatePayment = async (req, res, next) => {
    try {
        const { orderId } = req.body;

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.user.toString() !== req.auth.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (order.status !== 'Pending') {
            return res.status(400).json({ 
                message: 'Order is not in pending status',
                currentStatus: order.status 
            });
        }

        const paymentData = await paystackService.initializePayment(order);

        // Update order with payment reference
        order.paymentRef = paymentData.data.reference;
        await order.save();

        res.json({
            message: 'Payment initialized',
            paymentUrl: paymentData.data.authorization_url,
            reference: paymentData.data.reference
        });
    } catch (error) {
        next(error);
    }
};

export const verifyPayment = async (req, res, next) => {
    try {
        const { reference } = req.query;

        const paymentData = await paystackService.verifyPayment(reference);

        if (paymentData.data.status === 'success') {
            // Find order and make sure it hasn't been processed already
            const order = await orderModel.findOne({ 
                paymentRef: reference,
                status: 'Pending' // Only process pending orders
            }).populate('products.product');
                
            if (!order) {
                return res.status(404).json({ 
                    message: 'Order not found or already processed'
                });
            }

            // Process all updates in a more controlled way
            for (const item of order.products) {
                // Get current inventory and product state
                const [inventory, product] = await Promise.all([
                    inventoryModel.findOne({ product: item.product._id }),
                    productModel.findById(item.product._id)
                ]);

                console.log('Before update:', {
                    orderId: order._id,
                    productId: item.product._id,
                    orderQuantity: item.quantity,
                    currentInventoryQty: inventory?.quantity,
                    currentProductQty: product?.quantity
                });

                // Calculate new quantities
                const newInventoryQty = inventory.quantity - item.quantity;
                const newProductQty = product.quantity - item.quantity;

                // Validate quantities
                if (newInventoryQty < 0 || newProductQty < 0) {
                    throw new Error(`Insufficient quantity for product ${item.product._id}`);
                }

                // Update both inventory and product
                await Promise.all([
                    inventoryModel.findOneAndUpdate(
                        { product: item.product._id },
                        { 
                            quantity: newInventoryQty,
                            lastUpdated: Date.now()
                        },
                        { new: true }
                    ),
                    productModel.findByIdAndUpdate(
                        item.product._id,
                        { quantity: newProductQty },
                        { new: true }
                    )
                ]);

                // After updating inventory and product quantities
                await syncProductWithInventory(item.product._id);

                console.log('After update:', {
                    orderId: order._id,
                    productId: item.product._id,
                    newInventoryQty,
                    newProductQty
                });
            }

            // Update order status last
            order.status = 'Paid';
            await order.save();

            // Get final updated order
            const updatedOrder = await orderModel.findById(order._id)
                .populate('products.product');

            res.json({
                message: 'Payment verified successfully',
                order: updatedOrder
            });
        } else {
            res.status(400).json({
                message: 'Payment failed',
                status: paymentData.data.status
            });
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        next(error);
    }
}; 