// DOM Elements
const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const micBtn = document.getElementById('mic-btn');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const playerContainer = document.getElementById('player-container');
const songTitle = document.getElementById('song-title');
const youtubePlayer = document.getElementById('youtube-player');
const apiModeToggle = document.getElementById('api-mode-toggle');
const apiKeyContainer = document.getElementById('api-key-container');
const apiKeyInput = document.getElementById('api-key');

// State
let isListening = false;
let recognition;
let useRealAI = false;

// 🎵 SONG LIBRARY
// Add your songs here. You can get the Video ID from YouTube URL.
// Example: https://www.youtube.com/watch?v=dQw4w9WgXcQ -> ID is dQw4w9WgXcQ
const songLibrary = {
    "paro": { id: "CevxZvSJLk8", name: "Paro" }, // Example ID, replace with actual Paro song ID
    "sahiba": { id: "hTWKbfoikeg", name: "Sahiba" }, // Example ID, replace with actual Sahiba song ID
    "kesariya": { id: "B7eMpZ5G0U0", name: "Kesariya" },
    "apna bana le": { id: "sD1S6L5m5q0", name: "Apna Bana Le" }
};

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
        statusText.innerText = "Eighteenai Listening...";
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
    micBtn.style.display = 'none';
    addMessage("Voice not supported in this browser. Use Chrome/Edge.", 'bot');
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
        setTimeout(() => processCommand(text.toLowerCase()), 500);
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
    window.speechSynthesis.cancel(); // Stop previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
}

// 🛑 Stop Music Function
function stopMusic() {
    youtubePlayer.innerHTML = ''; // Remove iframe to stop audio
    playerContainer.classList.add('hidden');
    songTitle.innerText = "None";
    speak("Music stopped.");
}

function processCommand(cmd) {
    let response = "";
    let actionTaken = false;

    // 🎵 1. Check for Songs
    if (cmd.includes('play')) {
        for (const key in songLibrary) {
            if (cmd.includes(key)) {
                const song = songLibrary[key];
                playSong(song.id, song.name);
                response = `Playing ${song.name} 🎵...`;
                actionTaken = true;
                break;
            }
        }
        if (!actionTaken && cmd.includes('play music')) {
            // Fallback generic music
            playSong("CevxZvSJLk8", "Relaxing Beats"); 
            response = "Playing some relaxing music 🎵...";
            actionTaken = true;
        }
    }
    
    // 🛑 Stop Music
    else if (cmd.includes('stop music') || cmd.includes('pause music') || cmd.includes('band kar')) {
        stopMusic();
        response = "Music stopped.";
        actionTaken = true;
    }

    // 📖 2. Story
    else if (cmd.includes('tell a story') || cmd.includes('kahani sunao')) {
        response = "Once upon a time, Eighteenai was created to help humans. It could sing songs, tell stories, and bring joy to the web. And they lived happily ever after! ✨";
        actionTaken = true;
    }

    // 🧮 3. Apps
    else if (cmd.includes('open calculator')) {
        window.open('https://www.calculator.net/', '_blank');
        response = "Opening Calculator 🧮.";
        actionTaken = true;
    }
    else if (cmd.includes('open youtube')) {
        window.open('https://www.youtube.com', '_blank');
        response = "Opening YouTube 📺.";
        actionTaken = true;
    }

    // 🕒 4. Utilities
    else if (cmd.includes('time')) {
        response = `The time is ${new Date().toLocaleTimeString()}.`;
        actionTaken = true;
    }
    else if (cmd.includes('who are you')) {
        response = "I am Eighteenai, your intelligent web assistant created to help you! 🤖✨";
        actionTaken = true;
    }

    // Fallback
    if (!actionTaken) {
        response = "I'm not sure how to do that. Try asking me to 'Play Paro', 'Tell a story', or 'Open calculator'.";
    }

    addMessage(response, 'bot');
    speak(response);
    statusText.innerText = "Ready";
}

// 🎵 Play Song Function
function playSong(videoId, name) {
    playerContainer.classList.remove('hidden');
    songTitle.innerText = name;
    
    // Create YouTube Iframe (Autoplay enabled)
    youtubePlayer.innerHTML = `
        <iframe 
            width="100%" 
            height="200" 
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}" 
            frameborder="0" 
            allow="autoplay; encrypted-media" 
            allowfullscreen>
        </iframe>
    `;
}

// Real AI Integration
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
                    {role: "system", content: "You are Eighteenai. Keep responses short. If user asks to play a song, respond 'ACTION:PLAY_SONG'. If story, 'ACTION:STORY'."},
                    {role: "user", content: prompt}
                ]
            })
        });
        const data = await response.json();
        const reply = data.choices[0].message.content;
        
        if (reply.includes('ACTION:PLAY_SONG')) processCommand('play music');
        else if (reply.includes('ACTION:STORY')) processCommand('tell a story');
        else {
            addMessage(reply, 'bot');
            speak(reply);
        }
    } catch (error) {
        addMessage("Error with AI. Check key.", 'bot');
    }
    statusText.innerText = "Ready";
}

function toggleSettings() {
    document.getElementById('settings-modal').classList.toggle('hidden');
}
