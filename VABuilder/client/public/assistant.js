(function () {
    let isListening = false;
    let inactivityTimer = null;
    let manualStop = false;
    const INACTIVITY_TIMEOUT = 20000;
    const CLIENT_URL = "http://localhost:5173";
    const SERVER_URL = "http://localhost:8000";
    const theme = 'neon';

    const script = document.currentScript;
    const userId = script?.dataset?.userId;
    let assistantConfig = null;

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
            <div class="va-user-text"></div>
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

    let open = false;
    button.onclick = () => {
        open = !open;
        popup.style.display = open ? "flex" : "none";
    };

    // load assistant config
    const loadAssistant = async () => {
        try {
            const res = await fetch(`${SERVER_URL}/api/assistant/config/${userId}`);
            const data = await res.json();
            if (data) {
                assistantConfig = data.user;
                applyConfig();
            }
        } catch (error) {
            console.log('frontend error config:', error.message);
        }
    };

    const applyConfig = () => {
        if (!assistantConfig) return;
        popup.className = `va-popup theme-${assistantConfig.theme}`;
        button.className = `va-btn theme-${assistantConfig.theme}`;
        popup.querySelector('.va-title').innerHTML = `Hello! I'm ${assistantConfig.assistantName}`;
        popup.querySelector('.va-sub').innerHTML = `
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

    // ── Speech synthesis ────────────────────────────────────────────────────
    const speak = (text, onDone) => {
        window.speechSynthesis.cancel();
        aiText.innerText = text;
        status.innerText = "AI Speaking...";

        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = "hi-IN";
        speech.rate = 1;
        speech.pitch = 1;
        speech.volume = 1;

        speech.onend = () => {
            if (onDone) onDone();
        };

        window.speechSynthesis.speak(speech);
    };

    // ── SpeechRecognition setup ──────────────────────────────────────────────
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        status.innerText = 'Speech recognition not supported';
        return; // exit IIFE early — nothing left to do
    }

    // Declare recognition HERE so every helper below can access it
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    // ── Helpers that need recognition in scope ───────────────────────────────
    const safeStart = () => {
        try {
            recognition.start();
        } catch (err) {
            // Ignore "already started" errors that browsers sometimes throw
            console.warn("recognition.start() error (ignored):", err.message);
        }
    };

    const resetInactivityTimer = () => {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            if (isListening) {
                manualStop = true;
                isListening = false;
                recognition.stop();
                status.innerText = "Tap mic to Speak";
                wave.style.opacity = "0";
                userText.innerText = "";
                aiText.innerText = "";
            }
        }, INACTIVITY_TIMEOUT);
    };

    // Called when user clicks mic while listening
    const stopVoiceAssistant = () => {
        clearTimeout(inactivityTimer);
        manualStop = true;
        isListening = false;
        recognition.stop();
        status.innerText = "Tap mic to Speak";
        wave.style.opacity = "0";
        userText.innerText = "";
        aiText.innerText = "";
    };

    // Resume listening after AI finishes speaking
    const resumeListening = () => {
        if (manualStop) return;    
        isListening = true;
        status.innerText = "Listening...";
        wave.style.opacity = "1";
        safeStart();
        resetInactivityTimer();
    };

    // ── Mic button ───────────────────────────────────────────────────────────
    mic.onclick = () => {
        if (isListening) {
            stopVoiceAssistant();
            return;
        }

        manualStop = false;
        isListening = true;
        wave.style.opacity = "1";
        status.innerText = "Listening...";
        userText.innerText = "";
        aiText.innerText = "";

        safeStart();
        resetInactivityTimer();
    };

    // ── Recognition events ───────────────────────────────────────────────────
    recognition.onresult = (e) => {
        resetInactivityTimer();

        const result = e.results[e.results.length - 1];
        const text = result[0].transcript;

        userText.innerText = "You: " + text;

        if (result.isFinal) {
            // Pause listening while we fetch AI response
            isListening = false;
            clearTimeout(inactivityTimer);
            recognition.stop();

            setTimeout(async () => {
                try {
                    status.innerText = "Thinking...";
                    const res = await fetch(`${SERVER_URL}/api/assistant/ask`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ message: text, userId })
                    });

                    const data = await res.json();

                    if (data.success) {
                        if (data.action === "navigate") {
                            speak(data.response, () => {
                                window.location.href = data.path;
                            });
                        } else {
                            // After AI speaks, automatically resume listening
                            speak(data.aiResponse, () => {
                                status.innerText = "Tap mic to Speak";
                                wave.style.opacity = "0";
                                resumeListening();   // ← keep session alive ✓
                            });
                        }
                    } else {
                        speak("Response Error, please check your plan.", () => {
                            status.innerText = "Tap mic to Speak";
                            wave.style.opacity = "0";
                        });
                    }
                } catch (error) {
                    console.log('Server error:', error.message);
                    status.innerText = "Tap mic to Speak";
                    wave.style.opacity = "0";
                }
            }, 600);
        }
    };

    recognition.onend = () => {
        // Don't restart if manually stopped or session not active
        if (manualStop || !isListening) {
            status.innerText = "Tap mic to Speak";
            wave.style.opacity = "0";
            return;
        }

        // Browser ended on its own mid-session — restart seamlessly
        status.innerText = "Listening...";
        wave.style.opacity = "1";
        resetInactivityTimer();
        safeStart();
    };

    recognition.onerror = (event) => {
        clearTimeout(inactivityTimer);
        isListening = false;
        manualStop = false;
        console.error("Speech Recognition Error:", event.error);
        status.innerText = "Tap button to Speak";
        wave.style.opacity = "0";
    };

})();