import jwt from 'jsonwebtoken'


export const isAuth = async (req, resizeBy, next) => {
    try {
        const token = req.cookies
        if (!token) {
            return res.status(400).json({
                message:'Unavailable token'
            })
        }
        const verifyToken = await jwt.verify(token, process.env.JWT_SECRET)

        if (!verifyToken) {
            return res.status(400).json({
                message:'Invalid or expired token'
            })
        }

        req.userId = verifyToken.userId
        next()
    } catch (error) {
        console.log('isAuth error :',error.message)
        return res.status(500).json({
            message: 'Internale server error , no token sent '
        })
    }
}