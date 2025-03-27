import { uploadFileToDropbox } from "../middlewares/dropbox.js";
import { productModel } from "../models/products.js";
import { addProductValidator, updateProductValidator } from "../validators/products.js";
import fs from 'fs';
import path from 'path';

// Helper function to clean up local files
const cleanupLocalFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        console.error('Failed to clean up local file:', error);
    }
};

// Test Dropbox connection
export const testDropboxConnection = async (req, res, next) => {
    try {
        // Try to upload a small test file
        const testFilePath = path.join(process.cwd(), 'uploads', 'test.txt');
        
        // Create a test file
        fs.writeFileSync(testFilePath, 'Test file for Dropbox connection');
        
        try {
            const result = await uploadFileToDropbox(testFilePath);
            res.json({
                message: 'Dropbox connection successful',
                details: {
                    path: result.path_display,
                    size: result.size,
                    name: result.name
                }
            });
        } finally {
            // Clean up the test file
            cleanupLocalFile(testFilePath);
        }
    } catch (error) {
        res.status(500).json({
            message: 'Dropbox connection test failed',
            error: error.message
        });
    }
};

export const addProduct = async (req, res, next) => {
    let uploadedFilePath = null;
    try {
        // Validate request body
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
        if (!req.file) {
            return res.status(400).json({ 
                message: "Product image is required",
                field: "image"
            });
        }

        uploadedFilePath = req.file.path;
        let uploadResult;
        
        try {
            uploadResult = await uploadFileToDropbox(uploadedFilePath);
        } catch (uploadError) {
            return res.status(500).json({ 
                message: "Failed to upload product image",
                error: uploadError.message,
                field: "image"
            });
        }

        // Create product with uploaded image
        const product = await productModel.create({
            ...value,
            image: uploadResult.path_display,
            user: req.auth.id
        });

        res.status(201).json({ 
            message: `Product: ${product.productName}, added successfully`,
            product
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
            uploadedFilePath = req.file.path;
            try {
                const uploadResult = await uploadFileToDropbox(uploadedFilePath);
                updatedImages = uploadResult.path_display;
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
        const product = await productModel.findOneAndDelete({_id: req.params.id});

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