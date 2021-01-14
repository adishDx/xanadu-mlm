import multer from "multer";

const filename = (req, file, cb) => {
  let lastIndex = file.originalname.lastIndexOf(".");
  let ext = file.originalname.substring(lastIndex);
  cb(null, `file-${Date.now()}${ext}`);
};

const destination = (req, file, cb) => cb(null, `${__dirname}/../uploads`);
const storage = multer.diskStorage({ destination, filename });
const upload = multer({ storage });

export default upload;
