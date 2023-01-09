"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const helmet_1 = __importDefault(require("helmet"));
const Utility_1 = require("./Utility");
const express_fileupload_1 = __importDefault(require("express-fileupload"));
//Routes
const Authentication_1 = require("./Authentication");
const User_1 = require("./User");
const Payment_1 = require("./Payment");
//import error handler
const index_1 = require("./error/index");
dotenv_1.default.config();
// initializing the express server
const app = (0, express_1.default)();
exports.app = app;
app.use(express_1.default.json());
// enabling cors on the server
app.use((0, cors_1.default)());
//Configure Helmet
app.use((0, helmet_1.default)());
//Device Configurations
app.use(Utility_1.middlewareDetect);
//Uploading file Configurations
app.use((0, express_fileupload_1.default)({
    limits: { fileSize: 50 * 1024 * 1024 }
}));
app.use("/auth", Authentication_1.router);
app.use("/user", User_1.router);
app.use("/pay", Payment_1.router);
// setting fall back route and message for undefined routes
app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = http_status_codes_1.default.NOT_FOUND;
    next(error);
});
//Error handler helper
app.use((err, req, res, next) => {
    (0, index_1.handleError)({ statusCode: http_status_codes_1.default.NOT_FOUND, message: "Route not found!" }, res);
    next();
});
// setting fall back message for other uncaught errors
app.use((error, req, res, next) => {
    res.status(error.status || http_status_codes_1.default.INTERNAL_SERVER_ERROR).json({
        error: {
            message: error.message
        }
    });
    next();
});
