import { DeliveryAssignment } from "../models/deliveryAssignment.model.js"
import { Order } from "../models/order.model.js"
import { Shop } from "../models/shop.model.js"
import User from "../models/user.model.js"
import { sendDeliveryOtpMail } from "../utils/mail.js"

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
                    item: i.id,
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
        await newOrder.populate("shopOrders.shopOrderItems.item", "name image price")
        await newOrder.populate("shopOrders.shop", "name")


        return res.status(201).json({ message: 'Order successfully created', newOrder })


    } catch (error) {
        console.log('Error while creating order ', error.message)
        return res.status(500).json({ message: 'Internal server error' })
    }
}


export const getMyOrders = async (req, res) => {
    try {
        const user = await User.find(req.userId)
        if (user.role === 'user') {
            const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 })
                .populate("shopOrders.shop", "name")
                .populate("shopOrders.o wner", "name email mobile")
                .populate("shopOrders.shopOrderItems.item", "name image price")

            return res.status(200).json(orders)
        } else if (user.role === 'owner') {
            const orders = await Order.find({ "shopOrders.owner": req.userId })
                .sort({ createdAt: -1 })
                .populate("shopOrders.shop", "name")
                .populate("user")
                .populate("shopOrders.shopOrderItems.item", "name image price")
                .populate("shopOrders.assignedDeliveryBoy", "fullName mobile ")

            const filteredOrders = orders.map((order) => ({
                _id: order._id,
                paymentMethod: order.paymentMethod,
                user: order.user,
                shopOrders: order.shopOrders.find(o => o.owner._id == req.userId),
                createdAt: order.createdAt,
                deliveryAddress: order.deliveryAddress
            }))

            return res.status(200).json(filteredOrders)

        }
    } catch (error) {
        console.log('Error while getting user order ', error.message)
        return res.status(500).json({ message: `Internal server error` })
    }
}


export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, shopId } = req.params
        const { status } = req.body
        const order = await Order.findById(orderId)

        const shopOrder = order.shopOrders.find(o => o.shop == shopId)
        if (!shopOrder) {
            return res.status(400).json({ message: "shop order not found" })
        }
        shopOrder.status = status

        let deliveryboysPayload = []
        if (status == "out of delivery" && !shopOrder.assignment) {
            const { longitude, latitude } = order.deliveryAddress
            const nearByDeliveryBoys = await User.find({
                role: "deliveryBoy",
                location: {
                    $near: {
                        $geometry: { type: "Point", coordinates: [Number(longitude), Number(latitude)] },
                        $maxDistance: 5000
                    }
                }
            })

            const nearByIds = nearByDeliveryBoys.map(b => b._id)
            const busyIds = await DeliveryAssignment.find({
                assignedTo: { $in: nearByIds },
                status: { $nin: ["brodcasted", "completed"] }

            }).distinct("assignedTo")

            const busyIdSet = new Set(busyIds.map(id => String(id)))

            const availableBoys = nearByDeliveryBoys.filter(b => !busyIdSet.has(String(b._id)))
            const candidates = availableBoys.map(b => b._id)

            if (candidates.length == 0) {
                await order.save()
                return res.json({
                    message: "order status updated but there is no available delivery boys"
                })
            }

            const deliveryAssignment = await DeliveryAssignment.create({
                order: order._id,
                shop: shopOrder.shop,
                shopOrderId: shopOrder._id,
                brodcastedTo: candidates,
                status: "brodcasted"
            })

            shopOrder.assignedDeliveryBoy = deliveryAssignment.assignedTo
            shopOrder.assignment = deliveryAssignment._id
            deliveryboysPayload = availableBoys.map(b => ({
                id: b._id,
                fullName: b.fullName,
                longitude: b.location.coordinates?.[0],
                latitude: b.location.coordinates?.[1],
                mobile: b.mobile

            }))

        }



        await order.save()

        const updatedShopOrder = order.shopOrders.find(o => o.shop == shopId)
        await order.populate("shopOrders.shop", "name")
        await order.populate("shopOrders.assignedDeliveryBoy", "fullName email mobile")


        return res.status(200).json({
            shopOrder: updatedShopOrder,
            assignedDeliveryBoy: updatedShopOrder.assignedDeliveryBoy,
            availableBoys: deliveryBoysPayload,
            assignment: updatedShopOrder.assignment._id
        })

    } catch (error) {
        console.log('Error while updating the status ', error.message)
        return res.status(500).json({ message: `Internal server error` })
    }
}




export const getDeliveryBoyAssignment = async (req, res) => {
    try {
        const deliveryBoyId = req.userId
        const assignments = await DeliveryAssignment.find({
            brodcastedTo: deliveryBoyId,
            status: "brodcasted"
        })
            .populate("order")
            .populate("shop")

        const formated = assignments.map(a => ({
            assignmentId: a._id,
            orderId: a.order._id,
            shopName: a.shop.name,
            deliveryAddress: a.order.deliveryAddress,
            items: a.order.shopOrders.find(so => so._id.equals(a.shopOrderId)).shopOrderItems || [],
            subtotal: a.order.shopOrders.find(so => so._id.equals(a.shopOrderId)).subtotal
        }))
        return res.status(200).json(formated)
    } catch (error) {
        console.log('error while getting the assignments')
        return res.status(500).json({ message: 'Internal server error' })
    }
}



export const acceptOrder = async (req, res) => {
    try {
        const { assignmentId } = req.params
        const assignment = await DeliveryAssignment.findById(assignmentId)
        if (!assignment) {
            return res.status(400).json({ message: "assignment not found" })
        }
        if (assignment.status !== "brodcasted") {
            return res.status(400).json({ message: "assignment is expired" })
        }

        const alreadyAssigned = await DeliveryAssignment.findOne({
            assignedTo: req.userId,
            status: { $nin: ["brodcasted", "completed"] }
        })

        if (alreadyAssigned) {

            return res.status(400).json({ message: "You are already assigned to another order" })
        }

        assignment.assignedTo = req.userId
        assignment.status = 'assigned'
        assignment.acceptedAt = new Date()
        await assignment.save()

        const order = await Order.findById(assignment.order)
        if (!order) {
            return res.status(400).json({ message: "order not found" })
        }

        const shopOrder = order.shopOrders.find(so => so._id == assignment.shopOrderId)

        shopOrder.assignedDeliveryBoy = req.userId
        await order.save()
        return res.status(200).json({ message: 'Order accepted successfully' })
    } catch (error) {
        console.log('error while acceting order ', error.message)
        return res.status(500).json({ message: 'Internal server error' })
    }
}


export const getCurrentOrder = async (req, res) => {
    try {
        const assignment = await DeliveryAssignment.findOne({
            assignedTo: req.userId,
            status: "assigned"
        })
            .populate("shop", "name")
            .populate("assignedTo", "fullName email mobile location")
            .populate({
                path: "order",
                populate: [{
                    path: 'user',
                    select: "fullName email location mobile"
                }],
            });

        if (!assignment || !assignment.order) {
            return res.status(404).json({ message: "Assignment not found" });
        }


        const shopOrder = assignment.order.shopOrders.find(so => String(so._id) === String(assignment.shopOrderId));

        if (!shopOrder) {
            return res.status(400).json({ message: "shopOrder not found" });
        }

        let deliveryBoyLocation = { lat: null, lon: null };

        if (assignment.assignedTo && assignment.assignedTo.location && assignment.assignedTo.location.coordinates && assignment.assignedTo.location.coordinates.length === 2) {
            deliveryBoyLocation.lat = assignment.assignedTo.location.coordinates[1];
            deliveryBoyLocation.lon = assignment.assignedTo.location.coordinates[0];
        }

        let customerLocation = { lat: null, lon: null };

        if (assignment.order && assignment.order.deliveryAddress) {
            customerLocation.lat = assignment.order.deliveryAddress.latitude;
            customerLocation.lon = assignment.order.deliveryAddress.longitude;
        }



        return res.status(200).json({
            _id: assignment.order._id,
            user: assignment.order.user,
            shopOrder,
            deliveryAddress: assignment.order.deliveryAddress,
            deliveryBoyLocation,
            customerLocation
        })
        
    } catch (error) {
        // Log the error for internal debugging
        console.error("Error in getCurrentOrder:", error);

        // Return a standard internal server error response
        return res.status(500).json({ message: "Internal server error" });
    }
};



export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params
        const order = await Order.findById(orderId)
            .populate("user")
            .populate({
                path: "shopOrders.shop",
                model: "Shop"
            })
            .populate({
                path: "shopOrders.assignedDeliveryBoy",
                model: "User"
            })
            .populate({
                path: "shopOrders.shopOrderItems.item",
                model: "Item"
            })
            .lean()
        
        
        if (!order) {
            return res.status(404).json({message:'Order not found'})
        }
        return res.status(200).json(order)

    } catch (error) {
        console.log('Error while getting the order by id ', error.message)
        return res.status(500).json({message:'Internal server error'})
    }
}
<<<<<<< HEAD




export const sendDeliveryOtp = async (req, res) => {
    try {
        const { orderId, shopOrderId } = req.body
        const order = await Order.findById(orderId).populate("user")
        const shopOrder = order.shopOrders.id(shopOrderId)
        if (!order || !shopOrder) {
            return res.status(400).json({ message: "enter valid order/shopOrderid" })
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString()
        shopOrder.deliveryOtp = otp
        shopOrder.otpExpires = Date.now() + 5 * 60 * 1000
        await order.save()
        await sendDeliveryOtpMail(order.user, otp)
        return res.status(200).json({message:`OTP sent successfully to ${order?.user?.fullName}`})
    } catch (error) {
        console.log('Error while sending the otp ',error.message)
        return res.status(500).json({message:'Internal server error'})
    }
}



export const verifyDeliveryOtp = async (req, res) => {
    try {
        const { orderId, shopOrderId, otp } = req.body
        const order = await Order.findById(orderId).populate("user")
        const shopOrder = order.shopOrders.id(shopOrderId)
        if (!order || !shopOrder) {
            return res.status(400).json({ message: "enter valid order/shopOrderid" })
        }
        if (shopOrder.deliveryOtp !== otp || !shopOrder.otpExpires || shopOrder.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid/Expired Otp" })
        }

        shopOrder.status = "delivered"
        shopOrder.deliveredAt = Date.now()
        await order.save()
        await DeliveryAssignment.deleteOne({
            shopOrderId,
            order: orderId
        })
        return res.status(200).json({message:'Order delivered successfully'})

    } catch (error) {
        console.log('Error while verifying the delivery otp ', error.message)
        return res.status(500).json({message:'Internal server error'})
    }
}
=======
>>>>>>> 03eebffdf828a65a854804b40583ef00e9d0e2ae
