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
    startCameraBtn.addEventListener('click', async () => {
        if (!isCameraRunning) {
            try {
                // In a real app, this would request camera access. 
                // For this prototype, we'll try to get the real stream but handle errors gracefully for the demo.
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    webcamVideo.srcObject = stream;
                    webcamVideo.classList.remove('hidden');
                    webcamPlaceholder.style.display = 'none';
                    startCameraBtn.textContent = 'Stop Camera';
                    startCameraBtn.classList.add('active'); // Could style this state if needed
                    isCameraRunning = true;

                    // Simulate detection
                    simulateDetection();
                } else {
                    alert("Camera API not supported in this environment.");
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                alert("Could not access camera. Please allow permissions.");
            }
        } else {
            // Stop Camera
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                stream = null;
            }
            webcamVideo.srcObject = null;
            webcamVideo.classList.add('hidden');
            webcamPlaceholder.style.display = 'block';
            startCameraBtn.textContent = 'Start Camera';
            isCameraRunning = false;
        }
    });

    // Speak Output Handler
    speakOutputBtn.addEventListener('click', () => {
        // Get the text, trimming whitespace
        const textToSpeak = detectedText.value.trim();

        // check if text is empty or is the placeholder text
        if (textToSpeak && textToSpeak !== "Waiting for interaction...") {

            // Check if browser supports speech synthesis
            if ('speechSynthesis' in window) {
                const speech = new SpeechSynthesisUtterance(textToSpeak);
                window.speechSynthesis.speak(speech);
            } else {
                alert("Text-to-speech is not supported in this browser.");
            }

        } else {
            alert("No word detected");
        }
    });

    // Prototype Gesture Detection (Tap on Video)
    webcamVideo.addEventListener('click', () => {
        if (isCameraRunning) {
            detectedText.value = "HELLO";

            // Optional: provide visual feedback or small delay to feel more "real"
            // For now, instant update per requirements.
        }
    });

    // Show ISL Gesture Handler
    showGestureBtn.addEventListener('click', () => {
        const text = textInput.value.trim();
        if (text) {
            alert(`Simulating ISL gesture for: "${text}"`);
            // In a real app, this would load a video into the generic video player
        } else {
            alert("Please enter text to translate.");
        }
    });

    // Simulate Detection Function (Mock)
    function simulateDetection() {
        if (!isCameraRunning) return;

        // Mocking some detections appearing over time
        const mockWords = ["Hello", "Welcome", "Thank you", "SignBridge"];
        let i = 0;

        const interval = setInterval(() => {
            if (!isCameraRunning) {
                clearInterval(interval);
                return;
            }
            // Just for demo purposes, update the text area periodically
            /* 
            if (i < mockWords.length) {
                detectedText.value = mockWords[i];
                i++;
            } else {
                i = 0;
            }
            */
            // Keeping it static for now as per "Waiting for interaction" or simple feedback is better than confusing random words
            // detectedText.value = "Detecting..."; 
        }, 3000);
    }
});
