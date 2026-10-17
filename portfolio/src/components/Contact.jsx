export default function Contact({ onEmailClick, onCallClick }) {
  return (
    <section id="contact">
      <div className="section-inner">
        <div className="contact-panel reveal">
          <div>
            <p className="kicker">Contact</p>
            <h2>Have a product idea, role, or build that needs a sharp full stack developer?</h2>
            <p>
              Based in Indore, Madhya Pradesh. Available for full stack roles, MERN projects,
              dashboards, real-time apps, and backend API work.
            </p>
          </div>
          <div className="contact-actions">
            <button className="button primary" onClick={onEmailClick}>Email</button>
            <button className="button ghost" onClick={onCallClick}>Call</button>
            <a
              className="button ghost"
              href="https://leetcode.com/u/shl_k69/"
              target="_blank"
              rel="noreferrer"
            >
              LeetCode
            </a>
            <a
              className="button ghost"
              href="https://github.com/shlk69"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <a className="button ghost" href="https://www.linkedin.com/in/sahil-kurmi-15b04b2b2/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
        </div>
      </div>
    </section>
  );
}
