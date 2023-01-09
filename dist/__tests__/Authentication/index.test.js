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
const Utility_1 = require("../../Utility");
const http_status_codes_1 = require("http-status-codes");
const models_1 = require("../../models");
const request = (0, supertest_1.default)(app_1.app);
const { BAD_REQUEST, CREATED, OK, INTERNAL_SERVER_ERROR } = http_status_codes_1.StatusCodes;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    (0, Utility_1.connectToTestDB)();
}), 10000);
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield models_1.User.findOneAndDelete({ email: Utility_1.regData.email });
    (0, Utility_1.closeDBConnection)();
}));
jest.useFakeTimers();
describe("Test for Authentication endpoints - Register", () => {
    it("should fail for any empty field", () => __awaiter(void 0, void 0, void 0, function* () {
        const data = { email: "", handle: "", firstName: "", lastName: "", password: "test123" };
        const result = yield request.post("/auth/register").send(data);
        expect(result.status).toEqual(BAD_REQUEST);
        expect(result.body.status).toEqual(Utility_1.error);
    }));
    it("should fail for existing email", () => __awaiter(void 0, void 0, void 0, function* () {
        const data = {
            email: "godinson100@gmail.com",
            handle: "hello",
            firstName: "Testing",
            lastName: "Testing",
            password: "test123"
        };
        const result = yield request.post("/auth/register").send(data);
        expect(result.status).toEqual(BAD_REQUEST);
        expect(result.body.status).toEqual(Utility_1.error);
        expect(result.body).toHaveProperty("message");
        expect(result.body.message).toEqual(`User with email/handle already exist`);
    }), 10000);
    it("should fail for existing handle", () => __awaiter(void 0, void 0, void 0, function* () {
        const data = {
            email: "testing@gmail.com",
            handle: "godinson",
            firstName: "Testing",
            lastName: "Testing",
            password: "test123"
        };
        const result = yield request.post("/auth/register").send(data);
        expect(result.status).toEqual(BAD_REQUEST);
        expect(result.body.status).toEqual(Utility_1.error);
        expect(result.body).toHaveProperty("message");
        expect(result.body.message).toEqual("User with email/handle already exist");
    }), 10000);
    it("should fail for missing fields", () => __awaiter(void 0, void 0, void 0, function* () {
        const data = { firstName: "", lastName: "", password: "test123" };
        const result = yield request.post("/auth/register").send(data);
        expect(result.status).toEqual(INTERNAL_SERVER_ERROR);
        expect(result.body.status).toEqual(Utility_1.error);
    }), 10000);
    it("should register user successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield request.post("/auth/register").send(Utility_1.regData);
        expect(result.status).toEqual(CREATED);
        expect(result.body.status).toEqual(Utility_1.success);
        expect(result.body).toHaveProperty("message");
        expect(result.body.message).toEqual("Successfully registered");
        expect(result.body).toHaveProperty("token");
    }), 10000);
});
describe("Test for Authentication endpoints - Login", () => {
    it("should fail for any empty field", () => __awaiter(void 0, void 0, void 0, function* () {
        const data = { data: "", password: "test123" };
        const result = yield request.post("/auth/login").send(data);
        expect(result.status).toEqual(BAD_REQUEST);
        expect(result.body.status).toEqual(Utility_1.error);
    }));
    it("should fail for empty fields", () => __awaiter(void 0, void 0, void 0, function* () {
        const data = { data: "", password: "" };
        const result = yield request.post("/auth/login").send(data);
        expect(result.status).toEqual(BAD_REQUEST);
        expect(result.body.status).toEqual(Utility_1.error);
    }));
    it("should fail for wrong credentials", () => __awaiter(void 0, void 0, void 0, function* () {
        const data = { data: "fake@gmail.com", password: "wrongpassword" };
        const result = yield request.post("/auth/login").send(data);
        expect(result.status).toEqual(BAD_REQUEST);
        expect(result.body.status).toEqual(Utility_1.error);
    }), 10000);
    it("should login successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        const data = { data: "godinson100@gmail.com", password: "123456" };
        const result = yield request.post("/auth/login").send(data);
        expect(result.status).toEqual(OK);
        expect(result.body.status).toEqual(Utility_1.success);
        expect(result.body).toHaveProperty("message");
        expect(result.body).toHaveProperty("token");
    }), 10000);
});
