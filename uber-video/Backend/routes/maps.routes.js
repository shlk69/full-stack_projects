const express = require('express')
const router = express.Router()
const mapControllers = require('../controllers/maps.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const {query} = require('express-validator')

router.get('/get-coordinates',
    query('address').isString().isLength({min:3}),
    authMiddleware.authUser,mapControllers.getCoorditanes)

router.get('/get-distance-time',
    authMiddleware.authUser, mapControllers.getDistanceTime)


router.get('/get-suggestions',
    query('input').isString().isLength({ min: 3 }),
    authMiddleware.authUser,
    mapControllers.getAutoCompleteSuggestions
)

module.exports = router;
