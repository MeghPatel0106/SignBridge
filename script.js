document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const startCameraBtn = document.getElementById('btn-start-camera');
    const speakOutputBtn = document.getElementById('btn-speak-output');
    const showGestureBtn = document.getElementById('btn-show-gesture');
    const webcamVideo = document.getElementById('webcam-video');
    const webcamPlaceholder = document.getElementById('webcam-placeholder').querySelector('.placeholder-content');
    const detectedText = document.getElementById('detected-text');
    const textInput = document.getElementById('text-input');

    // State
    let isCameraRunning = false;
    let stream = null;

    // Start Camera Handler
    startCameraBtn.addEventListener('click', () => {
        if (!isCameraRunning) {
            // Start Flask Stream
            webcamVideo.src = "/video_feed";
            webcamVideo.classList.remove('hidden');
            webcamPlaceholder.style.display = 'none';
            startCameraBtn.textContent = 'Stop Camera';
            startCameraBtn.classList.add('active');
            isCameraRunning = true;

            // Start Polling for predictions
            startPolling();
        } else {
            // Stop Camera (just hide logic, backend runs)
            webcamVideo.src = "";
            webcamVideo.classList.add('hidden');
            webcamPlaceholder.style.display = 'block';
            startCameraBtn.textContent = 'Start Camera';
            startCameraBtn.classList.remove('active');
            isCameraRunning = false;
            stopPolling();
        }
    });

    // Speak Output Handler
    speakOutputBtn.addEventListener('click', () => {
        const detectedInput = document.getElementById('detectedWord');
        const storedInput = document.getElementById('storedSentence');

        // Prefer speaking the sentence, otherwise the single word
        const textToSpeak = storedInput.value.trim() || detectedInput.value.trim();

        if (textToSpeak && textToSpeak !== "Waiting for interaction..." && textToSpeak !== "Sentence builds here...") {
            if ('speechSynthesis' in window) {
                const speech = new SpeechSynthesisUtterance(textToSpeak);
                window.speechSynthesis.speak(speech);
            } else {
                alert("Text-to-speech is not supported in this browser.");
            }
        } else {
            alert("No text to speak");
        }
    });

    // Clear and Backspace Handlers
    const clearBtn = document.getElementById('clearBtn');
    const backspaceBtn = document.getElementById('backspaceBtn');

    if (clearBtn) {
        clearBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/clear_sentence', { method: 'POST' });
                const data = await response.json();
                document.getElementById('storedSentence').value = data.sentence;
            } catch (err) {
                console.error("Error clearing sentence:", err);
            }
        });
    }

    if (backspaceBtn) {
        backspaceBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/backspace_sentence', { method: 'POST' });
                const data = await response.json();
                document.getElementById('storedSentence').value = data.sentence;
            } catch (err) {
                console.error("Error backspacing:", err);
            }
        });
    }

    // Prototype Gesture Detection (Tap on Video) - Optional/Removed as we have real detection
    webcamVideo.addEventListener('click', () => {
        // Optional: could manually trigger a fetch
    });

    // Show ISL Gesture Handler
    showGestureBtn.addEventListener('click', () => {
        const text = textInput.value.trim();
        if (text) {
            alert(`Simulating ISL gesture for: "${text}"`);
        } else {
            alert("Please enter text to translate.");
        }
    });

    // Prediction Polling
    let pollingInterval = null;

    function startPolling() {
        if (pollingInterval) clearInterval(pollingInterval);
        pollingInterval = setInterval(async () => {
            if (!isCameraRunning) return;
            try {
                const response = await fetch('/get_word');
                const data = await response.json();

                const detectedInput = document.getElementById('detectedWord');
                const storedInput = document.getElementById('storedSentence');

                if (data.word !== undefined) {
                    detectedInput.value = data.word;
                }
                if (data.sentence !== undefined) {
                    storedInput.value = data.sentence;
                }
            } catch (err) {
                console.error("Error fetching prediction:", err);
            }
        }, 500); // Poll every 500ms
    }

    function stopPolling() {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
        }
    }
});
