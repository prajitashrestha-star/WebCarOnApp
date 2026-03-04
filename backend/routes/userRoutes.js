const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    getUsers
} = require('../controllers/userController');
const { protect, adminOnly } = require('./authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/ping', (req, res) => res.json({ message: "users route alive" }));
router.get('/', protect, adminOnly, getUsers);

module.exports = router;
