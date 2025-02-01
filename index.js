import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import dotenv from 'dotenv'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { register } from './controllers/auth.js'
import {createPost} from './controllers/posts.js'
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js'
import postRoutes from './routes/posts.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { verifyToken } from './middleware/auth.js'
import User from './models/User.js';
import Post from './models/Post.js'
import { users, posts } from './data/index.js'



/* CONFIGURATION */

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const corsOptions = {
    origin: ['https://devixbeta.netlify.app','http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
    credentials: true,
}

dotenv.config()
const app = express()
app.use(express.json())
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin"})) //used to secure from cors attack, helmet.cross...is a middleware, cross-origin corp header
app.use(morgan('common'))//
app.use(bodyParser.json({ limit: "30mb", extended: true}))
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true}))
app.use(cors(corsOptions))
app.use("/assets", express.static(path.join(__dirname, 'public/assets'))) //express.static is a middleware used to serve static files

/* FILE STORAGE */

const storage = multer.diskStorage({
    //destination to store file whenever it is uploaded
    destination: function (req, file, cb) {
        cb(null, "public/assets") //initially null is passed it is called error-first callback
    },
    //setting filename
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage })//whenever user upload it is stored

/* ROUTE WITH FILES */
app.post('/auth/register', upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost)

/* ROUTES */
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/posts', postRoutes);

/* TESTING PURPOSE */
app.use("/welcome", (req, res) => {
    res.status(200).send("welcome")
})

/* MONGODB SETUP */
const MONGO_URL = process.env.MONGO_URL

const PORT = process.env.PORT || 6001;
mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    app.listen(PORT, () => { console.log(`Server Port : ${PORT}`)});

    /* DATA ON TIME, THESE 2 CODE MUST RUN SINGLE TIME BECOZ DUMMY DATA IN INDEX.JS RUNS MULTIPLE TIME , IT WILL GEN AN ERR BECOZ MONGODB DIDNT SUPPORT DUPLICATES*/
  /*  User.insertMany(users);
    Post.insertMany(posts); */
}).catch((error) => { console.log(`${error} didn't connect`)});


