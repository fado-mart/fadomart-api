import { Router } from "express";
import { hasPermission, isAuthenticated } from "../middlewares/auth.js";
import { productsUpload } from "../middlewares/upload.js";
import { addProduct, countProducts, deleteProducts, getProduct, getProducts, updateProduct, testDropboxConnection } from "../controllers/products.js";
import upload from "../middlewares/multer.js";

const productRouter = Router()

// Test Dropbox connection
productRouter.get('/test-dropbox', isAuthenticated, testDropboxConnection);

productRouter.post('/products', isAuthenticated, hasPermission('add_product'), upload.single('image'), addProduct);

productRouter.get('/products', getProducts);

productRouter.get('/products/:id', getProduct);

productRouter.patch('/products/:id', isAuthenticated, hasPermission('update_product'), upload.single('image'), updateProduct);

productRouter.delete('/products/:id', isAuthenticated, hasPermission('delete_product'), deleteProducts);

productRouter.get('/products/count', countProducts);

export default productRouter;