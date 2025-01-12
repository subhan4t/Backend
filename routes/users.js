import express from 'express'
import {
    getUser,
    getUserFriends,
    addRemoveFriend
} from '../controllers/users.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router();

/* READ */

router.get("/:id", verifyToken, getUser)
router.get("/:id/friends", verifyToken, getUserFriends)

/* UPDATE */
router.patch("/:id/:friendId", verifyToken, addRemoveFriend);//This function is for to enable add or remove freinds

export default router;