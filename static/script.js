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
let currentSong = null;
let lyricsSong = null;

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

    currentSong = song; // ← IMPORTANT

    audio.src = `/play/${song.file}`;
    audio.play();

    isPlaying = true;

    recent = [
        song,
        ...recent.filter(s => s.file !== song.file)
    ].slice(0, 5);

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
    const saved = localStorage.getItem("yocrrz_state");

    if (!saved) return;

    try {
        const data = JSON.parse(saved);

        recent = data.recent || [];

        if (!data.lastPlayed) return;

        const idx = songs.findIndex(
            s => s.file === data.lastPlayed.file
        );

        if (idx === -1) {
            console.warn(
                "Saved song no longer exists:",
                data.lastPlayed.file
            );
            return;
        }

        // Restore current song index
        currentIndex = idx;

        // IMPORTANT:
        // Restore currentSong so openLyrics() can use it
        currentSong = songs[currentIndex];

        // Restore player UI
        updateUI(currentSong);

        // Restore audio source
        audio.src = `/play/${currentSong.file}`;

        // Restore playback position
        audio.addEventListener(
            "loadedmetadata",
            () => {
                if (
                    data.lastTime &&
                    !isNaN(data.lastTime) &&
                    data.lastTime < audio.duration
                ) {
                    audio.currentTime = data.lastTime;
                }
            },
            { once: true }
        );

    } catch (error) {
        console.error("Failed to load saved player state:", error);

        // Prevent corrupted localStorage from breaking the player
        localStorage.removeItem("yocrrz_state");
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
function getContinueSong() {
    const song = songs[currentIndex];

    // Only show Continue Listening when there is meaningful progress
    if (!song || lastTime <= 5 || !audio.duration || lastTime >= audio.duration - 5) {
        return null;
    }

    return {
        song,
        position: lastTime,
        duration: audio.duration
    };
}

function getRecentlyAdded() {
    // Assumes songs have a `dateAdded` field.
    // Falls back to the existing order if they don't.
    return [...songs]
        .filter(song => song.dateAdded)
        .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
        .slice(0, 8);
}
function renderHome() {
    const home = document.getElementById("home");

    const hour = new Date().getHours();

    const greeting =
        hour < 12 ? "GOOD MORNING" :
        hour < 18 ? "GOOD AFTERNOON" :
        "GOOD EVENING";

    const song = songs[currentIndex];

    const duration = Number.isFinite(audio.duration)
        ? audio.duration
        : 0;

    const currentTime = Number.isFinite(lastTime)
        ? lastTime
        : 0;

    const progressPct = duration > 0
        ? Math.min(100, Math.max(0, (currentTime / duration) * 100))
        : 0;

    const queue = Array.isArray(playQueue)
        ? playQueue
        : [];

    const continueSong =
        song &&
        duration > 0 &&
        currentTime > 5 &&
        currentTime < duration - 5;

    const recentlyAdded = songs
        .slice()
        .reverse()
        .slice(0, 8);

    const recentSongs = Array.isArray(recent)
        ? recent.slice(0, 8)
        : [];

    const formatArtist = value =>
        value || "Unknown Artist";

    const cover = s =>
        s ? `/cover/${encodeURIComponent(s.file)}` : "/cover/default.jpg";

    const songIndex = s =>
        songs.findIndex(x => x.file === s.file);

    home.innerHTML = `
        <div class="fsx-home">


            <header class="fsx-home-header home-anim">

                <div>
              

                    <h1>
                        ${greeting}<br>
                        
                    </h1>
                </div>

                <div class="fsx-library-meta">
                    <div class="fsx-live-dot"></div>

                    <div>
                        <strong>${songs.length}</strong>
                        <span>tracks in library</span>
                    </div>
                </div>

            </header>



            <section class="fsx-now home-anim">

                <div class="fsx-now-art">

                    <img
                        src="${cover(song)}"
                        alt=""
                    >

                    <div class="fsx-art-overlay"></div>

                    <div class="fsx-art-index">
                        ${song ? String(currentIndex + 1).padStart(2, "0") : "--"}
                    </div>


                </div>


                <div class="fsx-now-info">

                    <div class="fsx-section-label">
                        NOW PLAYING
                    </div>

                    <h2>
                        ${song ? song.title : "Nothing playing"}
                    </h2>

                    <p>
                        ${song ? formatArtist(song.artist) : "Choose something from your library"}
                    </p>


                    <!-- TIMELINE -->

                    <div class="fsx-timeline">

                 

                        <div class="fsx-time-row">
                            <span id="home-time-text">
                                ${formatTime(currentTime)}
                            </span>

                      
                        </div>

                    </div>



            </section>


            <section class="fsx-stats home-anim">

                <div class="fsx-stat">
                    <span class="fsx-stat-icon">
                     <svg width="256" height="256" viewBox="0 0 256 256" fill="none"
     xmlns="http://www.w3.org/2000/svg">

    <rect width="256" height="256" rx="64" fill="#0B0D0D"/>

    <path
        d="M70 151V105"
        stroke="#C8FF3D"
        stroke-width="18"
        stroke-linecap="round"
    />

    <path
        d="M103 177V79"
        stroke="#C8FF3D"
        stroke-width="18"
        stroke-linecap="round"
    />

    <path
        d="M136 194V62"
        stroke="#C8FF3D"
        stroke-width="18"
        stroke-linecap="round"
    />

    <path
        d="M169 169V87"
        stroke="#C8FF3D"
        stroke-width="18"
        stroke-linecap="round"
    />

    <path
        d="M202 145V111"
        stroke="#C8FF3D"
        stroke-width="18"
        stroke-linecap="round"
    />

</svg>
                    </span>

                    <div onclick="switchTab('songs')" >
                        <strong>${songs.length}</strong>
                        <small>LIBRARY</small>
                    </div>
                </div>
                
                <div class="fsx-stat">
                    <span class="fsx-stat-icon">
<svg width="256" height="256" viewBox="0 0 256 256" fill="none"
     xmlns="http://www.w3.org/2000/svg">

  <rect width="256" height="256" rx="64" fill="#0B0D0D"/>

  <!-- Search lens -->
  <path
    d="M112 52
       C78.86 52 52 78.86 52 112
       C52 145.14 78.86 172 112 172
       C145.14 172 172 145.14 172 112
       C172 78.86 145.14 52 112 52Z"
    stroke="#C8FF3D"
    stroke-width="18"
  />

  <!-- Offset search handle -->
  <path
    d="M155 155L204 204"
    stroke="#C8FF3D"
    stroke-width="18"
    stroke-linecap="round"
  />

  <!-- FSX signature cut -->
  <path
    d="M91 112H133"
    stroke="#0B0D0D"
    stroke-width="10"
    stroke-linecap="round"
  />

</svg>
                    </span>

                    <div onclick="switchTab('search')" >
                      
                        <small>SEARCH</small>
                    </div>
                </div>
                                <div class="fsx-stat">
                    <span class="fsx-stat-icon">
<svg width="256" height="256" viewBox="0 0 256 256" fill="none"
     xmlns="http://www.w3.org/2000/svg">

    <rect width="256" height="256" rx="64" fill="#0B0D0D"/>

    <circle
        cx="128"
        cy="128"
        r="78"
        stroke="#C8FF3D"
        stroke-width="16"
    />

    <path
        d="M82 108C113 96 154 99 180 111"
        stroke="#C8FF3D"
        stroke-width="15"
        stroke-linecap="round"
    />

    <path
        d="M88 132C113 123 145 125 169 136"
        stroke="#C8FF3D"
        stroke-width="15"
        stroke-linecap="round"
    />

    <path
        d="M96 155C116 149 138 151 156 159"
        stroke="#C8FF3D"
        stroke-width="14"
        stroke-linecap="round"
    />

</svg>
                    </span>

                    <div onclick="toggleSpotifyModal(true)" >
                      
                        <small>SPOTIFY</small>
                    </div>
                </div>



            </section>


            ${
                continueSong
                    ? `
                        <section class="fsx-section home-anim">

                            <div class="fsx-section-header">
                                <div>
                                    <span class="fsx-section-kicker">
                                        PICK UP WHERE YOU LEFT OFF
                                    </span>

                                    <h3>Continue Listening</h3>
                                </div>
                            </div>


                            <div
                                class="fsx-continue"
                                onclick="playSongByIndex(${currentIndex})"
                            >

                                <div class="fsx-continue-cover">

                                    <img src="${cover(song)}">

                                    <div class="fsx-continue-play">
                                        <i class="ph ph-play"></i>
                                    </div>

                                </div>


                                <div class="fsx-continue-info">

                                    <div class="fsx-continue-top">

                                        <div>
                                            <strong>
                                                ${song.title}
                                            </strong>

                                            <span>
                                                ${formatArtist(song.artist)}
                                            </span>
                                        </div>

                                        <b>
                                            ${Math.round(progressPct)}%
                                        </b>

                                    </div>


                                    <div class="fsx-continue-progress">
                                        <span
                                            style="width:${progressPct}%"
                                        ></span>
                                    </div>


                                    <div class="fsx-continue-bottom">

                                        <span>
                                            ${formatTime(currentTime)} listened
                                        </span>

                                        <span>
                                            ${formatTime(Math.max(
                                                0,
                                                duration - currentTime
                                            ))} remaining
                                        </span>

                                    </div>

                                </div>

                            </div>

                        </section>
                    `
                    : ""
            }



            ${
                queue.length
                    ? `
                        <section class="fsx-section home-anim">

                            <div class="fsx-section-header">

                                <div>
                                    <span class="fsx-section-kicker">
                                        PLAYBACK
                                    </span>

                                    <h3>Up Next</h3>
                                </div>

                                <button
                                    class="fsx-text-button"
                                    onclick="typeof openQueue === 'function' && openQueue()"
                                >
                                    VIEW QUEUE
                                    <i class="ph ph-arrow-up-right"></i>
                                </button>

                            </div>


                            <div class="fsx-queue">

                                ${queue.slice(0, 5).map((item, i) => {

                                    const q =
                                        typeof item === "number"
                                            ? songs[item]
                                            : item;

                                    if (!q) return "";

                                    return `
                                        <div class="fsx-queue-item">

                                            <span class="fsx-queue-number">
                                                ${String(i + 1).padStart(2, "0")}
                                            </span>

                                            <img
                                                src="${cover(q)}"
                                                alt=""
                                            >

                                            <div class="fsx-queue-info">

                                                <strong>
                                                    ${q.title}
                                                </strong>

                                                <span>
                                                    ${formatArtist(q.artist)}
                                                </span>

                                            </div>

                                            <button
                                                onclick="playSongByIndex(${songIndex(q)})"
                                                class="fsx-queue-play"
                                            >
                                                <i class="ph ph-play"></i>
                                            </button>

                                        </div>
                                    `;

                                }).join("")}

                            </div>

                        </section>
                    `
                    : ""
            }


 
            <section class="fsx-section home-anim">

                <div class="fsx-section-header">

                    <div>
                        <span class="fsx-section-kicker">
                            YOUR ACTIVITY
                        </span>

                        <h3>Recently Played</h3>
                    </div>

                </div>


                ${
                    recentSongs.length
                        ? `
                            <div class="fsx-album-grid">

                                ${recentSongs.map((s, i) => {

                                    const index = songIndex(s);

                                    return `
                                        <article
                                            class="fsx-album"
                                            onclick="playSongByIndex(${index})"
                                        >

                                            <div class="fsx-album-art">

                                                <img
                                                    src="${cover(s)}"
                                                    alt=""
                                                >

                                                <div class="fsx-album-overlay">
                                                    <i class="ph ph-play"></i>
                                                </div>

                                                <span>
                                                    ${String(i + 1).padStart(2, "0")}
                                                </span>

                                            </div>

                                            <strong>
                                                ${s.title}
                                            </strong>

                                            <small>
                                                ${formatArtist(s.artist)}
                                            </small>

                                        </article>
                                    `;

                                }).join("")}

                            </div>
                        `
                        : `
                            <div class="fsx-empty">
                                <i class="ph ph-headphones"></i>

                                <strong>
                                    Nothing here yet
                                </strong>

                                <span>
                                    Start listening and your history will appear here.
                                </span>
                            </div>
                        `
                }

            </section>



            ${
                recentlyAdded.length
                    ? `
                        <section class="fsx-section home-anim">

                            <div class="fsx-section-header">

                                <div>
                                    <span class="fsx-section-kicker">
                                        LIBRARY
                                    </span>

                                    <h3>Recently Added</h3>
                                </div>

                                <span class="fsx-count">
                                    ${recentlyAdded.length} NEWEST
                                </span>

                            </div>


                            <div class="fsx-added-grid">

                                ${recentlyAdded.map(s => {

                                    const index = songIndex(s);

                                    return `
                                        <article
                                            class="fsx-added"
                                            onclick="playSongByIndex(${index})"
                                        >

                                            <img
                                                src="${cover(s)}"
                                                alt=""
                                            >

                                            <div>

                                                <strong>
                                                    ${s.title}
                                                </strong>

                                                <span>
                                                    ${formatArtist(s.artist)}
                                                </span>

                                            </div>

                                            <i class="ph ph-arrow-up-right"></i>

                                        </article>
                                    `;

                                }).join("")}

                            </div>

                        </section>
                    `
                    : ""
            }


    `;



    window.seekFromHome = function (event) {

        if (!duration || !audio) return;

        const rect =
            event.currentTarget.getBoundingClientRect();

        const ratio =
            Math.min(
                1,
                Math.max(
                    0,
                    (event.clientX - rect.left) / rect.width
                )
            );

        audio.currentTime = ratio * duration;

        lastTime = audio.currentTime;

        renderHome();
    };



    if (typeof gsap !== "undefined") {

        gsap.fromTo(
            ".home-anim",
            {
                opacity: 0,
                y: 24
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.55,
                stagger: 0.055,
                ease: "power3.out"
            }
        );


        gsap.fromTo(
            ".fsx-now-art",
            {
                opacity: 0,
                scale: 0.94
            },
            {
                opacity: 1,
                scale: 1,
                duration: 0.8,
                delay: 0.1,
                ease: "power3.out"
            }
        );

    }
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

  container.innerHTML = list.map((song) => {
    const index = songs.indexOf(song);

    return `
      <div
        class="song swipe-song"
        data-file="${song.file}"
        data-index="${index}"
      >

        <!-- Swipe action -->
        <div class="delete-bg">
          <div class="delete-icon">
           <svg
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M5 7H19"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
  />

  <path
    d="M9 7V5.5C9 4.67 9.67 4 10.5 4H13.5C14.33 4 15 4.67 15 5.5V7"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
  />

  <path
    d="M7 7L7.7 18.2C7.76 19.22 8.61 20 9.63 20H14.37C15.39 20 16.24 19.22 16.3 18.2L17 7"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
  />

  <path
    d="M10 10.5V16.5M14 10.5V16.5"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
</svg>
          </div>
          <span>Delete</span>
        </div>

        <!-- Actual song card -->
        <div
          class="song-content"
          onclick="playSongByIndex(${index})"
        >

          <div class="song-cover-wrap">
            <img
              class="cover lazy-cover"
              data-src="/cover/${song.file}"
              src="data:image/svg+xml;base64,PHN2Zy..."
              loading="lazy"
              draggable="false"
            />

            <div class="cover-shine"></div>
          </div>

          <div class="song-info">

            <div class="song-title">
              ${escapeHtml(song.title)}
            </div>

            <div class="song-artist">
              ${escapeHtml(song.artist || "Unknown artist")}
            </div>

          </div>

          <div class="song-meta">

            <span class="song-duration">
              ${song.duration || ""}
            </span>

            <button
              class="song-more"
              onclick="event.stopPropagation(); openSongMenu('${escapeAttr(song.file)}')"
              aria-label="More options"
            >
              <i class="ph ph-dots-three-vertical"></i>
            </button>

          </div>

        </div>
      </div>
    `;
  }).join("");

  requestAnimationFrame(() => {
    document
      .querySelectorAll(".lazy-cover")
      .forEach(img => observer.observe(img));

    setupSwipeDelete();
  });
}


function setupSwipeDelete() {

  document.querySelectorAll(".swipe-song").forEach(song => {

    const content = song.querySelector(".song-content");

    let startX = 0;
    let currentX = 0;
    let dragging = false;

    song.addEventListener(
      "touchstart",
      e => {

        startX = e.touches[0].clientX;
        currentX = 0;
        dragging = false;

        content.style.transition = "none";

      },
      { passive: true }
    );


    song.addEventListener(
      "touchmove",
      e => {

        const diff =
          e.touches[0].clientX - startX;

        /*
         * Only activate when swiping left.
         * Small movements are ignored so normal
         * vertical scrolling stays smooth.
         */

        if (Math.abs(diff) < 8) return;

        if (diff < 0) {

          dragging = true;

          currentX = Math.max(diff, -110);

          content.style.transform =
            `translate3d(${currentX}px, 0, 0)`;

          song.classList.toggle(
            "swiping",
            currentX <= -40
          );
        }

      },
      { passive: true }
    );


    song.addEventListener("touchend", () => {

      content.style.transition =
        "transform .28s cubic-bezier(.22,1,.36,1)";

      if (currentX <= -85) {

        deleteTarget = song.dataset.file;

        showDeleteModal(deleteTarget);

      }

      content.style.transform =
        "translate3d(0, 0, 0)";

      song.classList.remove("swiping");

      setTimeout(() => {
        content.style.transition = "";
      }, 300);

    });

  });
}


function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function escapeAttr(value = "") {
  return String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll("'", "\\'");
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
    const execBtn = document.getElementById("SPOTIFYDownloadBtn");

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
function extractDominantColor(imgElement) {
    try {
        const canvas = document.createElement("canvas");
        const size = 32;

        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext("2d", {
            willReadFrequently: true
        });

        ctx.drawImage(imgElement, 0, 0, size, size);

        const data = ctx.getImageData(0, 0, size, size).data;

        const colors = [];

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            if (a < 128) continue;

            // Ignore extremely dark pixels
            const brightness = (r + g + b) / 3;
            if (brightness < 15) continue;

            // RGB → rough saturation
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const saturation = max - min;

            colors.push({
                r,
                g,
                b,
                brightness,
                saturation
            });
        }

        if (!colors.length) throw new Error("No usable colors");

        /*
         * Quantize colors.
         *
         * This groups similar colors together so one random
         * green pixel doesn't become its own "dominant" color.
         */
        const buckets = new Map();

        for (const c of colors) {
            const r = Math.floor(c.r / 32);
            const g = Math.floor(c.g / 32);
            const b = Math.floor(c.b / 32);

            const key = `${r},${g},${b}`;

            if (!buckets.has(key)) {
                buckets.set(key, {
                    count: 0,
                    r: 0,
                    g: 0,
                    b: 0
                });
            }

            const bucket = buckets.get(key);

            bucket.count++;
            bucket.r += c.r;
            bucket.g += c.g;
            bucket.b += c.b;
        }

        // Find the largest color cluster
        let dominant = null;

        for (const bucket of buckets.values()) {
            if (!dominant || bucket.count > dominant.count) {
                dominant = bucket;
            }
        }

        let r = Math.round(dominant.r / dominant.count);
        let g = Math.round(dominant.g / dominant.count);
        let b = Math.round(dominant.b / dominant.count);

        /*
         * Slight vibrancy boost.
         * Don't brutally amplify one channel.
         */
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);

        if (max - min > 20) {
            if (r === max) r = Math.min(Math.round(r * 1.10), 255);
            if (g === max) g = Math.min(Math.round(g * 1.10), 255);
            if (b === max) b = Math.min(Math.round(b * 1.10), 255);
        }

        dynamicCoverColor = `rgba(${r}, ${g}, ${b}, `;

        document.documentElement.style.setProperty(
            "--ambient-rgb",
            `${r}, ${g}, ${b}`
        );

    } catch (e) {
        dynamicCoverColor = "rgba(255, 255, 255, ";

        document.documentElement.style.setProperty(
            "--ambient-rgb",
            "29, 185, 84"
        );
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
// lyrics thingu
function showLyricsDownloadButton() {

    const container =
        document.getElementById("lyricsContainer");

    container.innerHTML = `
        <div class="lyrics-empty">

            <div class="lyric-line active">
                Lyrics aren't downloaded
            </div>

            <button
                class="lyrics-download-btn"
                onclick="downloadLyrics()"
            >
                Download Lyrics
            </button>

        </div>
    `;
}
async function downloadLyrics() {

    if (!lyricsSong) return;

    const container =
        document.getElementById("lyricsContainer");

    container.innerHTML = `
        <div class="lyrics-empty">
            <div class="lyric-line active">
                Searching for lyrics...
            </div>
        </div>
    `;

    try {

        const response = await fetch(
            `/lyrics/ensure/${encodeURIComponent(lyricsSong.file)}`,
            {
                method: "POST"
            }
        );

        const data = await response.json();

        if (!response.ok || !data.available) {

            container.innerHTML = `
                <div class="lyrics-empty">

                    <div class="lyric-line active">
                        Lyrics not found
                    </div>

                    <button
                        class="lyrics-download-btn"
                        onclick="downloadLyrics()"
                    >
                        Try Again
                    </button>

                </div>
            `;

            return;
        }

        // Fetch the newly created LRC
        const lrcResponse = await fetch(
            `/lyrics/${encodeURIComponent(lyricsSong.file)}`
        );

        if (!lrcResponse.ok) {
            throw new Error("LRC file unavailable");
        }

        const lrc = await lrcResponse.text();

        renderLyrics(lrc);

    } catch (error) {

        console.error(
            "Lyrics download error:",
            error
        );

        container.innerHTML = `
            <div class="lyrics-empty">

                <div class="lyric-line active">
                    Failed to download lyrics
                </div>

                <button
                    class="lyrics-download-btn"
                    onclick="downloadLyrics()"
                >
                    Retry
                </button>

            </div>
        `;
    }
}
function parseLRC(lrc) {
    const lines = [];

    for (const line of lrc.split("\n")) {

        const match = line.match(
            /^\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)$/
        );

        if (!match) continue;

        const minutes = Number(match[1]);
        const seconds = Number(match[2]);

        lines.push({
            time: minutes * 60 + seconds,
            text: match[3].trim()
        });
    }

    return lines.sort((a, b) => a.time - b.time);
}
function renderLyrics(lrc) {

    const lines = parseLRC(lrc);

    const container =
        document.getElementById("lyricsContainer");

    container.innerHTML = "";

    lines.forEach((line, index) => {

        const el = document.createElement("div");

        el.className = "lyric-line";
        el.textContent = line.text;

        el.dataset.time = line.time;
        el.dataset.index = index;

        el.onclick = () => {
            audio.currentTime = line.time;
        };

        container.appendChild(el);
    });
}
function updateLyrics() {

    const lines =
        document.querySelectorAll(".lyric-line[data-time]");

    if (!lines.length) return;

    let activeIndex = -1;

    for (let i = 0; i < lines.length; i++) {

        const time = Number(lines[i].dataset.time);

        if (audio.currentTime >= time) {
            activeIndex = i;
        } else {
            break;
        }
    }

    lines.forEach((line, i) => {

        line.classList.toggle("active", i === activeIndex);
        line.classList.toggle("passed", i < activeIndex);

    });

    if (activeIndex >= 0) {

        lines[activeIndex].scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }
}


audio.addEventListener("timeupdate", () => {

    updateLyrics();

    const current = audio.currentTime || 0;
    const duration = audio.duration || 0;

    document.getElementById("lyricsCurrentTime")
        .textContent = formatTime(current);

    document.getElementById("lyricsDuration")
        .textContent = formatTime(duration);

    const percent = duration
        ? (current / duration) * 100
        : 0;

    document.getElementById("lyricsProgressFill")
        .style.width = `${percent}%`;
});

audio.addEventListener(
    "timeupdate",
    updateLyrics
);
async function openLyrics(song = currentSong) {
    console.log("openLyrics called", song);
    try {

        if (!song) return;

        lyricsSong = song;

        const overlay =
            document.getElementById("lyricsOverlay");

        const container =
            document.getElementById("lyricsContainer");

        const title =
            document.getElementById("lyricsTitle");

        const artist =
            document.getElementById("lyricsArtist");

        if (!overlay || !container || !title || !artist) {
            throw new Error("Lyrics elements missing from DOM");
        }

        title.textContent =
            song.title || "Unknown Track";

        artist.textContent =
            song.artist || "Unknown Artist";

        container.innerHTML = `
            <div class="lyrics-empty">
                <div class="lyric-line active">
                    Loading lyrics...
                </div>
            </div>
        `;

        overlay.classList.add("active");

        const response = await fetch(
            `/lyrics/${encodeURIComponent(song.file)}`
        );

        if (!response.ok) {
            showLyricsDownloadButton();
            return;
        }

        const lrc = await response.text();

        if (!lrc.trim()) {
            showLyricsDownloadButton();
            return;
        }

        renderLyrics(lrc);

        overlay.classList.remove("expanded");
        lyricsExpanded = false;

    } catch (error) {

        console.error("Lyrics error:", error);

        const container =
            document.getElementById("lyricsContainer");

        if (container) {
            container.innerHTML = `
                <div class="lyrics-empty">

                    <div class="lyric-line active">
                        Unable to check lyrics
                    </div>

                    <button
                        class="lyrics-download-btn"
                        onclick="downloadLyrics()"
                    >
                        Try Again
                    </button>

                </div>
            `;
        }
    }
}
let lyricsExpanded = false;

function toggleLyrics() {

    const overlay =
        document.getElementById("lyricsOverlay");

    if (overlay.classList.contains("active")) {

        overlay.classList.remove("active");
        overlay.classList.remove("expanded");

        lyricsExpanded = false;

        return;
    }

    overlay.classList.add("active");
}
function expandLyrics() {

    const overlay =
        document.getElementById("lyricsOverlay");

    const button =
        document.getElementById("lyricsExpand");

    lyricsExpanded = !lyricsExpanded;

    overlay.classList.toggle(
        "expanded",
        lyricsExpanded
    );

    if (lyricsExpanded) {

        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg"
                 width="20"
                 height="20"
                 fill="none"
                 viewBox="0 0 256 256">

                <path
                    d="M48 96V48h48M208 96V48h-48M48 160v48h48M208 160v48h-48"
                    stroke="currentColor"
                    stroke-width="16"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>
            </svg>
        `;

    } else {

        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg"
                 width="20"
                 height="20"
                 fill="none"
                 viewBox="0 0 256 256">

                <path
                    d="M40 96V56a16 16 0 0 1 16-16h40M216 96V56a16 16 0 0 0-16-16h-40M40 160v40a16 16 0 0 0 16 16h40M216 160v40a16 16 0 0 1-16 16h-40"
                    stroke="currentColor"
                    stroke-width="16"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>
            </svg>
        `;
    }
}
audio.addEventListener("timeupdate", () => {

    updateLyrics();

    const current =
        audio.currentTime || 0;

    const duration =
        audio.duration || 0;

    document.getElementById("lyricsCurrentTime")
        .textContent = formatTime(current);

    document.getElementById("lyricsDuration")
        .textContent = formatTime(duration);

    const percent =
        duration
            ? (current / duration) * 100
            : 0;

    document.getElementById("lyricsProgressFill")
        .style.width = `${percent}%`;
});
async function requestFSXNotifications() {
    if (!("Notification" in window)) return false;

    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;

    return (
        await Notification.requestPermission()
    ) === "granted";
}

function fsxNotify(title, options = {}) {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    new Notification(title, {
        icon: "/static/default.jpg",
        badge: "/static/default.jpg",
        tag: "fsx",
        ...options
    });
}
const miniCover = document.getElementById("miniCover");

miniCover.addEventListener("error", () => {
    miniCover.classList.add("image-error");
});

miniCover.addEventListener("load", () => {
    miniCover.classList.remove("image-error");
});