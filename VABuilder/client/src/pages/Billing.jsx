import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { loadRazorpay } from "../utils/razorpay";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const Billing = ({ user ,setUser }) => {
  const navigate = useNavigate();
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState("");

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
    if (paying) return;
    setPaying(true); setPaymentError("");
    try {
      await loadRazorpay();
      const res = await axios.post(
        import.meta.env.VITE_SERVER_URL + "/api/billing/order",
        { plan: "pro" },
        { withCredentials: true },
      );

      const order = res.data.data.order;

      const options = {
        key: res.data.data.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "VA Builder",
        description: "Pro Plan Subscription",
        order_id: order.id,
        handler: async (response) => {
          try {
          const verifyRes = await axios.post(
            import.meta.env.VITE_SERVER_URL + "/api/billing/verify",
            response,
            { withCredentials: true },
          );

          
          if (verifyRes.data.success) {
            toast.success("Payment successfully");

            setUser(verifyRes.data.data.user);
          }
          } catch (error) { const message = error.response?.data?.message || "Payment verification failed. Please retry."; setPaymentError(message); toast.error(message); }
          finally { setPaying(false); }
        },
        modal: { ondismiss: () => setPaying(false) },
        theme: {
          color: "#7c3aed",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", () => { setPaymentError("Payment was declined or failed. You can retry in checkout or close it and try again."); });
      razorpay.open();
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Payment could not start. Please retry.";
      setPaymentError(message); toast.error(message); setPaying(false);
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

        {paymentError && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{paymentError}</p>}
        {paying && <p role="status" className="mb-4">Processing payment. Please complete or close checkout.</p>}
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
              disabled={paying || user?.plan === "pro"}
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
