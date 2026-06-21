import { Project } from "../models/project.model.js";

export const createProject = async (req, res) => {
    try {
        const { name } = req.body

        const loggedInUser = await User.findOne({ email: req.user.email })
        const userId = loggedInUser._id

        const project = await Project.create({
            name,
            users:[userId]
        })

        return res.status(201).json({message:'Project successfully created'})
    } catch (error) {
        return res.status(500).json({error:'Internal server error'})
    }
}

