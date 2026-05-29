(function () {
    const CLIENT_URL = "http://localhost:5173";
    const theme = 'neon';

    // user id
    const script = document.currentScript;
    const userId = script?.dataset?.userId;
    let  assistantConfig = null

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

            <div class="va-status">Tap Mic to Speak</div>

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


    //load assistant

    const loadAssistant = async () => {
        try {
            const res = await fetch(`http://localhost:8000/api/assistant/config/${userId}`)

            const data = await res.json()
            console.log("config data ",data)

            if (data) {
                assistantConfig = data.user
                applyConfig()
            }
        } catch (error) {
            console.log('frontend error config : ', error.message)
        }
    }

    const applyConfig = () => {
        if (!assistantConfig) return
        popup.className = `va-popup theme-${assistantConfig.theme}`;
        button.className = `va-btn theme-${assistantConfig.theme}`

        const title = popup.querySelector('.va-title')
        title.innerHTML = `Hello! I'm ${assistantConfig.assistantName}`

        const subTitle = popup.querySelector('.va-sub')
        subTitle.innerHTML = `
Welcome to 
${assistantConfig?.businessName || 'our business'}.
<br />
Ask anything about your website.
`;


    }
    



    loadAssistant()

})();
