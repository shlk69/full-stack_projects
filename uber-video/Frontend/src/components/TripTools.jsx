import { useContext, useEffect, useRef, useState } from 'react';
import { SocketContext } from '../context/ContextDefinitions';
import { api, errorText } from '../tripApi';
const TripTools = ({ ride, role = 'user', onCancelled }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [reason, setReason] = useState('');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [status, setStatus] = useState(ride?.status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const { socket } = useContext(SocketContext);
  const cancellationHandler = useRef(onCancelled);
  useEffect(() => { cancellationHandler.current = onCancelled; }, [onCancelled]);
  const id = ride?._id;
  const base = '/trips/' + role + '/' + id;
  useEffect(() => {
    if (!id) return;
    let active = true;
    let notified = false;
    const notify = info => { if (!notified) { notified = true; cancellationHandler.current?.(info); } };
    const load = async () => {
      try {
        const { data } = await api.get(base + '/messages');
        if (!active) return;
        setMessages(data.messages); setStatus(data.status); setConnected(true);
        if (data.status === 'cancelled') notify({ reason: data.cancellation?.reason });
      } catch { if (active) setConnected(false); }
    };
    const cancelled = info => { if (info.rideId === id) { setStatus('cancelled'); notify(info); } };
    socket?.on('ride-cancelled', cancelled);
    load(); const timer = setInterval(load, 3000);
    return () => { active = false; clearInterval(timer); socket?.off('ride-cancelled', cancelled); };
  }, [id, base, socket]);
  if (!id) return null;
  const canChat = ['accepted', 'ongoing'].includes(status);
  const canCancel = ['pending', 'accepted'].includes(status);
  const cancel = async event => {
    event.preventDefault(); setBusy(true); setError('');
    try { await api.post(base + '/cancel', { reason }); setStatus('cancelled'); setCancelOpen(false); cancellationHandler.current?.({ reason }); }
    catch (err) { setError(errorText(err)); } finally { setBusy(false); }
  };
  const send = async event => {
    event.preventDefault(); if (!text.trim() || busy) return;
    setBusy(true); setError('');
    try { const { data } = await api.post(base + '/messages', { text, clientId: crypto.randomUUID() }); setMessages(old => [...old, data].slice(-100)); setText(''); }
    catch (err) { setError(errorText(err)); } finally { setBusy(false); }
  };
  return <section className="my-3 rounded-xl border border-gray-200 bg-white p-3 text-sm">
    <div className="flex flex-wrap gap-3">
      {canChat && <button type="button" onClick={() => setChatOpen(value => !value)} className="rounded-lg bg-black px-4 py-2 text-white">{chatOpen ? 'Hide chat' : 'Chat with ' + (role === 'user' ? 'captain' : 'rider')}</button>}
      {canCancel && <button type="button" onClick={() => setCancelOpen(value => !value)} className="rounded-lg border border-red-300 px-4 py-2 text-red-700">Cancel ride</button>}
      {status === 'cancelled' && <p role="status" className="text-red-700">Ride cancelled</p>}
    </div>
    {error && <p role="alert" className="mt-2 text-red-700">{error}</p>}
    {cancelOpen && canCancel && <form onSubmit={cancel} className="mt-3 space-y-2">
      <p>Free cancellation is available before the ride starts. Both people will be notified.</p>
      <label className="block">Reason<textarea required minLength={3} maxLength={300} value={reason} onChange={e => setReason(e.target.value)} className="mt-1 w-full rounded border p-2" /></label>
      <button disabled={busy || reason.trim().length < 3} className="rounded bg-red-600 px-4 py-2 text-white disabled:opacity-50">{busy ? 'Cancelling…' : 'Confirm cancellation'}</button>
    </form>}
    {chatOpen && <div className="mt-3">
      <p className="mb-2 text-xs text-gray-500">{connected ? 'Messages refresh automatically' : 'Reconnecting messages…'}</p>
      <div aria-live="polite" className="max-h-52 space-y-2 overflow-y-auto rounded bg-gray-50 p-2">{messages.length ? messages.map(message => <div key={message._id} className={'rounded-lg p-2 ' + (message.role === role ? 'ml-6 bg-green-100' : 'mr-6 bg-white')}><span className="text-xs font-semibold">{message.role === role ? 'You' : message.role === 'captain' ? 'Captain' : 'Rider'}</span><p className="whitespace-pre-wrap break-words">{message.text}</p></div>) : <p>No messages yet. Say hello.</p>}</div>
      {canChat ? <form onSubmit={send} className="mt-2 flex gap-2"><input aria-label="Message" required maxLength={1000} value={text} onChange={e => setText(e.target.value)} placeholder="Type a message" className="min-w-0 flex-1 rounded border p-2" /><button disabled={busy || !text.trim()} className="rounded bg-black px-3 text-white disabled:opacity-50">Send</button></form> : <p className="mt-2">This chat is closed.</p>}
    </div>}
  </section>;
};
export default TripTools;
