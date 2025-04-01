import { orderModel } from "../models/order.js";
import { addOrderValidator } from "../validators/order.js"


export const addOrder = async (req, res, next) => {
    try {
        const { error, value } = addOrderValidator.validate(req.body);
        if (error) {
            return res.status(422).json(error);
        }

        const order = await orderModel.create({
            ...value,
            user: req.auth.id
        });

        res.status(201).json({
            message: 'Order created successfully',
            order,
        });
    } catch (error) {
        next(error);
    }
};

export const getUserOrders = async (req, res, next) => {
    try {
        const orders = await orderModel
        .find({user: req.auth.id})
        .populate('products.product')

        res.status(200).json(orders);
    } catch (error) {
        next(error);
    }
};

export const updateOrderStatus = async (req, res, next) => {
    try {
        // const {orderId} = req.params.id;
        const {status} = req.body;

        const order = await orderModel.findByIdAndUpdate(req.params.id, {status}, {new: true});

        if (!order) {
            return res.status(404).json({message: 'Order not found'});
        }

        res.status(200).json({
            message: `Order status updated to ${status}`,
            order,
        })
    } catch (error) {
        next(error);
    }
}
