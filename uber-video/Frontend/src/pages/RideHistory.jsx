import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api, errorText, downloadReceipt } from '../tripApi';
import TripTools from '../components/TripTools';
const RideHistory = () => {
  const role = useLocation().pathname.startsWith('/captain') ? 'captain' : 'user';
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    api.get('/trips/' + role + '/history', { params: { page, status }, signal: controller.signal }).then(({ data }) => { setData(data); setError(''); }).catch(err => { if (err.code !== 'ERR_CANCELED') setError(errorText(err)); });
    return () => controller.abort();
  }, [role, page, status, refresh]);
  return <main className="min-h-screen bg-gray-50 px-4 py-6"><div className="mx-auto max-w-3xl">
    <Link to={role === 'captain' ? '/captain-home' : '/home'} className="underline">← Dashboard</Link>
    <h1 className="my-5 text-3xl font-semibold">Ride history</h1>
    <label>Filter by status <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="ml-2 rounded border bg-white p-2"><option value="">All rides</option>{['pending','accepted','ongoing','completed','cancelled'].map(s => <option key={s}>{s}</option>)}</select></label>
    {error && <p role="alert" className="my-3 text-red-700">{error} <button onClick={() => setRefresh(x => x + 1)} className="underline">Retry</button></p>}
    <div className="my-5 space-y-4">{!data ? <p>Loading history…</p> : !data.rides.length ? <p>No rides found.</p> : data.rides.map(ride => <article key={ride._id} className="rounded-xl bg-white p-5 shadow-sm">
      <div className="flex justify-between gap-4"><span className="rounded bg-gray-100 px-2 py-1 text-sm capitalize">{ride.status}</span><strong>₹{ride.fare}</strong></div>
      <p className="mt-3 font-medium">{ride.pickup} → {ride.destination}</p>
      <p className="mt-2 text-sm text-gray-600">{ride.createdAt ? new Date(ride.createdAt).toLocaleString('en-IN') : 'Date unavailable'} · {ride.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}</p>
      {ride.cancellation?.reason && <p className="mt-2 text-sm text-red-700">Cancelled by {ride.cancellation.by}: {ride.cancellation.reason}</p>}
      <div className="mt-3 flex flex-wrap gap-4 text-sm">
        {role === 'user' && ride.status === 'completed' && <Link className="underline" to={'/ride-complete/' + ride._id}>{ride.paymentStatus === 'paid' ? 'Payment & review' : 'Pay fare'}</Link>}
        {ride.paymentStatus === 'paid' && <button className="underline" onClick={() => downloadReceipt(role, ride._id).catch(err => setError(errorText(err)))}>Download receipt</button>}
        {ride.status === 'accepted' && <Link to={role === 'user' ? '/home' : '/captain-home'} state={{ resumeRide: ride }} className="underline">Resume pickup</Link>}
        {ride.status === 'ongoing' && <Link to={role === 'user' ? '/riding' : '/captain-riding'} state={{ ride }} className="underline">Resume ride</Link>}
      </div>
      {['pending','accepted','ongoing'].includes(ride.status) && <TripTools ride={ride} role={role} onCancelled={() => setRefresh(x => x + 1)} />}
    </article>)}</div>
    {data && <div className="flex items-center justify-between"><button disabled={page === 1} onClick={() => setPage(x => x - 1)} className="rounded border px-3 py-2 disabled:opacity-40">Previous</button><p>Page {page} of {data.pages} · {data.count} rides</p><button disabled={page >= data.pages} onClick={() => setPage(x => x + 1)} className="rounded border px-3 py-2 disabled:opacity-40">Next</button></div>}
  </div></main>;
};
export default RideHistory;
