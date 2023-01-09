"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
process.env.NODE_ENV = "test";
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../../app");
const http_status_codes_1 = require("http-status-codes");
const Utility_1 = require("../../Utility");
const { OK } = http_status_codes_1.StatusCodes;
const request = (0, supertest_1.default)(app_1.app);
let token;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    (0, Utility_1.connectToTestDB)();
    token = yield (0, Utility_1.signInTestUser)(request);
}), 10000);
afterAll(() => {
    (0, Utility_1.closeDBConnection)();
});
jest.useFakeTimers();
describe("Test for Authentication endpoints", () => {
    it("should return all users in database", () => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield request.get("/user");
        expect(data.status).toEqual(OK);
        expect(data.body).toHaveProperty("status");
        expect(data.body).toHaveProperty("message");
        expect(data.body).toHaveProperty("data");
        expect(data.body.message).toEqual("Users data retrieved successfully");
        expect(data.body.status).toEqual(Utility_1.success);
    }), 10000);
    it("should retrieve single user details in database", () => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield request.get("/user/details").set("mb-token", token);
        expect(data.status).toEqual(OK);
        expect(data.body).toHaveProperty("status");
        expect(data.body).toHaveProperty("message");
        expect(data.body).toHaveProperty("data");
        expect(data.body.message).toEqual("User data retrieved successfully");
        expect(data.body.status).toEqual(Utility_1.success);
    }), 10000);
});
