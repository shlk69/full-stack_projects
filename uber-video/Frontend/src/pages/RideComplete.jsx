import { API_BASE_URL } from "../config";
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { downloadReceipt } from '../tripApi';
let checkoutLoader;
const loadCheckout = () => {
  if (window.Razorpay) return Promise.resolve();
  if (!checkoutLoader) checkoutLoader = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = resolve;
    script.onerror = () => { checkoutLoader = null; script.remove(); reject(new Error('Could not load payment checkout. Please retry.')); };
    document.body.appendChild(script);
  });
  return checkoutLoader;
};
const RideComplete = () => {
  const { rideId } = useParams();
  const [ride, setRide] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const config = () => ({ headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
  const base = API_BASE_URL + '/rides/' + rideId;
  const message = err => err.response?.data?.message || err.message || 'Please try again.';
  useEffect(() => {
    const controller = new AbortController();
    axios.get(base + '/checkout', { ...config(), signal: controller.signal }).then(({ data }) => setRide(data))
      .catch(err => { if (!axios.isCancel(err)) setError(message(err)); });
    return () => controller.abort();
  }, [base]);
  const refresh = async () => { const { data } = await axios.get(base + '/checkout', config()); setRide(data); return data; };
  const pay = async () => {
    setBusy(true); setError('');
    try {
      await loadCheckout();
      const { data: order } = await axios.post(base + '/payment-order', {}, config());
      if (order.paid) { await refresh(); setBusy(false); return; }
      const checkout = new window.Razorpay({ key: order.key, order_id: order.id, amount: order.amount, currency: order.currency,
        name: 'Uber Ride', description: 'Completed ride fare',
        handler: async response => {
          try { await axios.post(base + '/payment-verify', response, config()); await refresh(); }
          catch (err) { setError(message(err)); }
          finally { setBusy(false); }
        },
        modal: { ondismiss: () => { setBusy(false); setError('Checkout closed. You can retry or check payment status.'); } }
      });
      checkout.on('payment.failed', () => { setBusy(false); setError('Payment failed. Please retry.'); });
      checkout.open();
    } catch (err) { setError(message(err)); setBusy(false); }
  };
  const saveReview = async event => {
    event.preventDefault(); setBusy(true); setError('');
    try { const { data } = await axios.post(base + '/review', { rating, comment }, config()); setRide(previous => ({ ...previous, review: data.review })); }
    catch (err) { setError(message(err)); } finally { setBusy(false); }
  };
  return <main className="min-h-screen bg-gray-50 px-4 py-8"><div className="mx-auto max-w-lg rounded-2xl bg-white p-6 shadow">
    <h1 className="text-2xl font-semibold">Ride completed</h1>
    {error && <p role="alert" className="my-3 text-red-600">{error}</p>}
    {!ride ? <button onClick={() => refresh().catch(err => setError(message(err)))} className="mt-4 underline">Load ride details</button> : <>
      <p className="mt-4 text-gray-600">{ride.pickup} → {ride.destination}</p>
      <p className="mt-3 text-3xl font-semibold">₹{ride.fare}</p>
      <p className="mt-2">Captain: {ride.captain?.fullname?.firstname}</p>
      {ride.paymentStatus !== 'paid' ? <div className="mt-5 space-y-3">
        <button disabled={busy} onClick={pay} className="w-full rounded-lg bg-green-600 p-3 font-semibold text-white disabled:opacity-50">{busy ? 'Processing…' : 'Pay with Razorpay'}</button>
        <button disabled={busy} onClick={() => refresh().catch(err => setError(message(err)))} className="w-full underline">Check payment status</button>
      </div> : <>
        <p role="status" className="mt-4 font-semibold text-green-700">Payment successful · ₹{ride.fare}</p>
        <button className="mt-3 underline" onClick={() => downloadReceipt("user", rideId).catch(err => setError(message(err)))}>Download receipt</button>
        {ride.review?.createdAt ? <p className="mt-5">Thank you! Your {ride.review.rating}-star review has been saved.</p> : <form onSubmit={saveReview} className="mt-6">
          <h2 className="text-lg font-semibold">Rate your captain</h2>
          <div role="group" aria-label="Rating" className="my-3 flex gap-3">{[1,2,3,4,5].map(value => <button key={value} type="button" aria-label={value + ' stars'} aria-pressed={rating === value} onClick={() => setRating(value)} className={'text-3xl ' + (value <= rating ? 'text-yellow-500' : 'text-gray-300')}>★</button>)}</div>
          <label htmlFor="review" className="text-sm">Your review (optional)</label>
          <textarea id="review" maxLength={1000} value={comment} onChange={event => setComment(event.target.value)} className="mt-2 w-full rounded-lg border p-3" placeholder="How was your ride?" />
          <button disabled={!rating || busy} className="mt-3 w-full rounded-lg bg-black p-3 text-white disabled:opacity-50">{busy ? 'Saving…' : 'Submit review'}</button>
        </form>}
      </>}
    </>}
    <Link to="/home" className="mt-6 block text-center underline">Back to home</Link>
  </div></main>;
};
export default RideComplete;
