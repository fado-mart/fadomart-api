import { productModel } from "../models/products.js";
import { addProductValidator, updateProductValidator } from "../validators/products.js";
import { inventoryModel } from "../models/inventory.js";


export const addProduct = async (req, res, next) => {
    try {
        // Validate request body
        const image = req.file?.path; //Get uploaded image URL from Cloudinary
        const { error, value } = addProductValidator.validate({
            ...req.body,
        });
        if (error) {
            return res.status(422).json({
                message: "Validation failed",
                errors: error.details.map(detail => detail.message)
            });
        }

        // Validate file upload
        if (!image) {
            return res.status(400).json({
                message: "Product image is required",
                field: "image"
            });
        }


        // Create product with uploaded image
        const product = await productModel.create({
            ...value,
            image,
            user: req.auth.id
        });

        res.status(201).json({
            message: `Product: ${product.productName}, added successfully`,
            product
        });
    } catch (error) {
        next(error);
    }
}

export const getProducts = async (req, res, next) => {
    try {
        const { filter = '{}', sort = '{}', skip = 0, limit = 25 } = req.query;

        const products = await productModel
            .find(JSON.parse(filter))
            .sort(JSON.parse(sort))
            .skip(Number(skip))
            .limit(Number(limit))
            .populate('category', '-_id -timestamps');

        res.json(products);
    } catch (error) {
        next(error);
    }
}

export const getProduct = async (req, res, next) => {
    try {
        const product = await productModel
            .findById(req.params.id)
            .populate('category', '-_id -timestamps');

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(product);
    } catch (error) {
        next(error);
    }
}

export const updateProduct = async (req, res, next) => {
    let uploadedFilePath = null;
    try {
        const image = req.file?.path;
        // Validate request body
        const { error, value } = updateProductValidator.validate({
            ...req.body,
        });
        if (error) {
            return res.status(422).json({
                message: "Validation failed",
                errors: error.details.map(detail => detail.message)
            });
        }

        // Check if product exists
        const existingProduct = await productModel.findById(req.params.id);
        if (!existingProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        let updatedImages = existingProduct.image;

        // Handle new image upload if provided
        if (req.file) {
            try {
                const uploadedImageUrl = req.file.path; // Cloudinary automatically provides a URL
        
                // Store the Cloudinary URL in the updatedImages variable
                updatedImages = uploadedImageUrl;
            } catch (uploadError) {
                return res.status(500).json({
                    message: "Failed to upload new product image",
                    error: uploadError.message,
                    field: "image"
                });
            }
        }

        // Update product
        const updatedProduct = await productModel.findByIdAndUpdate(
            req.params.id,
            { ...value, image: updatedImages },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: `${updatedProduct.productName} modified successfully`,
            product: updatedProduct
        });
    } catch (error) {
        next(error);
    } finally {
        // Clean up local file if it exists
        if (uploadedFilePath) {
            cleanupLocalFile(uploadedFilePath);
        }
    }
}

export const deleteProducts = async (req, res, next) => {
    try {
        const product = await productModel.findOneAndDelete({ _id: req.params.id });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({
            message: `${product.productName} has been deleted successfully.`,
            product
        });
    } catch (error) {
        next(error);
    }
};

export const countProducts = async (req, res, next) => {
    try {
        const { filter = '{}' } = req.query;

        const count = await productModel.countDocuments(JSON.parse(filter));

        res.json({ count });
    } catch (error) {
        next(error);
    }
}

// Update product quantity
export const updateProductQuantity = async (req, res, next) => {
    try {
        const { product, quantity } = req.body;

        console.log('Received request:', { product, quantity });

        // Validate input
        if (!product || !quantity) {
            return res.status(400).json({
                message: "Product ID and quantity are required",
                received: { product, quantity }
            });
        }

        // Validate quantity is a positive number
        if (quantity < 0) {
            return res.status(400).json({
                message: "Quantity must be a positive number",
                received: { product, quantity }
            });
        }

        // First check if product exists
        const existingProduct = await productModel.findById(product);
        console.log('Existing product:', existingProduct);

        if (!existingProduct) {
            return res.status(404).json({
                message: "Product not found",
                productId: product,
                details: "The product ID provided does not exist in the database"
            });
        }

        // Check if there's enough quantity available
        if (quantity > existingProduct.quantity) {
            return res.status(400).json({
                message: "Insufficient product quantity",
                available: existingProduct.quantity,
                requested: quantity
            });
        }

        // Find and update product
        const updatedProduct = await productModel.findByIdAndUpdate(
            product,
            { $set: { quantity } },
            { new: true, runValidators: true }
        );

        console.log('Updated product:', updatedProduct);

        res.status(200).json({
            message: `Product quantity updated successfully`,
            product: updatedProduct,
            previousQuantity: existingProduct.quantity,
            newQuantity: quantity
        });
    } catch (error) {
        console.error('Error updating product quantity:', error);
        next(error);
    }
};

export const syncProductInventory = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        // Update product inventory
        const inventory = await inventoryModel.findOne({ product: productId });
        if (!inventory) {
            return res.status(404).json({ message: 'Inventory record not found' });
        }

        // Update both product and inventory quantities
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.quantity = quantity;
        inventory.quantity = quantity;

        // Update stock status based on quantity
        product.stockStatus = quantity > 0 ? 'In Stock' : 'Out of Stock';

        await Promise.all([
            product.save(),
            inventory.save()
        ]);

        res.json({
            message: 'Product and inventory synchronized successfully',
            product,
            inventory
        });
    } catch (error) {
        next(error);
    }
};