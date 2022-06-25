import express from 'express';
import mongoose from 'mongoose';
import { loginValidation, postCreateValidation, registerValidation } from './validations.js';
import checkAuth from './utils/checkAuth.js';
import { getMe, login, register } from './controllers/UserController.js';
import {
  create,
  getAll,
  getLastTags,
  getOne,
  remove,
  update,
} from './controllers/PostController.js';
import multer from 'multer';
import handleValidationErrors from './utils/handleValidationErrors.js';
import cors from 'cors';
import fs from 'fs';

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('db ok');
  })
  .catch((e) => {
    console.log(e);
  });

const app = express();

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads')
    }
    cb(null, 'uploads');
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });
app.use(express.json());
app.use(cors());

app.use('/uploads', express.static('uploads'));

app.post('/auth/login', loginValidation, handleValidationErrors, login);
app.post('/auth/register', registerValidation, handleValidationErrors, register);
app.get('/auth/me', checkAuth, getMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

app.get('/tags', getLastTags);
app.get('/posts', getAll);
app.get('/posts/tags', getLastTags);
app.get('/posts/:id', getOne);
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, create);
app.delete('/posts/:id', checkAuth, remove);
app.patch('/posts/:id', checkAuth, postCreateValidation, handleValidationErrors, update);

app.listen(process.env.PORT || 5000, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log('Server started');
});
