import multer from "multer";
import { multerSaveFilesOrg } from "multer-savefilesorg";

export const userAvatarUpload = multer({
    storage: multerSaveFilesOrg({
        apiAccessToken: process.env.SAVEFILEORG_API_KEY,
        relativePath: '/fadomart-api/users/*'
    }),
    preservePath: true
});

export const productsUpload = multer({
    storage: multerSaveFilesOrg({
        apiAccessToken: process.env.SAVEFILEORG_API_KEY,
        relativePath: '/fadomart-api/products/*'
    }),
    preservePath: true
});