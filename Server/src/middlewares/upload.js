import multer from 'multer';

// Use memory storage to get the file buffer instantly
const storage = multer.memoryStorage();

export const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype === 'application/pdf' || 
            file.mimetype === 'text/plain' || 
            file.mimetype.startsWith('image/')
        ) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, TXT, and Images are allowed.'));
        }
    }
});
