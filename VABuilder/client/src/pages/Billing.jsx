import React from "react";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const Billing = ({ user ,setUser }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !user.isSetupComplete) {
      toast.error("Setup your assistant first");
      navigate("/builder");
    }
  }, [user, navigate]);

  const remainingMessages = Math.max(
    0,
    (user?.requestLimit || 0) - (user?.totalMessages || 0),
  );

  const remainingDays = user?.proExpiresAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(user.proExpiresAt) - new Date()) / (1000 * 60 * 60 * 24),
        ),
      )
    : 0;

  const handlePay = async () => {
    console.log("Inside payment");
    try {
      const res = await axios.post(
        import.meta.env.VITE_SERVER_URL + "/api/billing/order",
        { plan: "pro" },
        { withCredentials: true },
      );

      const order = res.data.order;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "VA Builder",
        description: "Pro Plan Subscription",
        order_id: order.id,
        handler: async (response) => {
          const verifyRes = await axios.post(
            import.meta.env.VITE_SERVER_URL + "/api/billing/verify",
            response,
            { withCredentials: true },
          );

          
          if (verifyRes.data.success) {
            toast.success("Payment successfully");

            setUser(verifyRes.data.user);
          }
        },
        theme: {
          color: "#7c3aed",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error("Payment failed");
      console.error("Payment initiation failed:", error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc] px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#081028]">Plans & Billing</h2>
          <p className="text-gray-500 mt-1">
            Manage your AI assistant subscriptions, usage metrics, and payments.
          </p>
        </div>

        {/* Top Stat Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-400">Current Plan</p>
            <h2 className="text-xl font-bold text-[#081028] mt-1 capitalize">
              {user?.plan}
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-400">Gemini Status</p>
            <h2
              className={`text-xl font-bold mt-1 capitalize ${
                user?.geminiStatus === "active"
                  ? "text-emerald-600"
                  : user?.geminiStatus === "invalid"
                    ? "text-red-500"
                    : "text-amber-500"
              }`}>
              {user?.geminiStatus}
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-400">
              {user?.plan === "free" ? "Messages Left" : "Plan Expiry"}
            </p>
            <h2 className="text-xl font-bold text-[#081028] mt-1 capitalize">
              {user?.plan === "free"
                ? remainingMessages
                : `${remainingDays} Days`}
            </h2>
          </div>
        </div>

        {/* Main Pricing Cards Row - Separated layout to grid-cols-2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 items-stretch">
          {/* Free Plan Card */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#081028]">Free Plan</h2>
              <h3 className="text-5xl font-bold mt-5 text-[#081028]">₹0</h3>
              <ul className="mt-6 space-y-4 text-gray-600">
                <li>200 AI messages</li>
                <li>Voice assistant</li>
                <li>Navigation support</li>
                <li>Basic customization</li>
              </ul>
            </div>
            <div className="mt-8 h-14 w-full text-center flex items-center justify-center text-gray-400 font-medium bg-gray-50 rounded-2xl">
              Default Plan
            </div>
          </div>

          {/* Pro Plan Card */}
          <div className="rounded-3xl p-8 bg-gradient-to-r from-purple-600 to-emerald-500 text-white shadow-lg flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Pro Plan</h2>
              <h3 className="text-5xl font-bold mt-5 text-white">₹299</h3>
              <p className="mt-2 opacity-80">3 Months Premium Access</p>
              <ul className="mt-6 space-y-4 opacity-90">
                <li>Unlimited AI messages</li>
                <li>Advanced AI assistant custom configurations</li>
                <li>Priority response performance & zero latency</li>
                <li>Unlimited smart website navigation</li>
                <li>24/7 Premium technical support</li>
              </ul>
            </div>

            <button
              onClick={handlePay}
              disabled={user?.plan === "pro"}
              className={`mt-8 h-14 w-full rounded-2xl font-semibold transition ${
                user?.plan === "pro"
                  ? "bg-emerald-200 text-black cursor-default"
                  : "bg-white text-[#081028] cursor-pointer hover:bg-gray-100"
              }`}>
              {user?.plan === "pro" ? "Active Plan" : "Upgrade Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
