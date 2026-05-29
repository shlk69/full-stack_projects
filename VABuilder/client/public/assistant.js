(function () {
    const CLIENT_URL = "http://localhost:5173";
    const theme = 'neon';

    // user id
    const script = document.currentScript;
    const userId = script?.dataset?.userId;

    // load css
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${CLIENT_URL}/assistant.css`;
    document.head.appendChild(link);

    // pop-up creation
    const popup = document.createElement('div');
    popup.className = `va-popup theme-${theme}`;

    popup.innerHTML = `
    <div class="va-overlay"></div>

    <div class="va-content">

        <div class="va-top">

            <div class="va-orb-wrap">
                <div class="va-orb-glow"></div>
                <div class="va-orb"></div>
            </div>

            <h2 class="va-title">
            Hello! I'm VA Builder
            </h2>

            <p class="va-sub">
            Your smart voice assistant.
                <br />
                Ask anything about your website.
            </p>

            <div class="va-status">Tap button to Speak</div>

            <div class="va-wave">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>

            <!-- User Text -->
            <div class="va-user-text"></div>

            <!-- AI Text -->
            <div class="va-ai-text"></div>

        </div>

        <div class="va-bottom">
            <button class="va-mic">
                <img
                src="${CLIENT_URL}/mic.png"
                alt="mic"
                class="va-mic-icon"/>
            </button>
        </div>

    </div>
    `;

    document.body.appendChild(popup);

    //floating button

    const button = document.createElement("button")

    button.className = `va-btn theme-${theme}`

    button.innerHTML = `
            <img
                src="${CLIENT_URL}/newlogo.png"
                alt="logo"
            />`


    document.body.appendChild(button)

    //toggle popup
    let open = false

    button.onclick = () => {
        open = !open;
        popup.style.display = open ? "flex" : "none";
    }


})();
