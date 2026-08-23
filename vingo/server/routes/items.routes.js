import express from "express"

import isAuth from "../middlewares/isAuth.js"
import { addItem, editItem } from "../controllers/item.controllers.js"
import { upload } from "../middlewares/multer.js"
import { auth } from "../middleware/auth.js"

const itemRouter = express.Router()

itemRouter.post("/add-item", auth, upload.single("image"), addItem)
itemRouter.post("/edit-item/:itemId", auth, upload.single("image"), editItem)
