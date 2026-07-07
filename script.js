// DOM Elements
const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const micBtn = document.getElementById('mic-btn');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const musicPlayer = document.getElementById('music-player');
const audioPlayer = document.getElementById('audio-player');
const albumArt = document.getElementById('album-art');
const songTitle = document.getElementById('song-title');
const artistName = document.getElementById('artist-name');
const ytLink = document.getElementById('yt-link');

// State
let isListening = false;
let recognition;

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

// Core Logic
function handleInput(text) {
    addMessage(text, 'user');
    userInput.value = '';
    statusText.innerText = "Thinking...";
    setTimeout(() => processCommand(text.toLowerCase()), 400);
}

function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    div.innerHTML = `<div class="bubble">${text}</div>`;
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function speak(text) {
    window.speechSynthesis.cancel(); 
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
}

function closePlayer() {
    audioPlayer.pause();
    musicPlayer.classList.add('hidden');
}

function processCommand(cmd) {
    let response = "";
    let actionTaken = false;

    // 🎵 1. PLAY ANY SONG LOGIC
    const playMatch = cmd.match(/play\s+(.+)/);
    
    if (playMatch) {
        const songQuery = playMatch[1].trim();
        if (songQuery === 'music' || songQuery === 'a song') {
            searchAndPlaySong("top hits 2024");
            response = "Playing some trending music 🎵...";
        } else {
            searchAndPlaySong(songQuery);
            response = `Searching for "${songQuery}"... 🎧`;
        }
        actionTaken = true;
    }
    
    // 🛑 Stop Music
    else if (cmd.includes('stop music') || cmd.includes('pause music') || cmd.includes('stop playing')) {
        audioPlayer.pause();
        response = "Music paused.";
        actionTaken = true;
    }

    // 📖 2. Story
    else if (cmd.includes('tell a story') || cmd.includes('kahani sunao')) {
        response = "Once upon a time, Eighteenai was created to help humans. It could sing any song in the world, tell stories, and bring joy to the web. And they lived happily ever after! ✨";
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
        response = "I am Eighteenai, your intelligent web assistant! 🤖✨";
        actionTaken = true;
    }

    // Fallback
    if (!actionTaken) {
        response = "I can play any song! Just say 'Play [Song Name]'. I can also tell stories or open apps.";
    }

    addMessage(response, 'bot');
    speak(response);
    statusText.innerText = "Ready";
}

// 🎵 FREE MUSIC SEARCH FUNCTION (iTunes API - NO API KEY REQUIRED)
async function searchAndPlaySong(songName) {
    statusText.innerText = "Searching Music...";
    
    // We use the iTunes Search API. It's 100% free, no key needed, no CORS issues.
    const query = encodeURIComponent(songName);
    const url = `https://itunes.apple.com/search?term=${query}&media=music&limit=1`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.resultCount > 0) {
            const track = data.results[0];
            
            // Update UI
            musicPlayer.classList.remove('hidden');
            albumArt.src = track.artworkUrl100;
            songTitle.innerText = track.trackName;
            artistName.innerText = track.artistName;
            
            // Set Audio Source (30-second preview)
            audioPlayer.src = track.previewUrl;
            audioPlayer.play();

            // Set YouTube Link for full song
            const ytSearchQuery = encodeURIComponent(`${track.trackName} ${track.artistName} official`);
            ytLink.href = `https://www.youtube.com/results?search_query=${ytSearchQuery}`;
            
        } else {
            addMessage(`I couldn't find "${songName}" in the music database. Try a different name!`, 'bot');
        }
    } catch (error) {
        console.error("Music API Error:", error);
        addMessage("Error connecting to the music database. Check your internet.", 'bot');
    }
    statusText.innerText = "Ready";
}

function toggleSettings() {
    document.getElementById('settings-modal').classList.toggle('hidden');
}
