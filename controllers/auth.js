import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'

/* REGISTER USER */

export const register = async(req, res) => {
    try{
        //requesting these params from frontend
        const {
            firstName,
            lastName,
            email,
            password,
            picturePath,
            friends,
            location,
            occupation,
        } = req.body;
        //salt is a random strings which is generated to add on pwd before hashing
        const salt = await bcrypt.genSalt();//geneeration of salts
        //hashing means combining pwd and salts in a constant length of string
        const passwordHash = await bcrypt.hash(password, salt);
        const newUser = new User(
                {
                    firstName,
                    lastName,
                    email,
                    password: passwordHash,
                    picturePath,
                    friends,
                    location,
                    occupation,
                    viewedProfile: Math.floor(Math.random()* 10000),
                    impressions: Math.floor(Math.random()* 10000)
                }
            )
        const savedUser = await newUser.save();
        //201 means created
        res.status(201).json(savedUser)
    } catch(err) {
        //500 means internal server error
        res.status(500).json({ error: err.message });
    }
}

export const login = async(req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email: email});
        if(!user) return res.status(400).json({msg: "User does not exist"});
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(400).json({msg: "Invalid credentials"});

        const token = jwt.sign({ id: user._id}, process.env.JWT_SECRET)
        delete user.password;
        res.status(200).json({token, user})
    } catch(err) {
        res.status(500).json({msg: err.message})
    }
}