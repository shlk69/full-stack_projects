let pending;
export const loadRazorpay = () => {
  if (window.Razorpay) return Promise.resolve();
  if (pending) return pending;
  pending = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    let timer;
    const fail = () => { clearTimeout(timer); script.remove(); pending = null; reject(new Error('Payment checkout could not load. Check your connection and retry.')); };
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => { clearTimeout(timer); if (window.Razorpay) resolve(); else fail(); };
    script.onerror = fail;
    timer = setTimeout(fail, 15000);
    document.head.appendChild(script);
  });
  return pending;
};
