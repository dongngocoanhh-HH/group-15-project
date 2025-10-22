const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET all users
router.get('/users', userController.getUsers);

// POST create user
router.post('/users', userController.createUser);

// PUT update user
router.put('/users/:id', userController.updateUser);

// DELETE user
router.delete('/users/:id', userController.deleteUser);

module.exports = router;
