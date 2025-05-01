import {Router} from 'express';
import { updateStock, getInventoryStatus, getInventoryHistory } from '../controllers/inventory.js';
import { isAuthenticated } from '../middlewares/auth.js';

const inventoryRouter = Router();

// inventoryRouter.use(isAuthenticated); // Protect all inventory routes

inventoryRouter.put('/inventory-update/:productId', isAuthenticated, updateStock);
inventoryRouter.get('/inventory-status', isAuthenticated, getInventoryStatus);
inventoryRouter.get('/inventory-history/:productId', isAuthenticated, getInventoryHistory);

export default inventoryRouter; 