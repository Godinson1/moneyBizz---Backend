import dotenv from "dotenv"
import util from "util"
import { storage } from "../config"
import { UploadedFile } from "express-fileupload"
import { v2 as cloudinary } from "cloudinary"
import streamifier from "streamifier"

dotenv.config()

const bucket = storage.bucket("bizz_bucket")
cloudinary.config({
    cloud_name: `${process.env.cloudinaryName}`,
    api_key: `${process.env.cloudinaryApiKey}`,
    api_secret: `${process.env.cloudinarySecretKey}`,
    secure: true
})

export const uploadImage = (file: UploadedFile): Promise<string> =>
    new Promise((resolve, reject) => {
        const { name, data } = file

        const blob = bucket.file(name.replace(/ /g, "_"))
        const blobStream = blob.createWriteStream({
            resumable: false,
            gzip: true
        })
        blobStream
            .on("finish", () => {
                const publicUrl = util.format(`https://storage.googleapis.com/${bucket.name}/${blob.name}`)
                resolve(publicUrl)
            })
            .on("error", (err) => {
                console.log(err)
                reject(`Unable to upload image, something went wrong`)
            })
            .end(data)
    })

const uploadFromBuffer = (data: Buffer) => {
    return new Promise((resolve, reject) => {
        const cld_upload_stream = cloudinary.uploader.upload_stream({ folder: "Images" }, (error, result) => {
            if (result) {
                resolve(result)
            } else {
                reject(error)
            }
        })

        streamifier.createReadStream(data).pipe(cld_upload_stream)
    })
}

interface CloudinaryResponse {
    url: string
}

export const uploadImageCloudinary = async (file: UploadedFile): Promise<string> => {
    const result = (await uploadFromBuffer(file.data)) as CloudinaryResponse
    return result.url
}
