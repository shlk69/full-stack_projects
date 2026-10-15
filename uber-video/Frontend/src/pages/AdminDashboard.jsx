import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorText } from '../tripApi';
const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [data, setData] = useState(null);
  const [section, setSection] = useState('rides');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([api.get('/admin/overview', { signal: controller.signal }), api.get('/admin/' + section, { signal: controller.signal, params: { page, status, search } })])
      .then(([stats, rows]) => { setOverview(stats.data); setData(rows.data); setError(''); })
      .catch(err => { if (err.code !== 'ERR_CANCELED') { setError(errorText(err)); setOverview(null); setData(null); } });
    return () => controller.abort();
  }, [section, page, status, search, refresh]);
  const name = person => [person?.fullname?.firstname, person?.fullname?.lastname].filter(Boolean).join(' ') || '—';
  return <main className="min-h-screen bg-gray-100 p-4 sm:p-8"><div className="mx-auto max-w-6xl">
    <div className="flex justify-between"><h1 className="text-3xl font-semibold">Operations dashboard</h1><Link to="/home" className="underline">Home</Link></div>
    {error && <p role="alert" className="my-5 rounded bg-red-50 p-4 text-red-700">{error} <button onClick={() => setRefresh(x => x + 1)} className="underline">Retry</button></p>}
    {overview && <div className="my-6 grid grid-cols-2 gap-3 md:grid-cols-4">{[['Riders', overview.users],['Captains',overview.captains],['Active rides',overview.activeRides],['Completed',overview.completed],['Cancelled',overview.cancelled],['Paid rides',overview.paidRides],['Collected fares','₹' + overview.revenue.toFixed(2)]].map(([label,value]) => <div key={label} className="rounded-xl bg-white p-4"><p className="text-sm text-gray-600">{label}</p><strong className="text-2xl">{value}</strong></div>)}</div>}
    <nav className="my-5 flex flex-wrap gap-2">{['rides','users','captains'].map(item => <button key={item} onClick={() => { setSection(item); setPage(1); }} className={'rounded px-4 py-2 capitalize ' + (section === item ? 'bg-black text-white' : 'bg-white')}>{item}</button>)}<button onClick={() => setRefresh(x => x + 1)} className="rounded border px-4 py-2">Refresh</button></nav>
    {section === 'rides' ? <label>Status <select value={status} onChange={e => {setStatus(e.target.value);setPage(1);}} className="rounded border bg-white p-2"><option value="">All</option>{['pending','accepted','ongoing','completed','cancelled'].map(s=><option key={s}>{s}</option>)}</select></label> : <form onSubmit={e => {e.preventDefault();setSearch(draft);setPage(1);}} className="flex gap-2"><input aria-label="Search accounts" value={draft} maxLength={100} onChange={e=>setDraft(e.target.value)} placeholder="Search name or email" className="rounded border p-2" /><button className="rounded bg-black px-4 text-white">Search</button></form>}
    {data && <div className="my-4 overflow-x-auto rounded-xl bg-white"><table className="w-full text-left text-sm"><thead><tr>{(section === 'rides' ? ['Ride / route','Rider / captain','Status','Payment','Fare'] : ['Name','Email','Vehicle / status']).map(h=><th key={h} className="p-4">{h}</th>)}</tr></thead><tbody>{data.items.map(item=><tr key={item._id} className="border-t">{section === 'rides' ? <><td className="max-w-sm p-4"><p>{item.pickup} → {item.destination}</p><small>{item._id}</small>{item.cancellation?.reason && <p className="text-red-700">{item.cancellation.reason}</p>}</td><td className="p-4">{name(item.user)} / {name(item.captain)}</td><td className="p-4">{item.status}</td><td className="p-4">{item.paymentStatus || 'pending'}</td><td className="p-4">₹{item.fare}</td></> : <><td className="p-4">{name(item)}</td><td className="p-4">{item.email}</td><td className="p-4">{item.vehicle?.plate || '—'} {item.status}</td></>}</tr>)}</tbody></table>{!data.items.length && <p className="p-4">No matching records.</p>}</div>}
    {data && <div className="flex justify-between"><button disabled={page===1} onClick={()=>setPage(x=>x-1)} className="rounded border p-2 disabled:opacity-40">Previous</button><span>Page {page} of {data.pages} · {data.count} records</span><button disabled={page>=data.pages} onClick={()=>setPage(x=>x+1)} className="rounded border p-2 disabled:opacity-40">Next</button></div>}
  </div></main>;
};
export default AdminDashboard;
