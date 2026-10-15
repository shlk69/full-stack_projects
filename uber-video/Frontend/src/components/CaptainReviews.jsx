import { useEffect, useState } from 'react';
import axios from 'axios';
const CaptainReviews = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await axios.get(import.meta.env.VITE_BASE_URL + '/captains/reviews', { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
        if (active) { setData(response.data); setError(''); }
      } catch { if (active) setError('Unable to load reviews.'); }
    };
    load(); const timer = setInterval(load, 15000);
    return () => { active = false; clearInterval(timer); };
  }, []);
  return <section className="mt-5 border-t pt-4">
    <h2 className="text-lg font-semibold">Rider reviews</h2>
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    {!data ? <p className="text-sm text-gray-500">Loading reviews…</p> : <>
      <p className="mt-1 text-sm">{data.count ? '★ ' + data.averageRating.toFixed(1) + ' / 5 · ' + data.count + ' reviews' : 'No reviews yet. Completed ride reviews will appear here.'}</p>
      <div className="mt-3 max-h-60 space-y-3 overflow-y-auto">{data.reviews.map(review => <article key={review.id} className="rounded-lg bg-gray-50 p-3">
        <div className="flex justify-between"><span className="font-medium">{review.name}</span><span className="text-yellow-600">{'★'.repeat(review.rating)}</span></div>
        {review.comment && <p className="mt-1 break-words text-sm text-gray-700">{review.comment}</p>}
        <p className="mt-1 text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString('en-IN')}</p>
      </article>)}</div>
    </>}
  </section>;
};
export default CaptainReviews;
