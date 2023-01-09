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
const request = (0, supertest_1.default)(app_1.app);
const { BAD_REQUEST, OK } = http_status_codes_1.StatusCodes;
let token;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    (0, Utility_1.connectToTestDB)();
    token = yield (0, Utility_1.signInTestUser)(request);
}), 20000);
afterAll(() => {
    (0, Utility_1.closeDBConnection)();
});
jest.useFakeTimers();
describe("Test for Funding wallet", () => {
    it("should create a charge request depending on otp", () => __awaiter(void 0, void 0, void 0, function* () {
        const data = {
            amount: "50000",
            code: "057",
            account_number: "0000000000"
        };
        const res = yield request.post("/pay/fund/bank").send(data).set("mb-token", token);
        expect(res.status).toEqual(OK);
        expect(res.body).toHaveProperty("data");
        expect(res.body).toHaveProperty("status");
        expect(res.body).toHaveProperty("message");
        expect(res.body.status).toEqual(Utility_1.success);
        expect(res.body.message).toEqual("Payment attempted successfully");
    }), 20000);
    it("should fail for any empty field", () => __awaiter(void 0, void 0, void 0, function* () {
        const data = {
            amount: "50000",
            code: "",
            account_number: "0000000000"
        };
        const res = yield request.post("/pay/fund/bank").send(data).set("mb-token", token);
        expect(res.status).toEqual(BAD_REQUEST);
        expect(res.body).toHaveProperty("status");
        expect(res.body).toHaveProperty("message");
        expect(res.body.status).toEqual(Utility_1.error);
        expect(res.body.message).toEqual("Please provide all required fields");
    }), 20000);
});
describe("Test for Debiting wallet", () => {
    //Currently in starter business mode so can't carry out third party
    //transfers hence why this tests returns an error instead of passsing
    //with status of success and status code of 200
    it("should create a charge request depending on otp", () => __awaiter(void 0, void 0, void 0, function* () {
        const data = {
            amount: 50000,
            code: "050",
            account_number: "0000000000"
        };
        const res = yield request.post("/pay/debit").send(data).set("mb-token", token);
        expect(res.status).toEqual(BAD_REQUEST);
        expect(res.body).toHaveProperty("status");
        expect(res.body).toHaveProperty("message");
        expect(res.body.status).toEqual(Utility_1.error);
        expect(res.body.message).toEqual("Insufficient Fund: Kindly top up your bizz wallet to carry out this transaction");
    }), 20000);
    it("should fail for any empty field", () => __awaiter(void 0, void 0, void 0, function* () {
        const data = {
            amount: "50000",
            code: "",
            account_number: "0000000000"
        };
        const res = yield request.post("/pay/debit").send(data).set("mb-token", token);
        expect(res.status).toEqual(BAD_REQUEST);
        expect(res.body).toHaveProperty("status");
        expect(res.body).toHaveProperty("message");
        expect(res.body.status).toEqual(Utility_1.error);
        expect(res.body.message).toEqual("Please provide all required fields");
    }), 20000);
    it("should fail for insufficient fund from wallet", () => __awaiter(void 0, void 0, void 0, function* () {
        const data = {
            amount: 5000000000,
            code: "057",
            account_number: "0000000000"
        };
        const res = yield request.post("/pay/debit").send(data).set("mb-token", token);
        expect(res.status).toEqual(BAD_REQUEST);
        expect(res.body).toHaveProperty("status");
        expect(res.body).toHaveProperty("message");
        expect(res.body.status).toEqual(Utility_1.error);
        expect(res.body.message).toEqual("Insufficient Fund: Kindly top up your bizz wallet to carry out this transaction");
    }), 20000);
});
