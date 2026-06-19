import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

export const authenticatedUser = async (req, res, next) => {
   try {
       const token = req.cookies?.token || req.headers.authorization.split(' ')[1]
       if (!token) {
           return res.status(401).json({error:'Unauthoried User'})
       }

       const decode = jwt.verify(token, process.env.JWT_SECRET)
       req.user = decode
   } catch (error) {
       return res.status(500).json({ error:'Unauthoried User'})
   }
};
