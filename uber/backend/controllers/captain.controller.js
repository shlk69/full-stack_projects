const captainModel = require('../models/captain.model')
const captainService = require('../services/captain.service')
const {validationResult} = require('express-validator')

module.exports.registerCaptain = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { fullname, email, password, vehicle } = req.body;
        const isAlreadyExists = await captainModel.findOne({ email })
        if (isAlreadyExists) {
            return res.status(400).json({message:'Captain already exists'})
        }

        const hashedPassword = await captainModel.hashPassword(password);

        const captain = await captainService.createCaptain({
            firstname: fullname.firstname,
            lastname: fullname.lastname,
            email,
            password: hashedPassword,
            color: vehicle.color,
            plate: vehicle.plate,
            capacity: vehicle.capacity,
            vehicleType: vehicle.vehicleType
        });
        const token = captain.generateAuthToken()
        return res.status(201).json({ token,captain });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
    
}