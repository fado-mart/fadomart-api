import { ReportingService } from '../services/reporting.js';

const reportingService = new ReportingService();

export const getSalesReport = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const report = await reportingService.getSalesReport(startDate, endDate);
        res.status(200).json(report);
    } catch (error) {
        next(error);
    }
};

export const getInventoryReport = async (req, res, next) => {
    try {
        const report = await reportingService.getInventoryReport();
        res.status(200).json(report);
    } catch (error) {
        next(error);
    }
};

export const getUserActivityReport = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const report = await reportingService.getUserActivityReport(startDate, endDate);
        res.status(200).json(report);
    } catch (error) {
        next(error);
    }
};

export const getProductPerformanceReport = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const report = await reportingService.getProductPerformanceReport(startDate, endDate);
        res.status(200).json(report);
    } catch (error) {
        next(error);
    }
};

export const getLowStockReport = async (req, res, next) => {
    try {
        const report = await reportingService.getLowStockReport();
        res.status(200).json(report);
    } catch (error) {
        next(error);
    }
}; 