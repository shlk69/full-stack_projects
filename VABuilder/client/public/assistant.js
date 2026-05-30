(function () {
    const CLIENT_URL = "http://localhost:5173";
    const SERVER_URL = "http://localhost:8000";
    const theme = 'neon';

    // user id
    const script = document.currentScript;
    const userId = script?.dataset?.userId;
    let assistantConfig = null;

    // Global tracking flag for speech recognition state
    let isListening = false;

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
            <h2 class="va-title">Hello! I'm VA Builder</h2>
            <p class="va-sub">
                Your smart voice assistant.<br />
                Ask anything about your website.
            </p>
            <div class="va-status">Tap Mic to Speak</div>
            <div class="va-wave">
                <span></span><span></span><span></span>
                <span></span><span></span><span></span>
            </div>
            <!-- User Text -->
            <div class="va-user-text"></div>
            <!-- AI Text -->
            <div class="va-ai-text"></div>
        </div>
        <div class="va-bottom">
            <button class="va-mic">
                <img src="${CLIENT_URL}/mic.png" alt="mic" class="va-mic-icon"/>
            </button>
        </div>
    </div>
    `;

    document.body.appendChild(popup);

    // floating button
    const button = document.createElement("button");
    button.className = `va-btn theme-${theme}`;
    button.innerHTML = `<img src="${CLIENT_URL}/newlogo.png" alt="logo" />`;
    document.body.appendChild(button);

    // toggle popup
    let open = false;
    button.onclick = () => {
        open = !open;
        popup.style.display = open ? "flex" : "none";
    };

    // load assistant
    const loadAssistant = async () => {
        try {
            const res = await fetch(`http://localhost:8000/api/assistant/config/${userId}`);
            const data = await res.json();
            if (data) {
                assistantConfig = data.user;
                applyConfig();
            }
        } catch (error) {
            console.log('frontend error config : ', error.message);
        }
    };

    const applyConfig = () => {
        if (!assistantConfig) return;
        popup.className = `va-popup theme-${assistantConfig.theme}`;
        button.className = `va-btn theme-${assistantConfig.theme}`;

        const title = popup.querySelector('.va-title');
        title.innerHTML = `Hello! I'm ${assistantConfig.assistantName}`;

        const subTitle = popup.querySelector('.va-sub');
        subTitle.innerHTML = `
            Welcome to ${assistantConfig?.businessName || 'our business'}.<br />
            Ask anything about your website.
        `;
    };

    loadAssistant();

    const status = popup.querySelector(".va-status");
    const wave = popup.querySelector(".va-wave");
    const userText = popup.querySelector(".va-user-text");
    const aiText = popup.querySelector(".va-ai-text");
    const mic = popup.querySelector(".va-mic");

    // text-speech
    const speak = (text) => {
        window.speechSynthesis.cancel();

        aiText.innerText = text;
        status.innerText = "AI Speaking...";

        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = "hi-IN";
        speech.rate = 1;
        speech.pitch = 1;
        speech.volume = 1;

        speech.onend = () => {
            status.innerText = "Tap mic to Speak";
            wave.style.opacity = "0";
        };

        // FIXED: Corrected syntax typos here
        window.speechSynthesis.speak(speech);
    };

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = false;
        // Turn this ON so you see text updating on the screen while you speak
        recognition.interimResults = true;

        mic.onclick = () => {
            if (isListening) {
                // If clicked while listening, act as a stop toggle
                recognition.stop();
                return;
            }

            wave.style.opacity = "1";
            status.innerText = "Listening...";
            userText.innerText = "";
            aiText.innerText = "";

            recognition.start();
            isListening = true;
        };

        recognition.onresult = (e) => {
            // FIXED: Correct way to extract text from SpeechRecognition event arrays
            const resultIndex = e.resultNo || 0;
            const text = e.results[e.results.length - 1][0].transcript;

            // Show the text on the UI immediately while speaking
            userText.innerText = "You: " + text;

            // Only send to backend if the browser is completely finished processing the sentence
            if (e.results[e.results.length - 1].isFinal) {
                isListening = false; // Free up the mic flag immediately
                recognition.stop();

                setTimeout(async () => {
                    try {
                        status.innerText = 'Thinking...';
                        const res = await fetch(`${SERVER_URL}/api/assistant/ask`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                message: text,
                                userId
                            })
                        });

                        const data = await res.json();
                        console.log(data);

                        if (data.success) {
                            if (data.action === "navigate") {
                                speak(data.response);
                                setTimeout(() => {
                                    window.location.href = data.path;
                                }, 1500);
                            } else {
                                speak(data.aiResponse);
                            }
                        } else {
                            speak("Response Error please Check your plan");
                        }
                    } catch (error) {
                        console.log('Server error', error.message);
                        status.innerText = "Tap mic to Speak";
                        wave.style.opacity = "0";
                    }
                }, 600);
            }
        };

        recognition.onend = () => {
            isListening = false;
            if (status.innerText === "Listening...") {
                status.innerText = "Tap mic to Speak";
                wave.style.opacity = "0";
            }
        };

        recognition.onerror = (event) => {
            isListening = false;
            console.error("Speech Recognition Error: ", event.error);
            status.innerText = "Tap button to Speak";
            wave.style.opacity = "0";
        };

    } else {
        status.innerText = 'Speech recognition not supported';
    }

})();
