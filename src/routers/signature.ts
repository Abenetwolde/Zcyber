// categoryRoutes.ts
import express from 'express';
import {
  createSignature, fetchAndSaveHashes,
} from '../controller/signature'; // Import category controllers
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
const router = express.Router();


// const upload = multer({ dest: 'uploads/' });const storage = multer.diskStorage({
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, fileName);
    },
  });

const upload = multer({ storage: storage });
// POST /api/signature
// router.route('/create').post(createSignature);
router.post('/create', upload.array('files', 5), createSignature);
router.get('/fetch-hashes', fetchAndSaveHashes);


export default router;
