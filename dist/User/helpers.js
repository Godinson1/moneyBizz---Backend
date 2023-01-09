"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const util_1 = __importDefault(require("util"));
const config_1 = require("../config");
const bucket = config_1.storage.bucket("bizz_bucket");
const uploadImage = (file) => new Promise((resolve, reject) => {
    const { name, data } = file;
    const blob = bucket.file(name.replace(/ /g, "_"));
    const blobStream = blob.createWriteStream({
        resumable: false,
        gzip: true
    });
    blobStream
        .on("finish", () => {
        const publicUrl = util_1.default.format(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
        resolve(publicUrl);
    })
        .on("error", (err) => {
        console.log(err);
        reject(`Unable to upload image, something went wrong`);
    })
        .end(data);
});
exports.uploadImage = uploadImage;
