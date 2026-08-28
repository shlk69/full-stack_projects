import express from "express"

import { addItem, deleteItem, editItem, getItemByCity, getItemById } from "../controllers/item.controllers.js"
import { upload } from "../middleware/multer.js"
import {auth} from '../middleware/auth.js'

const itemRouter = express.Router()

itemRouter.post("/add-item", auth, upload.single("image"), addItem)
itemRouter.post("/edit-item/:itemId", auth, upload.single("image"), editItem)
itemRouter.post("/get-by-id/:itemId", auth,getItemById)
itemRouter.post("/delete/:itemId", auth,deleteItem)
itemRouter.post("/get-by-city/:city", auth,getItemByCity)


export default itemRouter