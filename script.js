// DOM Elements
const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const micBtn = document.getElementById('mic-btn');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const musicPlayer = document.getElementById('music-player');
const apiModeToggle = document.getElementById('api-mode-toggle');
const apiKeyContainer = document.getElementById('api-key-container');
const apiKeyInput = document.getElementById('api-key');

// State
let isListening = false;
let recognition;
let useRealAI = false;

// Initialize Speech Recognition
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        isListening = true;
        micBtn.classList.add('listening');
        statusDot.classList.add('listening');
        statusText.innerText = "Listening...";
    };

    recognition.onend = () => {
        isListening = false;
        micBtn.classList.remove('listening');
        statusDot.classList.remove('listening');
        statusText.innerText = "Ready";
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        handleInput(transcript);
    };
} else {
    alert("Your browser does not support Voice Recognition. Please use Chrome or Edge.");
    micBtn.style.display = 'none';
}

// Event Listeners
micBtn.addEventListener('click', () => {
    if (isListening) recognition.stop();
    else recognition.start();
});

sendBtn.addEventListener('click', () => {
    const text = userInput.value.trim();
    if (text) handleInput(text);
});

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const text = userInput.value.trim();
        if (text) handleInput(text);
    }
});

apiModeToggle.addEventListener('change', (e) => {
    useRealAI = e.target.checked;
    apiKeyContainer.classList.toggle('hidden', !useRealAI);
});

// Core Logic
function handleInput(text) {
    addMessage(text, 'user');
    userInput.value = '';
    
    statusText.innerText = "Thinking...";
    
    if (useRealAI && apiKeyInput.value) {
        callOpenAI(text);
    } else {
        // Mock AI / Command Engine
        setTimeout(() => processCommand(text.toLowerCase()), 600);
    }
}

function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    div.innerHTML = `<div class="bubble">${text}</div>`;
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function speak(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    }
}

function processCommand(cmd) {
    let response = "";
    let actionTaken = false;

    // 1. Music Controls
    if (cmd.includes('play music') || cmd.includes('start music')) {
        musicPlayer.play();
        response = "Playing some relaxing music for you.";
        actionTaken = true;
    } 
    else if (cmd.includes('stop music') || cmd.includes('pause music')) {
        musicPlayer.pause();
        response = "Music paused.";
        actionTaken = true;
    }

    // 2. Story Telling
    else if (cmd.includes('tell a story') || cmd.includes('tell me a story')) {
        response = "Once upon a time, in a digital world, there was a web assistant hosted on GitHub Pages. It could speak, play music, and help users build amazing things. The end!";
        actionTaken = true;
    }

    // 3. Open Apps (Web Simulations)
    else if (cmd.includes('open calculator')) {
        window.open('https://www.calculator.net/', '_blank');
        response = "Opening the calculator app.";
        actionTaken = true;
    }
    else if (cmd.includes('open youtube')) {
        window.open('https://www.youtube.com', '_blank');
        response = "Opening YouTube.";
        actionTaken = true;
    }
    else if (cmd.includes('open google')) {
        window.open('https://www.google.com', '_blank');
        response = "Opening Google.";
        actionTaken = true;
    }

    // 4. Utility Tasks
    else if (cmd.includes('time')) {
        response = `The current time is ${new Date().toLocaleTimeString()}.`;
        actionTaken = true;
    }
    else if (cmd.includes('date')) {
        response = `Today is ${new Date().toLocaleDateString()}.`;
        actionTaken = true;
    }
    else if (cmd.includes('change theme') || cmd.includes('dark mode')) {
        document.body.style.backgroundColor = document.body.style.backgroundColor === 'rgb(255, 255, 255)' ? '#121212' : '#ffffff';
        response = "Theme toggled.";
        actionTaken = true;
    }

    // Fallback
    if (!actionTaken) {
        response = "I heard you say '" + cmd + "'. I can play music, tell stories, open apps like Calculator, or tell you the time. Try one of those!";
    }

    addMessage(response, 'bot');
    speak(response);
    statusText.innerText = "Ready";
}

// Real AI Integration (OpenAI)
async function callOpenAI(prompt) {
    const apiKey = apiKeyInput.value;
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {role: "system", content: "You are a helpful web assistant. Keep responses short. If the user asks to play music, respond with 'ACTION:PLAY_MUSIC'. If story, 'ACTION:STORY'. If calculator, 'ACTION:OPEN_CALC'. Otherwise just chat."},
                    {role: "user", content: prompt}
                ]
            })
        });

        const data = await response.json();
        const reply = data.choices[0].message.content;
        
        // Handle Function Calling Simulation
        if (reply.includes('ACTION:')) {
            if (reply.includes('PLAY_MUSIC')) processCommand('play music');
            else if (reply.includes('STORY')) processCommand('tell a story');
            else if (reply.includes('OPEN_CALC')) processCommand('open calculator');
            else {
                addMessage(reply, 'bot');
                speak(reply);
            }
        } else {
            addMessage(reply, 'bot');
            speak(reply);
        }
    } catch (error) {
        addMessage("Error connecting to AI. Check your API key.", 'bot');
        console.error(error);
    }
    statusText.innerText = "Ready";
}

// Settings Modal
function toggleSettings() {
    document.getElementById('settings-modal').classList.toggle('hidden');
}
