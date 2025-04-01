import { cartModel } from "../models/cart.js";
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
        const cart = await cartModel.find({ user: req.auth.id }).populate('product');

        res.status(200).json({ cart });
    } catch (error) {
        next(error);
    }
}

export const updateCartItem = async (req, res, next) => {
    try {
        // const { itemId } = req.params;
        const { quantity } = req.body;

        const cartItem = await cartModel.findById(req.params.id);
        if (!cartItem) {
            return res.status(404).json({ message: 'cart item not found' });
        }

        cartItem.quantity = quantity;
        await cartItem.save();

        res.status(200).json({ message: 'Cart updated', cart: cartItem });
    } catch (error) {
        next(error)
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

// Add inventory check before order processing
const checkInventoryAvailability = async (productId, requestedQuantity) => {
    const inventory = await inventoryModel.findOne({ product: productId });
    if (!inventory || inventory.quantity < requestedQuantity) {
        throw new Error('Insufficient stock');
    }
    return true;
};