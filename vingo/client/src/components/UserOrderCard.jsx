import React from "react";
import { useNavigate } from "react-router-dom";

const UserOrderCard = ({data}) => {
  const navigate = useNavigate()
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="flex justify-between border-b pb-2">
        <div>
          <p className="font-semibold">order #{data._id.slice(-6)}</p>
          <p className="text-sm text-gray-500">
            Date: {formatDate(data.createdAt)}
          </p>
        </div>
        <div className="text-right flex flex-col items-end gap-1.5">
          {data.paymentMethod == "cod" ? (
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <span>Payment Method:</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                Cash on Delivery
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <span>Payment Status:</span>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  data.payment
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-amber-100 text-amber-800 border border-amber-200"
                }`}>
                {data.payment ? "Paid" : "Pending"}
              </span>
            </div>
          )}

          <p className="font-medium text-blue-600 mt-1">
            {data.shopOrders?.[0]?.status}
          </p>
        </div>
      </div>

      {data.shopOrders.map((shopOrder, index) => (
        <div
          className="border rounded-lg p-3 bg-[#fffaf7] space-y-3"
          key={index}>
          <p>{shopOrder.shop.name}</p>

          <div className="flex space-x-4 overflow-x-auto pb-2">
            {shopOrder.shopOrderItems.map((item, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-40 border rounded-lg p-2 bg-white">
                <img
                  src={item.item.image}
                  alt=""
                  className="w-full h-24 object-cover rounded"
                />
                <p className="text-sm font-semibold mt-1">{item.name}</p>
                <p className="text-xs text-gray-500">
                  Qty: {item.quantity} x ₹{item.price}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center border-t pt-2">
            <p className="font-semibold">Subtotal: {shopOrder.subtotal}</p>
            <span className="text-sm font-medium text-blue-600">
              {shopOrder.status}
            </span>
          </div>
        </div>
      ))}

      <div className="flex justify-between items-center border-t pt-2">
        <p className="font-semibold">Total: ₹{data.totalAmount}</p>
        <button
          onClick={() => navigate(`/track-order/${data._id}`)}
          className="bg-[#ff4d2d] hover:bg-[#e64526] text-white px-4 py-2 rounded-lg text-sm">
          Track Order
        </button>
      </div>
    </div>
  );
};

export default UserOrderCard;
