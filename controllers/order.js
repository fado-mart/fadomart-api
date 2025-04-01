import { orderModel } from "../models/order.js";
import { inventoryModel } from "../models/inventory.js";
import { addOrderValidator, updateOrderValidator } from "../validators/order.js";
import { productModel } from "../models/products.js";

export const addOrder = async (req, res, next) => {
    try {
        const { error, value } = addOrderValidator.validate(req.body);
        if (error) {
            return res.status(422).json(error);
        }

        // Check inventory and prepare products with prices
        let totalPrice = 0;
        const productsWithPrices = [];

        for (const item of value.products) {
            const product = await productModel.findById(item.product);
            if (!product) {
                return res.status(404).json({
                    message: `Product ${item.product} not found`
                });
            }

            const inventory = await inventoryModel.findOne({ product: item.product });
            if (!inventory || inventory.quantity < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for product ${product.name}`,
                    available: inventory?.quantity || 0,
                    requested: item.quantity
                });
            }

            // Add price to the product item
            productsWithPrices.push({
                ...item,
                price: product.price // Add the price from the product
            });

            // Calculate total price
            totalPrice += product.price * item.quantity;
        }

        // Create order with products including prices
        const order = await orderModel.create({
            ...value,
            products: productsWithPrices, // Use the products array with prices
            totalPrice,
            user: req.auth.id
        });

        // Update inventory
        // for (const item of value.products) {
        //     await inventoryModel.findOneAndUpdate(
        //         { product: item.product },
        //         { $inc: { quantity: -item.quantity } }
        //     );
        // }

        // Populate product details
        await order.populate('products.product');
        await order.populate('user', 'userName email');

        res.status(201).json({
            message: 'Order created successfully',
            order
        });
    } catch (error) {
        next(error);
    }
};

export const getUserOrders = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const query = { user: req.auth.id };
        
        if (status) {
            query.status = status;
        }

        const orders = await orderModel
            .find(query)
            .populate('products.product')
            .populate('user', 'userName email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await orderModel.countDocuments(query);

        res.status(200).json({
            orders,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page,
                perPage: limit
            }
        });
    } catch (error) {
        next(error);
    }
};

export const updateOrderStatus = async (req, res, next) => {
    try {
        const { error, value } = updateOrderValidator.validate(req.body);
        if (error) {
            return res.status(422).json(error);
        }

        const { status, trackingNumber, cancelReason } = value;
        const orderId = req.params.id;

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Handle inventory updates based on status changes
        if (status === 'Cancelled' && order.status !== 'Cancelled') {
            // Return items to inventory if order is cancelled
            for (const item of order.products) {
                await inventoryModel.findOneAndUpdate(
                    { product: item.product },
                    { $inc: { quantity: item.quantity } }
                );
            }
        }

        // Update order
        order.status = status;
        if (trackingNumber) order.trackingNumber = trackingNumber;
        if (cancelReason) order.cancelReason = cancelReason;
        await order.save();

        // Populate response data
        await order.populate('products.product');
        await order.populate('user', 'userName email');

        

        res.status(200).json({
            message: `Order status updated to ${status}`,
            order
        });
    } catch (error) {
        next(error);
    }
};

export const getOrderDetails = async (req, res, next) => {
    try {
        const order = await orderModel
            .findById(req.params.id)
            .populate('products.product')
            .populate('user', 'userName email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user has permission to view this order
        if (order.user._id.toString() !== req.auth.id && !req.auth.isAdmin) {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }

        res.status(200).json(order);
    } catch (error) {
        next(error);
    }
};
