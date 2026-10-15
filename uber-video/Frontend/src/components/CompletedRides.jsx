import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
const CompletedRides = () => {
  const [rides, setRides] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    axios.get(import.meta.env.VITE_BASE_URL + '/rides/completed', { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } })
      .then(({ data }) => { if (active) setRides(data.rides); })
      .catch(() => { if (active) setError('Unable to load completed rides. Refresh to retry.'); });
    return () => { active = false; };
  }, []);
  return <details className="mb-3"><summary className="cursor-pointer text-sm font-semibold">Completed rides · Payments & reviews</summary>
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    <div className="mt-2 max-h-36 space-y-2 overflow-y-auto">{rides.length ? rides.map(ride => <Link key={ride._id} to={'/ride-complete/' + ride._id} className="block rounded-lg bg-gray-100 p-2 text-sm">
      <span className="block truncate">{ride.destination} · ₹{ride.fare}</span>
      <span>{ride.paymentStatus !== 'paid' ? 'Pay fare' : ride.review?.createdAt ? 'Paid · Reviewed' : 'Paid · Rate captain'}</span>
    </Link>) : !error && <p className="text-sm text-gray-500">No completed rides yet.</p>}</div>
  </details>;
};
export default CompletedRides;
