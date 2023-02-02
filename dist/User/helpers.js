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
exports.uploadImageCloudinary = exports.uploadImage = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const util_1 = __importDefault(require("util"));
const config_1 = require("../config");
const cloudinary_1 = require("cloudinary");
const streamifier_1 = __importDefault(require("streamifier"));
dotenv_1.default.config();
const bucket = config_1.storage.bucket("bizz_bucket");
cloudinary_1.v2.config({
    cloud_name: `${process.env.cloudinaryName}`,
    api_key: `${process.env.cloudinaryApiKey}`,
    api_secret: `${process.env.cloudinarySecretKey}`,
    secure: true
});
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
const uploadFromBuffer = (data) => {
    return new Promise((resolve, reject) => {
        const cld_upload_stream = cloudinary_1.v2.uploader.upload_stream({ folder: "Images" }, (error, result) => {
            if (result) {
                resolve(result);
            }
            else {
                reject(error);
            }
        });
        streamifier_1.default.createReadStream(data).pipe(cld_upload_stream);
    });
};
const uploadImageCloudinary = (file) => __awaiter(void 0, void 0, void 0, function* () {
    const result = (yield uploadFromBuffer(file.data));
    return result.url;
});
exports.uploadImageCloudinary = uploadImageCloudinary;
