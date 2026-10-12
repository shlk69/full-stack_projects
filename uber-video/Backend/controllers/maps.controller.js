const mapServices = require("../services/maps.service")
const {validationResult} = require('express-validator')


module.exports.getCoorditanes = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors:errors.array()})
    }
    try {
        const { address } = req.query        
        const coordinates = await mapServices.getAddressCoordinate(address)
        res.status(200).json(coordinates)
    } catch (error) {
        return res.status(500).json({message:'Internal server error'})
    }
}

module.exports.getDistanceTime = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors:errors.array()})
    }
    try {
        const { origin,destination } = req.query       
        const distanceTime = await mapServices.getDistanceTime(origin,destination)
        res.status(200).json(distanceTime)
    } catch (error) {
        return res.status(500).json({message:'Internal server error'})
    }
}


module.exports.getAutoCompleteSuggestions = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
            });
        }

        const { input } = req.query;

        const suggestions =
            await mapServices.getAutoCompleteSuggestions(input);

        return res.status(200).json(suggestions);
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

