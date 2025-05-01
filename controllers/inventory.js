import { inventoryModel } from '../models/inventory.js';
import { inventoryHistoryModel } from '../models/inventoryHistory.js';
import { productModel } from '../models/products.js';

export const updateStock = async (req, res, next) => {
  try {
    const {productId} = req.params;
    const { quantity, type, reason } = req.body;

    // First check if product exists
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find or create inventory
    let inventory = await inventoryModel.findOne({ product: productId });
    if (!inventory) {
      // Create new inventory with same quantity as product
      inventory = await inventoryModel.create({
        product: productId,
        quantity: product.quantity, // Sync with product quantity
        lowStockThreshold: 10,
        location: 'Main-Shop'
      });
    }

    const previousQuantity = inventory.quantity;
    let newQuantity;

    switch (type) {
      case 'ADD':
        newQuantity = previousQuantity + quantity;
        break;
      case 'REMOVE':
        if (previousQuantity < quantity) {
          return res.status(400).json({ message: 'Insufficient stock' });
        }
        newQuantity = previousQuantity - quantity;
        break;
      case 'ADJUST':
        newQuantity = quantity;
        break;
      default:
        return res.status(400).json({ message: 'Invalid operation type' });
    }

    // Update both inventory and product
    inventory.quantity = newQuantity;
    inventory.lastUpdated = Date.now();
    product.quantity = newQuantity; // Keep product quantity in sync

    await Promise.all([
      inventory.save(),
      product.save()
    ]);

    // Create history record
    await inventoryHistoryModel.create({
      product: productId,
      type,
      quantity,
      previousQuantity,
      newQuantity,
      reason,
      performedBy: req.auth.id
    });

    // // Check for low stock and send notification if needed
    // if (inventory.isLowStock()) {
    //   // TODO: Implement notification service
    //   console.log(`Low stock alert for product ${productId}`);
    // }

    res.json({
      message: 'Stock updated successfully',
      inventory,
      product: {
        id: product._id,
        name: product.name,
        quantity: product.quantity
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getInventoryStatus = async (req, res, next) => {
  try {
    const inventory = await inventoryModel.find()
      .populate('product', 'name sku price')
      .select('-__v');

    res.json(inventory);
  } catch (error) {
    next(error);
  }
};

export const getInventoryHistory = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const history = await inventoryHistoryModel.find({ product: productId })
      .populate('product', 'name sku')
      .populate('performedBy', 'userName')
      .sort('-createdAt')
      .select('-__v');

    res.json(history);
  } catch (error) {
    next(error);
  }
};

// Add a new function to sync quantities
export const syncInventory = async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const inventory = await inventoryModel.findOne({ product: productId });
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }

    // Use product quantity as source of truth
    inventory.quantity = product.quantity;
    inventory.lastUpdated = Date.now();
    await inventory.save();

    res.json({
      message: 'Inventory synchronized with product',
      inventory,
      product: {
        id: product._id,
        name: product.name,
        quantity: product.quantity
      }
    });
  } catch (error) {
    next(error);
  }
};

export const syncProductWithInventory = async (productId) => {
    const product = await productModel.findById(productId);
    const inventory = await inventoryModel.findOne({ product: productId });

    if (product && inventory) {
        product.quantity = inventory.quantity; // Sync product quantity with inventory
        await product.save();
    }
}; 