const express = require('express');
const { submitArticle } = require('../controllers/articleController');

const router = express.Router();

router.post('/submit', submitArticle);

module.exports = router;
