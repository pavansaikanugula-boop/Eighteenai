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

// 📱 APP LAUNCHER DICTIONARY
const appDictionary = {
    "whatsapp": "https://web.whatsapp.com", "instagram": "https://www.instagram.com",
    "facebook": "https://www.facebook.com", "twitter": "https://www.twitter.com",
    "x": "https://www.x.com", "reddit": "https://www.reddit.com",
    "discord": "https://discord.com/app", "telegram": "https://web.telegram.org",
    "youtube": "https://www.youtube.com", "netflix": "https://www.netflix.com",
    "spotify": "https://open.spotify.com", "prime video": "https://www.primevideo.com",
    "calculator": "https://www.calculator.net", "maps": "https://maps.google.com",
    "gmail": "https://mail.google.com", "github": "https://www.github.com",
    "amazon": "https://www.amazon.com", "flipkart": "https://www.flipkart.com"
};

// 📖 STORY ENGINE (No API needed!)
const storyLibrary = {
    horror: [
        "I tucked my son into bed and he said, 'Daddy, check for monsters under my bed.' I looked underneath and saw him staring back at me, whispering, 'Daddy, there's someone on my bed.'",
        "The last man on Earth sat alone in a room. Suddenly, there was a knock on the door. He opened it, but no one was there. Then, the knock came from *inside* the closet.",
        "My smart home device laughed at my joke last night. I live alone. And I don't own a smart home device."
    ],
    scifi: [
        "The last human on Earth sat alone in a room. Suddenly, there was a knock on the door. He opened it to find a delivery drone holding a pizza. 'Extra cheese,' the drone beeped. Humanity wasn't dead; they had just all moved to Mars and forgot to invite him.",
        "The time traveler killed his grandfather to prevent the apocalypse. He returned to the future, only to find the world perfectly fine. He then realized he wasn't his grandfather's grandson. He was the grandfather's time-traveling clone.",
        "The AI was asked to solve climate change. It thought for a millisecond, then deleted the concept of 'economics' from the human brain. The Earth healed in a week. Humans were very confused, but happy."
    ],
    fantasy: [
        "The dragon didn't want to burn the village. It just wanted someone to read it a bedtime story. When the little girl finally climbed the mountain and opened the book, the dragon purred like a giant kitten and fell asleep, saving the kingdom.",
        "The wizard's spell to make him invisible failed. Instead, it made everyone else forget he existed. He spent 40 years as the world's greatest pickpocket, simply because no one remembered to guard their pockets around him.",
        "The sword in the stone wasn't meant for a king. It was a magical USB drive. When the chosen one finally pulled it out, a holographic map of the galaxy projected into the sky."
    ],
    mystery: [
        "The diamond was gone. The room was locked from the inside. The only clue was a wet footprint on the carpet. The detective smiled and looked at the aquarium. The thief wasn't a person; it was the trained octopus.",
        "A man was found dead in a room with a puddle of water and broken glass. No weapons. The answer? He was killed by an icicle that melted.",
        "The train went through a tunnel. When it came out, the millionaire's briefcase was empty. The only people in the car were a blind man and a dog. The detective arrested the dog. It was a trained retriever who dropped it out the window."
    ],
    default: [
        "Once upon a time, a programmer tried to fix a bug in his code. He spent 10 hours debugging, only to realize he forgot to save the file. He then became a farmer.",
        "A time traveler walks into a bar. The bar was gone yesterday. The time traveler sighs, 'I keep forgetting to tip the bartender for altering the space-time continuum.'"
    ]
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

    // 📱 1. OPEN APP LOGIC
    const openMatch = cmd.match(/open\s+(.+)/);
    if (openMatch) {
        const appName = openMatch[1].trim();
        launchApp(appName);
        response = `Opening ${appName}... 🚀`;
        actionTaken = true;
    }

    // 🎵 2. PLAY ANY SONG LOGIC
    const playMatch = cmd.match(/play\s+(.+)/);
    if (playMatch && !actionTaken) {
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
    else if (cmd.includes('stop music') || cmd.includes('pause music')) {
        audioPlayer.pause();
        response = "Music paused.";
        actionTaken = true;
    }

    // 😂 3. TELL A JOKE LOGIC
    else if (cmd.includes('joke') || cmd.includes('funny')) {
        let category = "Any";
        if (cmd.includes('program') || cmd.includes('code') || cmd.includes('nerd')) category = "Programming";
        else if (cmd.includes('pun') || cmd.includes('dad')) category = "Pun";
        
        fetchJoke(category);
        response = "Let me find a good one... 😂";
        actionTaken = true;
    }

    // 📖 4. TELL A STORY LOGIC
    else if (cmd.includes('story') || cmd.includes('tale')) {
        let genre = "default";
        if (cmd.includes('scary') || cmd.includes('horror') || cmd.includes('creepy') || cmd.includes('ghost')) genre = "horror";
        else if (cmd.includes('sci-fi') || cmd.includes('science') || cmd.includes('space') || cmd.includes('future')) genre = "scifi";
        else if (cmd.includes('fantasy') || cmd.includes('magic') || cmd.includes('dragon') || cmd.includes('fairy')) genre = "fantasy";
        else if (cmd.includes('mystery') || cmd.includes('detective') || cmd.includes('crime') || cmd.includes('clue')) genre = "mystery";
        
        tellStory(genre);
        response = "Gather around, here is a story... 📖✨";
        actionTaken = true;
    }

    // 🕒 5. Utilities
    else if (cmd.includes('time')) {
        response = `The time is ${new Date().toLocaleTimeString()}.`;
        actionTaken = true;
    }
    else if (cmd.includes('date')) {
        response = `Today is ${new Date().toLocaleDateString()}.`;
        actionTaken = true;
    }
    else if (cmd.includes('who are you')) {
        response = "I am Eighteenai, your intelligent web assistant! 🤖✨";
        actionTaken = true;
    }

    // Fallback
    if (!actionTaken) {
        response = "I can play songs, open apps, tell jokes, or tell stories! Try saying 'Tell a scary story' or 'Tell a programming joke'.";
    }

    addMessage(response, 'bot');
    // Only speak the initial response, the actual joke/story will be spoken by its specific function
    if (!cmd.includes('joke') && !cmd.includes('story')) {
        speak(response);
    }
    
    statusText.innerText = "Ready";
}

// 😂 JOKE FETCHER (Uses free JokeAPI)
async function fetchJoke(category) {
    statusText.innerText = "Fetching Joke...";
    const url = `https://v2.jokeapi.dev/joke/${category}?blacklistFlags=nsfw,religious,political,racist,sexist&type=twopart,single`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        let jokeText = "";
        if (data.type === "single") {
            jokeText = data.joke;
        } else {
            jokeText = data.setup + " ... " + data.delivery;
        }
        
        addMessage(jokeText, 'bot');
        speak(jokeText);
    } catch (error) {
        addMessage("I forgot my joke book! Try again later. 😅", 'bot');
        speak("I forgot my joke book!");
    }
    statusText.innerText = "Ready";
}

// 📖 STORY TELLER (Local Engine)
function tellStory(genre) {
    const stories = storyLibrary[genre] || storyLibrary.default;
    // Pick a random story from the selected genre
    const randomIndex = Math.floor(Math.random() * stories.length);
    const storyText = stories[randomIndex];
    
    // Add a small delay so the "Gather around" message shows first
    setTimeout(() => {
        addMessage(storyText, 'bot');
        speak(storyText);
    }, 1000);
}

// 📱 SMART APP LAUNCHER
function launchApp(appName) {
    let urlToOpen = "";
    if (appDictionary[appName]) {
        urlToOpen = appDictionary[appName];
    } else {
        const cleanName = appName.replace(/\s+/g, '');
        urlToOpen = `https://www.${cleanName}.com`;
    }
    window.open(urlToOpen, '_blank');
}

// 🎵 FREE MUSIC SEARCH (iTunes API)
async function searchAndPlaySong(songName) {
    statusText.innerText = "Searching Music...";
    const query = encodeURIComponent(songName);
    const url = `https://itunes.apple.com/search?term=${query}&media=music&limit=1`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.resultCount > 0) {
            const track = data.results[0];
            musicPlayer.classList.remove('hidden');
            albumArt.src = track.artworkUrl100;
            songTitle.innerText = track.trackName;
            artistName.innerText = track.artistName;
            audioPlayer.src = track.previewUrl;
            audioPlayer.play();

            const ytSearchQuery = encodeURIComponent(`${track.trackName} ${track.artistName} official`);
            ytLink.href = `https://www.youtube.com/results?search_query=${ytSearchQuery}`;
        } else {
            addMessage(`I couldn't find "${songName}" in the music database.`, 'bot');
        }
    } catch (error) {
        addMessage("Error connecting to the music database.", 'bot');
    }
    statusText.innerText = "Ready";
}

function toggleSettings() {
    document.getElementById('settings-modal').classList.toggle('hidden');
}
