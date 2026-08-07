let songs = [];
let originalSongs = [];
let shuffleQueue = [];
let currentIndex = 0;
let isPlaying = false;
let shuffleMode = false;
let repeatMode = 0;
let playQueue = [];
let contextTargetIndex = null;
let longPressTimer = null;
let deleteTarget = null;
let swipeStartX = 0;
let recent = [];
let lastTime = 0;

const audio = document.getElementById("audio");
const fullPlayer = document.getElementById("fullPlayer");


const YIcon = {
  icons: {},

  register(name, svg) {
    this.icons[name] = svg;
  },

  get(name, size = 20) {
    return this.icons[name].replace(/__SIZE__/g, size);
  }
};
YIcon.register("prev", `
<svg viewBox="0 0 256 256" width="__SIZE__" height="__SIZE__" fill="currentColor">
<path d="M199.81,34a16,16,0,0,0-16.24.43L64,109.23V40a8,8,0,0,0-16,0V216a8,8,0,0,0,16,0V146.77l119.57,74.78A15.95,15.95,0,0,0,208,208.12V47.88A15.86,15.86,0,0,0,199.81,34ZM192,208,64.16,128,192,48.07Z"/>
</svg>
`);

YIcon.register("next", `
<svg viewBox="0 0 256 256" width="__SIZE__" height="__SIZE__" fill="currentColor">
<path d="M200,32a8,8,0,0,0-8,8v69.23L72.43,34.45A15.95,15.95,0,0,0,48,47.88V208.12a16,16,0,0,0,24.43,13.43L192,146.77V216a8,8,0,0,0,16,0V40A8,8,0,0,0,200,32ZM64,207.93V48.05l127.84,80Z"/>
</svg>
`);

YIcon.register("pause", `
<svg viewBox="0 0 256 256" width="__SIZE__" height="__SIZE__" fill="currentColor">
<path d="M200,32H160a16,16,0,0,0-16,16V208a16,16,0,0,0,16,16h40a16,16,0,0,0,16-16V48A16,16,0,0,0,200,32Zm0,176H160V48h40ZM96,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V48A16,16,0,0,0,96,32Zm0,176H56V48H96Z"/>
</svg>
`);

YIcon.register("play", `
<svg viewBox="0 0 256 256" width="__SIZE__" height="__SIZE__" fill="currentColor">
<path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z"/>
</svg>
`);

YIcon.register("shuffle", `
<svg viewBox="0 0 256 256" width="__SIZE__" height="__SIZE__" fill="currentColor">
<path d="M237.66,178.34a8,8,0,0,1,0,11.32l-24,24a8,8,0,0,1-11.32-11.32L212.69,192H200.94a72.12,72.12,0,0,1-58.59-30.15l-41.72-58.4A56.1,56.1,0,0,0,55.06,80H32a8,8,0,0,1,0-16H55.06a72.12,72.12,0,0,1,58.59,30.15l41.72,58.4A56.1,56.1,0,0,0,200.94,176h11.75l-10.35-10.34a8,8,0,0,1,11.32-11.32ZM143,107a8,8,0,0,0,11.16-1.86l1.2-1.67A56.1,56.1,0,0,1,200.94,80h11.75L202.34,90.34a8,8,0,0,0,11.32,11.32l24-24a8,8,0,0,0,0-11.32l-24-24a8,8,0,0,0-11.32,11.32L212.69,64H200.94a72.12,72.12,0,0,0-58.59,30.15l-1.2,1.67A8,8,0,0,0,143,107Zm-30,42a8,8,0,0,0-11.16,1.86l-1.2,1.67A56.1,56.1,0,0,1,55.06,176H32a8,8,0,0,0,0,16H55.06a72.12,72.12,0,0,0,58.59-30.15l1.2-1.67A8,8,0,0,0,113,149Z"/>
</svg>
`);

YIcon.register("repeat", `
<svg viewBox="0 0 256 256" width="__SIZE__" height="__SIZE__" fill="currentColor">
<path d="M24,128A72.08,72.08,0,0,1,96,56H204.69L194.34,45.66a8,8,0,0,1,11.32-11.32l24,24a8,8,0,0,1,0,11.32l-24,24a8,8,0,0,1-11.32-11.32L204.69,72H96a56.06,56.06,0,0,0-56,56,8,8,0,0,1-16,0Zm200-8a8,8,0,0,0-8,8,56.06,56.06,0,0,1-56,56H51.31l10.35-10.34a8,8,0,0,0-11.32-11.32l-24,24a8,8,0,0,0,0,11.32l24,24a8,8,0,0,0,11.32-11.32L51.31,200H160a72.08,72.08,0,0,0,72-72A8,8,0,0,0,224,120Z"/>
</svg>
`);

YIcon.register("repeat-one", `
<svg viewBox="0 0 256 256" width="__SIZE__" height="__SIZE__" fill="currentColor">
<path d="M24,128A72.08,72.08,0,0,1,96,56H204.69L194.34,45.66a8,8,0,0,1,11.32-11.32l24,24a8,8,0,0,1,0,11.32l-24,24a8,8,0,0,1-11.32-11.32L204.69,72H96a56.06,56.06,0,0,0-56,56,8,8,0,0,1-16,0Zm200-8a8,8,0,0,0-8,8,56.06,56.06,0,0,1-56,56H51.31l10.35-10.34a8,8,0,0,0-11.32-11.32l-24,24a8,8,0,0,0,0,11.32l24,24a8,8,0,0,0,11.32-11.32L51.31,200H160a72.08,72.08,0,0,0,72-72A8,8,0,0,0,224,120Zm-88,40a8,8,0,0,0,8-8V104a8,8,0,0,0-11.58-7.16l-16,8a8,8,0,1,0,7.16,14.31l4.42-2.21V152A8,8,0,0,0,136,160Z"/>
</svg>
`);

YIcon.register("volume", `
<svg viewBox="0 0 256 256" width="__SIZE__" height="__SIZE__" fill="currentColor">
<path d="M155.51,24.81a8,8,0,0,0-8.42.88L77.25,80H32A16,16,0,0,0,16,96v64a16,16,0,0,0,16,16H77.25l69.84,54.31A8,8,0,0,0,160,224V32A8,8,0,0,0,155.51,24.81ZM32,96H72v64H32ZM144,207.64,88,164.09V91.91l56-43.55Zm54-106.08a40,40,0,0,1,0,52.88,8,8,0,0,1-12-10.58,24,24,0,0,0,0-31.72,8,8,0,0,1,12-10.58ZM248,128a79.9,79.9,0,0,1-20.37,53.34,8,8,0,0,1-11.92-10.67,64,64,0,0,0,0-85.33,8,8,0,1,1,11.92-10.67A79.83,79.83,0,0,1,248,128Z"/>
</svg>
`);
function formatTime(secs) {
    if (isNaN(secs)) return "0:00";
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
}
function rebuildFuse() {
    fuse = new Fuse(songs, {
        keys: ["title", "artist", "album", "file"],
        threshold: 0.35,
        ignoreLocation: true,
        includeScore: true
    });
}
// 1. DATA LOAD
fetch("/songs")
.then(res => res.json())
.then(data => {
    songs = typeof data[0] === "object" ? data : data.map(f => ({ file: f, title: f, artist: "Unknown Artist" }));
    originalSongs = [...songs];
    renderSongs(songs);
    loadState();
    renderHome();
    rebuildFuse()
});


// 3. PLAYBACK LOGIC
function playSongByIndex(index) {
    currentIndex = index;
    const song = songs[currentIndex];
    audio.src = `/play/${song.file}`;
    audio.play();
    isPlaying = true;
    
    recent = [song, ...recent.filter(s => s.file !== song.file)].slice(0, 5);
    
    updateUI(song);
    saveState();
    renderHome();
}

function togglePlay() {
    if (!audio.src) return;
    if (isPlaying) audio.pause(); else audio.play();
    isPlaying = !isPlaying;
    const icon = isPlaying ? "pause" : "play";
    document.getElementById("miniPlayBtn").innerHTML = YIcon.get(icon);
    document.getElementById("fpPlayBtn").innerHTML = YIcon.get(icon);
}

function nextSong() {
    let nextIdx;
    if (shuffleMode && shuffleQueue.length) {
        let qIdx = shuffleQueue.indexOf(currentIndex);
        nextIdx = shuffleQueue[(qIdx + 1) % shuffleQueue.length];
    } else {
        nextIdx = (currentIndex + 1) % songs.length;
    }
    playSongByIndex(nextIdx);
}

function prevSong() {
    let prevIdx = (currentIndex - 1 + songs.length) % songs.length;
    playSongByIndex(prevIdx);
}

function toggleShuffle() {
    shuffleMode = !shuffleMode;
    if (shuffleMode) {
        shuffleQueue = Array.from(Array(songs.length).keys()).sort(() => Math.random() - 0.5);
    }
    const color = shuffleMode ? "#1db954" : "white";
    document.getElementById("headerShuffle").style.color = color;
    document.getElementById("fpShuffleBtn").classList.toggle('active', shuffleMode);
}

function toggleRepeat() {
    repeatMode = (repeatMode + 1) % 3;

    const btn = document.getElementById("fpRepeatBtn");

    let icon;

    if (repeatMode === 0) {
        icon = "repeat";        // 🔁 off
        btn.classList.remove("active");
    } else if (repeatMode === 1) {
        icon = "repeat";        // 🔁 on
        btn.classList.add("active");
    } else {
        icon = "repeat-one";    // 🔂
        btn.classList.add("active");
    }

    btn.innerHTML = YIcon.get(icon);
}

// 4. UI UPDATES
// 4. UI UPDATES
function updateUI(song) {
    const url = `/cover/${song.file}`;
    
    // Update Mini Player
    document.getElementById("now").textContent = song.title;
    document.getElementById("miniArtist").textContent = song.artist;
    document.getElementById("miniCover").src = url;
    document.getElementById("miniPlayBtn").innerHTML = YIcon.get("pause");
    
    // Update Full Player Artwork & Details
    document.getElementById("fpTitle").textContent = song.title;
    document.getElementById("fpArtist").textContent = song.artist;
        const coverImg = document.getElementById("cover");
    coverImg.src = url;
    // Extract color once the image physically loads
    coverImg.onload = () => extractDominantColor(coverImg);

    document.getElementById("fpPlayBtn").innerHTML = YIcon.get("pause");

        // 🔥 AMBIENT GLOW & LUXURY BACKGROUND CROSSFADE LOGIC
    const bg1 = document.getElementById("bg");
    const bg2 = document.getElementById("bg2");

    // Important: Wrap the URL in quotes to handle spaces/special characters in filenames
    const safeUrl = `url("${url}")`;

    // 1. Set the hidden layer (bg2) to the new artwork and fade it in
    bg2.style.backgroundImage = safeUrl;
    bg2.style.opacity = "0.35";

    // 2. Wait for the fade-in transition to complete (600ms)
    setTimeout(() => {
        // 3. Set the base layer (bg1) to the new artwork
        bg1.style.backgroundImage = safeUrl;
        // 4. Hide the top layer (bg2) instantly so it's ready for the next song
        bg2.style.opacity = "0";
    }, 600);
 // Transitions smoothly over 600ms matching your style definition

    // Media Session API (OS Integration)
    if ('mediaSession' in navigator) {
        // 1. Update the Metadata (what you see on the lockscreen)
        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.title,
            artist: song.artist,
            artwork: [
                { src: url, sizes: '96x96',   type: 'image/png' },
                { src: url, sizes: '128x128', type: 'image/png' },
                { src: url, sizes: '192x192', type: 'image/png' },
                { src: url, sizes: '256x256', type: 'image/png' },
                { src: url, sizes: '384x384', type: 'image/png' },
                { src: url, sizes: '512x512', type: 'image/png' },
            ]
        });

        // 2. Link OS Buttons to your JavaScript functions
        navigator.mediaSession.setActionHandler('play', () => togglePlay());
        navigator.mediaSession.setActionHandler('pause', () => togglePlay());
        navigator.mediaSession.setActionHandler('previoustrack', () => prevSong());
        navigator.mediaSession.setActionHandler('nexttrack', () => nextSong());

        // 3. Optional: Allow seeking from the OS notification seekbar
        try {
            navigator.mediaSession.setActionHandler('seekto', (details) => {
                if (details.seekTime && audio.duration) {
                    audio.currentTime = details.seekTime;
                }
            });
        } catch (error) {
            // Some browsers don't support seekto yet
        }
    }
}


// 5. PLAYER VISIBILITY
function openPlayer() {
    fullPlayer.classList.add("active");
    gsap.fromTo(".fp-artwork-area", { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" });
    gsap.fromTo(".fp-meta-area, .fp-progress-area, .fp-controls-area", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, delay: 0.2, stagger: 0.1 });
}

function closePlayer() {
    gsap.to(".fp-content", { y: 50, opacity: 0, duration: 0.3, onComplete: () => {
        fullPlayer.classList.remove("active");
        gsap.set(".fp-content", { y: 0, opacity: 1 });
    }});
}

// 6. PROGRESS & EVENTS
audio.addEventListener("timeupdate", () => {
    if (isNaN(audio.duration)) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    document.getElementById("miniProgress").style.width = pct + "%";
    document.getElementById("fpProgress").value = pct;
    document.getElementById("timeCurrent").textContent = formatTime(audio.currentTime);
    document.getElementById("timeTotal").textContent = formatTime(audio.duration);
    lastTime = audio.currentTime;
});

document.getElementById("fpProgress").addEventListener("input", (e) => {
    audio.currentTime = (e.target.value / 100) * audio.duration;
});
audio.addEventListener("ended", () => {
    if (repeatMode === 2) {
        // 🔂 repeat one (highest priority override)
        audio.currentTime = 0;
        audio.play();
    } 
    // ⚡ NEW QUEUE CHECK STAGING INTERCEPTOR
    else if (playQueue.length > 0) {
        // Pull the next slated global index off the front of the queue array stack
        let nextSlatedIdx = playQueue.shift(); 
        playSongByIndex(nextSlatedIdx);
    }
    else if (repeatMode === 1 || shuffleMode || currentIndex < songs.length - 1) {
        // 🔁 repeat all OR shuffle OR next exists
        nextSong();
    } 
    else {
        // ⛔ stop playback (end of standard library playlist reached)
        isPlaying = false;

        ["miniPlayBtn", "fpPlayBtn"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = YIcon.get("play");
        });
    }
});

// 7. TABS & SEARCH
function switchTab(tabId) {
    // 1. Manage Active Tab Content
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    const activeTab = document.getElementById(tabId);
    activeTab.classList.add("active");
    
    // 2. Manage Active Nav Button
    document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
    document.getElementById('nav-' + tabId).classList.add("active");

    // 3. GSAP Transition for the Content
    gsap.fromTo(activeTab, 
        { opacity: 0, y: 20, scale: 0.98 }, 
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "expo.out" }
    );

    // 4. Icon "Pop" Feedback
    gsap.fromTo('#nav-' + tabId + ' span:first-child', 
        { scale: 0.8 }, 
        { scale: 1.2, duration: 0.3, yoyo: true, repeat: 1, ease: "back.out(2)" }
    );
}
let fuse = new Fuse(songs, {
    keys: [
        "title",
        "artist",
        "album",
        "file"
    ],
    threshold: 0.35,
    ignoreLocation: true,
    includeScore: true
});

document.getElementById("searchInput").addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    const container = document.getElementById("searchResults");

    if (!q) {
        container.innerHTML = "";
        return;
    }

    // Escape regex characters so searches like "+" or "[" don't crash
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const highlightRegex = new RegExp(escaped, "gi");

    // Fuzzy search
    const results = fuse.search(q).map(r => r.item);

    container.innerHTML = results.map(song => `
        <div class="song search-item"
             onclick="playSongByIndex(${songs.indexOf(song)})"
             style="animation: slideIn .3s ease forwards;">

            <img
                src="/cover/${song.file}"
                class="cover"
                loading="lazy"
                decoding="async"
                style="border-radius:10px;">

            <div>
                <div style="font-weight:bold;">
                    ${song.title.replace(
                        highlightRegex,
                        m => `<span style="color:#1db954">${m}</span>`
                    )}
                </div>

                <div style="font-size:12px;opacity:.6;">
                    ${song.artist.replace(
                        highlightRegex,
                        m => `<span style="color:#1db954">${m}</span>`
                    )}
                </div>
            </div>
        </div>
    `).join("");

    gsap.from(".search-item", {
        x: -10,
        opacity: 0,
        duration: 0.3,
        stagger: 0.05,
        ease: "power2.out"
    });
});

// 8. HOME & PERSISTENCE
function saveState() {
    localStorage.setItem("yocrrz_state", JSON.stringify({
        lastPlayed: songs[currentIndex],
        lastTime: audio.currentTime,
        recent: recent
    }));
}

function loadState() {
    const data = JSON.parse(localStorage.getItem("yocrrz_state"));
    if (data) {
        recent = data.recent || [];
        if (data.lastPlayed) {
            const idx = songs.findIndex(s => s.file === data.lastPlayed.file);
            if (idx !== -1) {
                currentIndex = idx;
                updateUI(songs[currentIndex]);
                audio.src = `/play/${songs[currentIndex].file}`;
                audio.currentTime = data.lastTime || 0;
            }
        }
    }
}




document.addEventListener("visibilitychange", () => { if (!document.hidden && isPlaying) audio.play().catch(()=>{}); });

function toggleUploadModal(show) {
    const modal = document.getElementById('uploadModal');
    modal.style.display = show ? 'flex' : 'none';
    if (show) gsap.from(modal.children[0], { scale: 0.8, opacity: 0, duration: 0.3 });
}
// 1. Update the play/pause icon and wheel animation when state changes
function updateHomePlayState() {
    const iconContainer = document.getElementById('home-play-icon');
    const wheel = document.getElementById('home-control-wheel');
    const isCurrentlyPlaying = !audio.paused;

    if (iconContainer) {
        iconContainer.innerHTML = isCurrentlyPlaying
            ? `<svg width="14" height="14" fill="#fff" viewBox="0 0 256 256"><path d="M216,48V208a16,16,0,0,1-16,16H160a16,16,0,0,1-16-16V48a16,16,0,0,1,16-16h40A16,16,0,0,1,216,48ZM96,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V48A16,16,0,0,0,96,32Z"></path></svg>`
            : `<svg width="14" height="14" fill="#fff" viewBox="0 0 256 256" style="transform: translateX(1px);"><path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.75a16,16,0,0,1-24.26-13.51V39.76a16,16,0,0,1,24.26-13.51L232.4,114.49A15.74,15.74,0,0,1,240,128Z"></path></svg>`;
    }
    if (wheel) {
        wheel.style.animation = isCurrentlyPlaying ? 'spin 12s linear infinite' : 'none';
    }
}

audio.addEventListener('play', updateHomePlayState);
audio.addEventListener('pause', updateHomePlayState);


// 2. Update the time text and SVG progress circle on every tick
audio.addEventListener('timeupdate', () => {
    const timeText = document.getElementById('home-time-text');
    const progressCircle = document.getElementById('home-progress-circle');

    if (timeText) {
        // Ensure duration is a valid number before formatting to avoid NaN issues
        const durationStr = (audio.duration && !isNaN(audio.duration)) ? formatTime(audio.duration) : "00:00";
        timeText.innerText = `${formatTime(audio.currentTime)} / ${durationStr}`;
    }

    if (progressCircle && audio.duration) {
        const pct = (audio.currentTime / audio.duration) * 100 || 0;
        // 289 is the total stroke-dasharray value of the SVG circle
        const offset = 289 - (289 * pct) / 100;
        progressCircle.setAttribute('stroke-dashoffset', offset);
    }
});

function updateFileLabel() {
    const input = document.getElementById('fileInput');
    document.getElementById('fileLabel').textContent = input.files[0].name;
}
function renderHome() {
    const home = document.getElementById("home");
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
    
    const song = songs[currentIndex];
    const progressPct = (lastTime / audio.duration) * 100 || 0;

    // Build UI layout exactly matching the sketch
    home.innerHTML = `
        <div class="home-container" style="display: flex; flex-direction: column; gap: 20px; padding: 15px; font-family: sans-serif; color: #fff;">
            
            <div class="home-anim hero-banner" style="
                position: relative; 
                border-radius: 20px; 
                overflow: hidden; 
                height: 160px; 
                background: url('${song ? `/cover/${song.file}` : '/cover/default.jpg'}') center/cover no-repeat;
                box-shadow: 0 8px 24px rgba(0,0,0,0.3);
            ">
                <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2));"></div>
                <div style="position: absolute; bottom: 20px; left: 20px;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; text-transform: none;">
                        Hi, yocrrz
                    </h1>
                    <span style="font-size: 13px; opacity: 0.7;">${greeting}</span>
                </div>
            </div>
            <div class="card glass-card home-anim" style="
                display: flex; 
                align-items: center; 
                gap: 20px; 
                padding: 20px; 
                border-radius: 24px; 
                background: rgba(255, 255, 255, 0.05); 
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            ">
                <div id="home-control-wheel" class="control-wheel" style="
                    position: relative; 
                    width: 90px; 
                    height: 90px; 
                    border-radius: 50%; 
                    border: 2px dashed rgba(255, 255, 255, 0.3); 
                    display: flex; 
                    align-items: center; 
                    justify-content: center;
                    cursor: pointer;
                    flex-shrink: 0;
                    animation: ${isPlaying ? 'spin 12s linear infinite' : 'none'};
                " onclick="togglePlay()">
                    
                    <div id="home-play-icon" style="width: 40px; height: 40px; border-radius: 50%; background: #1db954; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(29, 185, 84, 0.4);">
                        ${isPlaying ? 
                            `<svg width="14" height="14" fill="#fff" viewBox="0 0 256 256"><path d="M216,48V208a16,16,0,0,1-16,16H160a16,16,0,0,1-16-16V48a16,16,0,0,1,16-16h40A16,16,0,0,1,216,48ZM96,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V48A16,16,0,0,0,96,32Z"></path></svg>` : 
                            `<svg width="14" height="14" fill="#fff" viewBox="0 0 256 256" style="transform: translateX(1px);"><path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.75a16,16,0,0,1-24.26-13.51V39.76a16,16,0,0,1,24.26-13.51L232.4,114.49A15.74,15.74,0,0,1,240,128Z"></path></svg>`
                        }
                    </div>
                    
                    <svg style="position: absolute;  transform: rotate(-90deg);" width="94" height="94" viewBox="0 0 100 100">
                        <circle id="home-progress-circle" cx="50" cy="50" r="40" stroke="#1db954" stroke-width="2" fill="transparent" stroke-dasharray="289" stroke-dashoffset="${289 - (289 * progressPct) / 100}" stroke-linecap="round" />
                    </svg>
                </div>

                <div style="flex: 1; min-width: 0;">
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #1db954; font-weight: bold; display: block; margin-bottom: 4px;">Current Playing</span>
                    <h2 style="margin: 0 0 4px 0; font-size: 18px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${song ? song.title : 'No Track Loaded'}</h2>
                    <p style="margin: 0; font-size: 13px; opacity: 0.6; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${song ? song.artist : 'Select a song'}</p>
                    
                    <div id="home-time-text" style="margin-top: 10px; font-family: monospace; font-size: 11px; opacity: 0.5;">
                        ${formatTime(lastTime)} / ${audio.duration ? formatTime(audio.duration) : "00:00"}
                    </div>
                </div>
            </div>

            <div class="home-anim" style="margin-top: 10px;">
                <h3 style="margin: 0 0 15px 5px; font-size: 16px; font-weight: 600; opacity: 0.9;">History Cards</h3>
                
                ${recent.length ? `
                    <div class="recent-scroll-container" style="display: flex; gap: 14px; overflow-x: auto; padding-bottom: 10px; scrollbar-width: none;">
                        ${recent.map(s => {
                            const index = songs.findIndex(x => x.file === s.file);
                            return `
                            <div class="recent-item floating" style="flex: 0 0 110px; background: rgba(255,255,255,0.03); padding: 10px; border-radius: 16px; text-align: center; cursor: pointer; border: 1px solid rgba(255,255,255,0.05);" onclick="playSongByIndex(${index})">
                                <img src="/cover/${s.file}" style="width: 90px; height: 90px; border-radius: 12px; object-fit: cover; box-shadow: 0 6px 12px rgba(0,0,0,0.3);">
                                <div style="font-size: 11px; font-weight: 500; margin-top: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${s.title}</div>
                                <div style="font-size: 9px; opacity: 0.5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${s.artist}</div>
                            </div>`;
                        }).join('')}
                    </div>
                ` : `
                    <div style="background: rgba(255,255,255,0.02); border-radius: 16px; padding: 30px; text-align: center; border: 1px dashed rgba(255,255,255,0.1); opacity: 0.5; font-size: 13px;">
                        No items in your playback history yet.
                    </div>
                `}
            </div>
            
        </div>
    `;

    // 4. Enhanced GSAP Timeline Animation Execution
    const tl = gsap.timeline();
    tl.fromTo(".home-anim", 
        { y: 30, opacity: 0, scale: 0.97 }, 
        { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.08, ease: "power3.out" }
    );
}

async function startUpload() {
    const fileInput = document.getElementById('fileInput');
    const progress = document.getElementById('uploadProgress');
    const btn = document.getElementById('uploadBtn');
    
    if (!fileInput.files.length) return;

    const file = fileInput.files[0];
    const chunkSize = 1024 * 1024; // 1MB per chunk
    const totalChunks = Math.ceil(file.size / chunkSize);
    
    btn.disabled = true;
    btn.style.opacity = "0.5";
    
    for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(file.size, start + chunkSize);
        const chunk = file.slice(start, end);
        
        const formData = new FormData();
        formData.append('file', chunk);
        formData.append('filename', file.name);
        formData.append('chunkIndex', i);
        formData.append('totalChunks', totalChunks);
        
        try {
            await fetch('/upload', { method: 'POST', body: formData });
            const pct = Math.round(((i + 1) / totalChunks) * 100);
            progress.style.width = pct + "%";
        } catch (e) {
            alert("Upload failed at chunk " + i);
            btn.disabled = false;
            return;
        }
    }
    
    // SUCCESS
    toggleUploadModal(false);
    btn.disabled = false;
    btn.style.opacity = "1";
    progress.style.width = "0%";
    
    // Refresh library immediately
    fetch("/songs").then(res => res.json()).then(data => {
        songs = data;
        renderSongs(songs);
    });
}
function sortSongs(criteria) {
    const sorted = [...songs].sort((a, b) => a[criteria].localeCompare(b[criteria]));
    renderSongs(sorted);
    
    // Smooth transition when sorting
    gsap.from(".song", {
        opacity: 0,
        y: 10,
        stagger: 0.02,
        duration: 0.4
    });
}

audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;

  const pct = (audio.currentTime / audio.duration) * 100;

  const wrap = document.querySelector(".progress-wrap");
  wrap.style.setProperty("--progress", pct + "%");

  document.getElementById("fpProgress").value = pct;

  document.getElementById("timeCurrent").textContent = formatTime(audio.currentTime);
  document.getElementById("timeTotal").textContent = formatTime(audio.duration);
});
/* SMART COVER LOADER */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const img = entry.target;

    if (img.dataset.src) {
      img.src = img.dataset.src;
      img.removeAttribute("data-src");
    }

    observer.unobserve(img);
  });
}, {
  rootMargin: "300px"
});

function renderSongs(list) {
  const container = document.getElementById("songList");

  container.innerHTML = list.map((song) => `
    <div class="song swipe-song"
         data-file="${song.file}"
         onclick="playSongByIndex(${songs.indexOf(song)})">

      <div class="delete-bg">
         
      </div>

      <div class="song-content">

        <img
          class="cover lazy-cover"
          data-src="/cover/${song.file}"
          src="data:image/svg+xml;base64,PHN2Zy..."
        >

        <div style="min-width:0;">
          <div style="
            font-weight:bold;
            white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;
          ">
            ${song.title}
          </div>

          <div style="
            font-size:12px;
            opacity:0.7;
            white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;
          ">
            ${song.artist}
          </div>
        </div>

      </div>

    </div>
  `).join("");

  requestAnimationFrame(() => {

    document
      .querySelectorAll(".lazy-cover")
      .forEach(img => observer.observe(img));

    setupSwipeDelete();
  });
}
function setupSwipeDelete() {

    document.querySelectorAll(".swipe-song")
    .forEach(song => {

        const content =
            song.querySelector(".song-content");

        song.addEventListener("touchstart", e => {

            swipeStartX =
                e.touches[0].clientX;

        });

        song.addEventListener("touchmove", e => {

            const diff =
                e.touches[0].clientX -
                swipeStartX;

            if (diff < 0) {

                content.style.transform =
                    `translateX(${Math.max(diff,-100)}px)`;
            }
        });

        song.addEventListener("touchend", () => {

            const transform =
                content.style.transform;

            if (transform.includes("-100")) {

                deleteTarget =
                    song.dataset.file;

                showDeleteModal(deleteTarget);
            }

            content.style.transform =
                "translateX(0)";
        });

    });
}
function showDeleteModal(file){

    deleteTarget = file;

    document.getElementById(
        "deleteSongName"
    ).textContent = file;

    document.getElementById(
        "deleteModal"
    ).style.display = "flex";

    gsap.fromTo(
        ".delete-card",
        {scale:.8,opacity:0},
        {scale:1,opacity:1,duration:.25}
    );
}

function closeDeleteModal(){

    document.getElementById(
        "deleteModal"
    ).style.display = "none";
}
document.addEventListener("load", (e) => {
  if (e.target.classList?.contains("cover")) {
    e.target.classList.add("loaded");
  }
}, true);
function toggleSpotifyModal(show){

    document.getElementById("spotifyModal").style.display =
        show ? "flex" : "none";

}
async function refreshSongs() {
    const res = await fetch("/songs");
    const list = await res.json();

    songs = list;
    originalSongs = [...list];

    renderSongs(songs);
}

async function trackDownload(jobId) {

    const urlInput = document.getElementById("spotifyUrl");
    const statusText = document.getElementById("spotifyStatus");
    const statusBox = document.getElementById("spotifyStatusBox");
    const loaderFrame = document.getElementById("spotifyLoader");
    const cursor = document.getElementById("terminalCursor");
    const execBtn = document.getElementById("spotifyDownloadBtn");

    const poll = setInterval(async () => {

        try {

            const res = await fetch(`/job/${jobId}`);
            const job = await res.json();

            const progress = Math.max(0, job.progress || 0);

            loaderFrame.textContent = `${progress}%`;

            let status = job.stage || "PROCESSING";

            if (job.speed) {
                status += ` // ${job.speed}`;
            }

            if (job.eta && progress < 100) {
                status += ` // ETA ${job.eta}`;
            }

            statusText.textContent = status;

            if (progress >= 100) {

                clearInterval(poll);

                statusText.textContent = "SUCCESS_SYNC_COMPLETE";
                statusBox.style.borderLeftColor = "#1db954";
                statusText.style.color = "#1db954";

                cursor.style.display = "none";

                await refreshSongs();

                urlInput.value = "";

                setTimeout(() => {

                    toggleSpotifyModal(false);

                    setTimeout(() => {

                        statusText.textContent = "IDLE_READY";
                        statusText.style.color = "#fff";
                        statusBox.style.borderLeftColor = "#555";

                        loaderFrame.style.display = "none";
                        loaderFrame.textContent = "0%";

                        execBtn.disabled = false;
                        execBtn.style.opacity = "1";
                        execBtn.style.cursor = "pointer";

                    }, 300);

                }, 1200);

            }

            if (progress === -1) {

                clearInterval(poll);

                statusText.textContent =
                    job.stage || "DOWNLOAD_FAILED";

                statusBox.style.borderLeftColor = "#ff3333";
                statusText.style.color = "#ff3333";

                cursor.style.display = "none";

                execBtn.disabled = false;
                execBtn.style.opacity = "1";
                execBtn.style.cursor = "pointer";
            }

        } catch (err) {

            console.error(err);

            clearInterval(poll);

            statusText.textContent = "CONNECTION_LOST";
            statusBox.style.borderLeftColor = "#ff3333";
            statusText.style.color = "#ff3333";

            cursor.style.display = "none";

            execBtn.disabled = false;
            execBtn.style.opacity = "1";
            execBtn.style.cursor = "pointer";
        }

    }, 500);
}

async function downloadSpotify() {

    const urlInput = document.getElementById("spotifyUrl");
    const statusText = document.getElementById("spotifyStatus");
    const statusBox = document.getElementById("spotifyStatusBox");
    const loaderFrame = document.getElementById("spotifyLoader");
    const cursor = document.getElementById("terminalCursor");
    const execBtn = document.getElementById("spotifyDownloadBtn");

    const url = urlInput.value.trim();

    if (!url) {

        statusText.textContent = "ERR_URL_EMPTY";
        statusBox.style.borderLeftColor = "#ff3333";
        statusText.style.color = "#ff3333";

        loaderFrame.style.display = "none";
        cursor.style.display = "none";

        return;
    }

    statusText.textContent = "INITIALIZING_JOB";
    statusBox.style.borderLeftColor = "#1db954";
    statusText.style.color = "#1db954";

    loaderFrame.style.display = "block";
    loaderFrame.textContent = "0%";

    cursor.style.display = "inline-block";

    execBtn.disabled = true;
    execBtn.style.opacity = "0.4";
    execBtn.style.cursor = "not-allowed";

    try {

        const response = await fetch("/spotify-download", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url: url
            })
        });

        const data = await response.json();

        if (!data.success) {

            statusText.textContent =
                `FAILED // ${data.error || "UNKNOWN_ERR"}`;

            statusBox.style.borderLeftColor = "#ff3333";
            statusText.style.color = "#ff3333";

            cursor.style.display = "none";

            execBtn.disabled = false;
            execBtn.style.opacity = "1";
            execBtn.style.cursor = "pointer";

            return;
        }

        trackDownload(data.job_id);

    } catch (err) {

        statusText.textContent =
            `CRIT_SYS_ERR // ${err.message.toUpperCase()}`;

        statusBox.style.borderLeftColor = "#ff3333";
        statusText.style.color = "#ff3333";

        cursor.style.display = "none";

        execBtn.disabled = false;
        execBtn.style.opacity = "1";
        execBtn.style.cursor = "pointer";
    }
}
// ==========================================
// 🎛️ FERAL LIQUID AUDIO VISUALIZER & COLOR ENGINE
// ==========================================

let audioCtx = null;
let analyser = null;
let source = null;
let freqData = null;
let visualizerStarted = false;
let bassMovingAverage = 0;
let dynamicCoverColor = "rgba(255, 255, 255, "; // Default fallback

// 1. Establish the Audio Context
function initAudioVisualizer() {
    if (visualizerStarted) return;
    
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        
        analyser.fftSize = 256; 
        analyser.smoothingTimeConstant = 0.0; // ZERO smoothing. Pure, raw data.
        
        source = audioCtx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        
        freqData = new Uint8Array(analyser.frequencyBinCount);
        visualizerStarted = true;
        
        renderAudioBorderTick();
    } catch (e) {
        console.log("Web Audio Context bypassed: ", e);
    }
}

// 2. Trigger Engine on Play
audio.addEventListener('play', () => {
    initAudioVisualizer();
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
});

// 3. True Album Color Extractor
function extractDominantColor(imgElement) {
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        
        // Pull the 1x1 hardware-averaged pixel
        ctx.drawImage(imgElement, 0, 0, 1, 1);
        let [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        
        // 🎛️ VIBRANCY MULTIPLIER: Push the dominant color channel so it isn't muddy
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        
        // If the cover is mostly greyscale, force a slight tint to prevent dead UI
        if (max - min < 20) { 
            r = Math.min(r + 15, 255);
            g = Math.min(g + 15, 255);
        } else {
            // Amplify the strongest color channel by 25%
            if (r === max) r = Math.min(r * 1.25, 255);
            if (g === max) g = Math.min(g * 1.25, 255);
            if (b === max) b = Math.min(b * 1.25, 255);
        }

        // Floor the floats back to integers
        r = Math.floor(r); 
        g = Math.floor(g); 
        b = Math.floor(b);

        // Update the visualizer's specific string
        dynamicCoverColor = `rgba(${r}, ${g}, ${b}, `; 
        
        // 🔥 THE MAGIC: Inject the raw RGB array globally into the root CSS
        document.documentElement.style.setProperty('--ambient-rgb', `${r}, ${g}, ${b}`);

    } catch (e) {
        // Fallback to the signature branding green
        dynamicCoverColor = "rgba(255, 255, 255, "; 
        document.documentElement.style.setProperty('--ambient-rgb', `29, 185, 84`);
    }
}
// Add this above the render loop
let currentBass = 0;

function renderAudioBorderTick() {
    if (!visualizerStarted || !isPlaying) {
        requestAnimationFrame(renderAudioBorderTick);
        return;
    }

    analyser.getByteFrequencyData(freqData);

    // ============================
    // Wider Bass Region
    // ============================

    let kickSum = 0;

    // Covers roughly 20-120Hz depending on fftSize
    for (let i = 1; i <= 8; i++) {
        kickSum += freqData[i];
    }

    let rawBass = kickSum / 8;

    // ============================
    // Moving Average
    // ============================

    bassMovingAverage =
        bassMovingAverage * 0.94 +
        rawBass * 0.06;

    let bassSpike = rawBass - bassMovingAverage;

    bassSpike = Math.max(bassSpike, 0);

    // ============================
    // Better Sensitivity
    // ============================

    let bassFactor = bassSpike / 28;

    bassFactor = Math.min(bassFactor, 1);

    // Much nicer than cubic
    let shaped =
        Math.pow(bassFactor, 1.8);

    let targetBass =
        Math.min(shaped * 2.2, 1);

    // Tiny noise gate
    if (bassSpike < 3)
        targetBass = 0;

    // ============================
    // Separate Attack / Release
    // ============================

    if (targetBass > currentBass) {

        // Fast attack
        currentBass +=
            (targetBass - currentBass) * 0.45;

    } else {

        // Slow release
        currentBass +=
            (targetBass - currentBass) * 0.12;

    }

    // ============================
    // Blob Animation
    // ============================

    const t = performance.now() / 180;
    const baseR = 50;

    const waveAmp =
        5 +
        currentBass * 34;

    const c1 = baseR + Math.sin(t) * waveAmp;
    const c2 = baseR + Math.cos(t * 1.3) * waveAmp;
    const c3 = baseR + Math.sin(t * 0.7) * waveAmp;
    const c4 = baseR + Math.cos(t * 1.6) * waveAmp;

    const c5 = baseR + Math.cos(t * 1.2) * waveAmp;
    const c6 = baseR + Math.sin(t * 1.4) * waveAmp;
    const c7 = baseR + Math.cos(t * 0.8) * waveAmp;
    const c8 = baseR + Math.sin(t * 1.7) * waveAmp;

    const liquidRadius =
        `${c1}% ${c2}% ${c3}% ${c4}% / ${c5}% ${c6}% ${c7}% ${c8}%`;

    const globScale = 1.06 + (currentBass * 0.34);
    const globAlpha =
        0.75 +
        currentBass * 0.25;

    const root = document.documentElement;

    root.style.setProperty("--liquid-radius", liquidRadius);
    root.style.setProperty("--glob-scale", globScale);
    root.style.setProperty("--glob-alpha", globAlpha);
    root.style.setProperty(
        "--dynamic-glow-color",
        `${dynamicCoverColor} 1)`
    );

    requestAnimationFrame(renderAudioBorderTick);
}
async function confirmDelete() {

    if (!deleteTarget) return;

    try {

        const res = await fetch(
            `/delete/${encodeURIComponent(deleteTarget)}`,
            {
                method: "DELETE"
            }
        );

        const data = await res.json();

        if (!data.success) {
            alert(data.error || "Delete failed");
            return;
        }

        // Remove from local array
        songs = songs.filter(
            s => s.file !== deleteTarget
        );

        originalSongs = originalSongs.filter(
            s => s.file !== deleteTarget
        );

        recent = recent.filter(
            s => s.file !== deleteTarget
        );

        // If current song was deleted
        if (
            songs[currentIndex] &&
            songs[currentIndex].file === deleteTarget
        ) {
            audio.pause();
            audio.src = "";
            isPlaying = false;
        }

        renderSongs(songs);
        renderHome();

        closeDeleteModal();

        deleteTarget = null;

    } catch(err) {

        console.error(err);
        alert("Delete failed");

    }
}
