import { Router } from "express";
import {hasPermission, isAuthenticated} from "../middlewares/auth.js"
import { addCategory, deleteCategory, getCategories, getCategory, updateCategory } from "../controllers/category.js";

const categoryRouter = Router()

categoryRouter.post('/categories', isAuthenticated, hasPermission('add_category'), addCategory);

categoryRouter.get('/categories', getCategories);

categoryRouter.get('/categories/:id', getCategory);

categoryRouter.patch('/categories/:id', isAuthenticated, hasPermission('update_category'), updateCategory);

categoryRouter.delete('/categories/:id', isAuthenticated, hasPermission('delete_category'), deleteCategory)


export default categoryRouter;