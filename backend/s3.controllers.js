const multer = require('multer');
const { PutObjectCommand, ListBucketsCommand, ListObjectsV2Command, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require('./s3.config');

const upload = multer({ storage: multer.memoryStorage() });

const uploadMiddleware = upload.single('file');

const uploadFile = async (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'No File Provided' });
    }

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype
    })

    try {
        await s3.send(command)
        res.json({ message: "Upload successful", key: file.originalname });
    } catch (err) {
        console.error("S3 upload error:", err);
        res.status(500).json({ error: "Failed to upload to S3" });
    }
}

const getAllFiles = async (req, res) => {
    const command = new ListObjectsV2Command({
        Bucket: process.env.AWS_BUCKET_NAME
    });

    try {
        const response = await s3.send(command);
        const editedContent = (response.Contents ?
            response.Contents.map(obj => {
                const{ env } = process;
                const objectURL = `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${encodeURIComponent(obj.Key)}`;

                return {
                    name: obj.Key,
                    lastModified: obj.LastModified,
                    size: obj.Size,
                    objectURL: objectURL
                }
            })
            : 
            []
        )
        res.json({ files: editedContent });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to access S3" });
    }
}

const deleteFile = async (req, res) => {
    const { key } = req.params;

    if (!key) {
        res.status(400).json({ error: "No file key provided" });
    }

    const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key
    });

    try {
        await s3.send(command);
        res.json({ message: `File '${key}' deleted successfully.` });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to delete the file" })
    }
}

module.exports = {
    uploadMiddleware,
    uploadFile,
    getAllFiles,
    deleteFile
}