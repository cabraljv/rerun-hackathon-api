const express = require('express')
const router = express.Router()

const searchController = require('../controllers/search')

router.get('/', searchController.searchAllBulls)
router.get('/:bullId', searchController.searchSingleBull)

module.exports = router
