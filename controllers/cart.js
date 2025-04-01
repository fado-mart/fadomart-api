import { cartModel } from "../models/cart.js";
import { orderModel } from "../models/order.js";
import { productModel } from "../models/products.js";
import { inventoryModel } from "../models/inventory.js";


export const addToCart = async (req, res, next) => {
    try {
        const { product, quantity } = req.body;

        // Validate input
        if (!product) {
            return res.status(400).json({ 
                message: "Product ID is required",
                received: req.body
            });
        }

        console.log("Request Body:", req.body);
        console.log("Received Product ID:", product);
        console.log("Received Quantity:", quantity);

        // Check if the product exists in the database
        const productData = await productModel.findById(product);
        console.log("Product Data:", productData);

        if (!productData) {
            return res.status(404).json({ 
                message: "Product not found",
                productId: product,
                details: "The product ID provided does not exist in the database"
            });
        }

        // Check inventory availability
        try {
            await checkInventoryAvailability(product, quantity || 1);
        } catch (error) {
            return res.status(400).json({
                message: error.message,
                productId: product,
                requested: quantity
            });
        }

        // Check if the product is already in the user's cart
        const existingCartItem = await cartModel.findOne({
            user: req.auth.id,
            product: productData._id,
        });

        if (existingCartItem) {
            // If the product exists, update the quantity
            existingCartItem.quantity += quantity || 1;
            await existingCartItem.save();
            return res.status(200).json({
                message: "Cart updated successfully",
                cart: existingCartItem,
                product: productData
            });
        }

        // If the product is not in the cart, add it
        const cartItem = await cartModel.create({
            product: productData._id,
            quantity: quantity || 1,
            user: req.auth.id,
        });

        res.status(201).json({
            message: "Product added to cart successfully",
            cart: cartItem,
            product: productData
        });

    } catch (error) {
        console.error('Error adding to cart:', error);
        next(error);
    }
};

export const viewCart = async (req, res, next) => {
    try {
        const cart = await cartModel
            .find({ user: req.auth.id })
            .populate('product');

        let totalPrice = 0;
        cart.forEach(item => {
            totalPrice += item.product.price * item.quantity;
        });

        res.status(200).json({ 
            cart,
            totalPrice,
            itemCount: cart.length
        });
    } catch (error) {
        next(error);
    }
};

export const updateCartItem = async (req, res, next) => {
    try {
        const { quantity } = req.body;

        if (quantity < 1) {
            return res.status(400).json({
                message: "Quantity must be at least 1"
            });
        }

        const cartItem = await cartModel.findById(req.params.id);
        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        // Verify ownership
        if (cartItem.user.toString() !== req.auth.id) {
            return res.status(403).json({ message: 'Not authorized to update this cart item' });
        }

        // Check inventory
        const inventory = await inventoryModel.findOne({ product: cartItem.product });
        if (!inventory || inventory.quantity < quantity) {
            return res.status(400).json({
                message: 'Insufficient stock',
                available: inventory?.quantity || 0,
                requested: quantity
            });
        }

        cartItem.quantity = quantity;
        await cartItem.save();

        // Populate product details in response
        await cartItem.populate('product');

        res.status(200).json({ 
            message: 'Cart updated', 
            cart: cartItem,
            itemPrice: cartItem.product.price * quantity
        });
    } catch (error) {
        next(error);
    }
};

export const removeFromCart = async (req, res, next) => {
    try {
        // const { itemId } = req.params;

        const cartItem = await cartModel.findByIdAndDelete(req.params.id);
        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        res.status(200).json({ message: 'Item removed from cart' });
    } catch (error) {
        next(error);
    }
};

export const checkout = async (req, res, next) => {
    try {
        const { shippingAddress } = req.body;

        // Get user's cart items
        const cartItems = await cartModel
            .find({ user: req.auth.id })
            .populate('product');

        if (!cartItems.length) {
            return res.status(400).json({
                message: "Cart is empty"
            });
        }

        // Prepare order products and calculate total
        let totalPrice = 0;
        const productsWithPrices = [];

        // Validate inventory and prepare order items
        for (const item of cartItems) {
            const inventory = await inventoryModel.findOne({ product: item.product._id });
            if (!inventory || inventory.quantity < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for product ${item.product.name}`,
                    available: inventory?.quantity || 0,
                    requested: item.quantity
                });
            }

            productsWithPrices.push({
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price
            });

            totalPrice += item.product.price * item.quantity;
        }

        // Create order
        const order = await orderModel.create({
            user: req.auth.id,
            products: productsWithPrices,
            totalPrice,
            shippingAddress,
            status: 'Pending'
        });

        // Update inventory
        // for (const item of cartItems) {
        //     await inventoryModel.findOneAndUpdate(
        //         { product: item.product._id },
        //         { $inc: { quantity: -item.quantity } }
        //     );
        // }

        // Clear user's cart
        await cartModel.deleteMany({ user: req.auth.id });

        // Populate order details
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

// Add inventory check before order processing
const checkInventoryAvailability = async (productId, requestedQuantity) => {
    const inventory = await inventoryModel.findOne({ product: productId });
    if (!inventory || inventory.quantity < requestedQuantity) {
        throw new Error('Insufficient stock');
    }
    return true;
};