import { Order } from "../models/order.model.js"
import { Shop } from "../models/shop.model.js"

export const placeOrder = async (req, res) => {
    try {
        const { cartItems, paymentMethod, deliveryAddress } = req.body
        if (cartItems.length == 0 || !cartItems) {
            return res.status(400).json({ message: "cart is empty" })
        }
        if (!deliveryAddress.text || !deliveryAddress.latitude || !deliveryAddress.longitude) {
            return res.status(400).json({ message: "send complete deliveryAddress" })
        }

        const groupItemsByShop = {}

        cartItems.forEach(item => {
            const shopId = item.shop
            if (!groupItemsByShop[shopId]) {
                groupItemsByShop[shopId] = []
            }
            groupItemsByShop[shopId].push(item)
        });

        const shopOrders = await Promise.all(Object.keys(groupItemsByShop).map(async (shopId) => {
            const shop = await Shop.findById(shopId).populate('owner')
            if (!shop) {
                return res.status(404).json({ message: 'Shop not found' })
            }
            const items = groupItemsByShop[shopId]
            const subtotal = items.reduce((sum, i) => Number(sum + i.price.quantity), 0)
            return {
                shop: shop._id,
                owner: shop.owner_id,
                subtotal,
                shopOrderItems: items.map((i) => ({
                    item: i._id,
                    price: i.price,
                    quantity: i.quantity,
                    name: i.name
                }))
            }
        }))


        const newOrder = await Order.create({
            user: req.userId,
            paymentMethod,
            deliveryAddress,
            totalAmount,
            shopOrders
        })

        return res.status(201).json({message:'Order successfully created',newOrder})


    } catch (error) {
        console.log('Error while creating order ',error.message)
        return res.status(500).json({message:'Internal server error'})
    }
}
