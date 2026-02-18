"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCapitalGainRecord = exports.getCapitalGainRecords = exports.saveCapitalGainRecord = void 0;
const CapitalGainRecord_1 = require("../models/CapitalGainRecord");
const saveCapitalGainRecord = async (params) => {
    const record = new CapitalGainRecord_1.CapitalGainRecord(params);
    return await record.save();
};
exports.saveCapitalGainRecord = saveCapitalGainRecord;
const getCapitalGainRecords = async (filters) => {
    const query = {};
    if (filters.userId) {
        query.userId = filters.userId;
    }
    if (filters.propertyId) {
        query.propertyId = filters.propertyId;
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
    return await CapitalGainRecord_1.CapitalGainRecord.find(query).sort({ createdAt: -1 });
};
exports.getCapitalGainRecords = getCapitalGainRecords;
const deleteCapitalGainRecord = async (id) => {
    await CapitalGainRecord_1.CapitalGainRecord.findByIdAndDelete(id);
};
exports.deleteCapitalGainRecord = deleteCapitalGainRecord;
