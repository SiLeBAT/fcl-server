import multer = require('multer');

export const uploadToMemory = multer({
    // multer settings
    storage: multer.memoryStorage()
}).single('file');
