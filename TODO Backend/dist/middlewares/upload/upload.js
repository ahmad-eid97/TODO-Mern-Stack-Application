import multer from "multer";
import { MAX_FILE_SIZE } from "./file.validation.js";
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1
    }
});
export default upload;
//# sourceMappingURL=upload.js.map