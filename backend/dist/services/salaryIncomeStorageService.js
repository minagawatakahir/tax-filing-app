"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSalaryIncomeRecord = exports.getSalaryIncomeRecords = exports.saveSalaryIncomeRecord = void 0;
const SalaryIncomeRecord_1 = require("../models/SalaryIncomeRecord");
const saveSalaryIncomeRecord = async (params) => {
    const record = new SalaryIncomeRecord_1.SalaryIncomeRecord(params);
    return await record.save();
};
exports.saveSalaryIncomeRecord = saveSalaryIncomeRecord;
const getSalaryIncomeRecords = async (filters) => {
    const query = {};
    if (filters.userId) {
        query.userId = filters.userId;
    }
    if (filters.year) {
        query.year = filters.year;
    }
    if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) {
            query.createdAt.$gte = filters.startDate;
        }
        if (filters.endDate) {
            query.createdAt.$lte = filters.endDate;
        }
    }
    return await SalaryIncomeRecord_1.SalaryIncomeRecord.find(query).sort({ createdAt: -1 });
};
exports.getSalaryIncomeRecords = getSalaryIncomeRecords;
const deleteSalaryIncomeRecord = async (id) => {
    await SalaryIncomeRecord_1.SalaryIncomeRecord.findByIdAndDelete(id);
};
exports.deleteSalaryIncomeRecord = deleteSalaryIncomeRecord;
