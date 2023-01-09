"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = void 0;
const storage_1 = require("@google-cloud/storage");
const path_1 = __importDefault(require("path"));
const serviceKey = path_1.default.join(__dirname, "./keys.json");
const storage = new storage_1.Storage({
    keyFilename: serviceKey,
    projectId: process.env.PROJECT_ID
});
exports.storage = storage;
