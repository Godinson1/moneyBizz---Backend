import { Storage } from "@google-cloud/storage"
import path from "path"

const serviceKey = path.join(__dirname, "./keys.json")
console.log(serviceKey)

const storage = new Storage({
    keyFilename: serviceKey,
    projectId: "adept-script-279305"
})

export { storage }
