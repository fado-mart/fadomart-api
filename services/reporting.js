import { orderModel } from '../models/order.js';
import { inventoryModel } from '../models/inventory.js';
import { productModel } from '../models/products.js';

export class ReportingService {
    async getSalesReport(startDate, endDate) {
        const salesData = await orderModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
                    status: 'Paid'
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: '$totalPrice' },
                    totalOrders: { $sum: 1 }
                }
            }
        ]);

        return salesData.length ? salesData[0] : { totalSales: 0, totalOrders: 0 };
    }

    async getInventoryReport() {
        // const inventoryData = await inventoryModel.find().populate('product');
        // return inventoryData.map(item => ({
        //     product: item.product.productName,
        //     quantity: item.quantity,
        //     lowStockThreshold: item.lowStockThreshold,
        //     location: item.location
        // }));

        const inventoryData = await inventoryModel.find().populate('product');
        return inventoryData.map(item => ({
            product: item.product?.productName || 'Unknown Product',
            quantity: item.quantity,
            lowStockThreshold: item.lowStockThreshold,
            location: item.location
        }));
    }

    async getUserActivityReport(startDate, endDate) {
        const userActivityData = await orderModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
                    status: 'Paid'
                }
            },
            {
                $group: {
                    _id: '$user',
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: '$totalPrice' }
                }
            },
            {
                $lookup: {
                    from: 'users', // Assuming your user collection is named 'users'
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $unwind: '$userDetails'
            },
            {
                $project: {
                    userId: '$_id',
                    userName: '$userDetails.userName',
                    totalOrders: 1,
                    totalSpent: 1
                }
            }
        ]);

        return userActivityData;
    }

    async getProductPerformanceReport(startDate, endDate) {
        const productPerformanceData = await orderModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
                    status: 'Paid'
                }
            },
            {
                $unwind: '$products'
            },
            {
                $group: {
                    _id: '$products.product',
                    totalQuantitySold: { $sum: '$products.quantity' },
                    totalSales: { $sum: '$totalPrice' }
                }
            },
            {
                $lookup: {
                    from: 'products', // Assuming your product collection is named 'products'
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            {
                $unwind: '$productDetails'
            },
            {
                $project: {
                    productId: '$_id',
                    productName: '$productDetails.productName',
                    totalQuantitySold: 1,
                    totalSales: 1
                }
            }
        ]);

        return productPerformanceData;
    }

    async getLowStockReport() {
        // const lowStockData = await inventoryModel.find({
        //     $expr: {
        //         $lt: ['$quantity', '$lowStockThreshold']
        //     }
        // }).populate('product');

        // return lowStockData.map(item => ({
        //     productId: item.product._id,
        //     productName: item.product.productName,
        //     quantity: item.quantity,
        //     lowStockThreshold: item.lowStockThreshold
        // }));

        const lowStockData = await inventoryModel.find({
            $expr: {
                $lt: ['$quantity', '$lowStockThreshold']
            }
        }).populate('product');
    
        return lowStockData.map(item => ({
            productId: item.product?._id || 'Unknown',
            productName: item.product?.productName || 'Unknown Product',
            quantity: item.quantity,
            lowStockThreshold: item.lowStockThreshold
        }));
    }
} 