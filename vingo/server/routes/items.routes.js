import express from "express"

import { addItem, deleteItem, editItem, getItemById } from "../controllers/item.controllers.js"
import { upload } from "../middleware/multer.js"
import {auth} from '../middleware/auth.js'

const itemRouter = express.Router()

itemRouter.post("/add-item", auth, upload.single("image"), addItem)
itemRouter.post("/edit-item/:itemId", auth, upload.single("image"), editItem)
itemRouter.post("/get-by-id/:itemId", auth,getItemById)
itemRouter.post("/delete/:itemId", auth,deleteItem)


export default itemRouter