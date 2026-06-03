export default function Toast({ message, visible }) {
  return (
    <div className={`toast${visible ? ' show' : ''}`}>
      <span className="toast-icon">
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="#11150d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
      {message}
    </div>
  );
}
