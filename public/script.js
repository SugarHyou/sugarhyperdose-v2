document.addEventListener("DOMContentLoaded", () => {
    const playlist = [
        {
            title: "Chiwawa",
            artist: "Wanko Ni Mero Mero",
            src: "assets/audio/music/Chiwawa.mp3"
        },
        {
            title: "edgy",
            artist: "luvwillow",
            src: "assets/audio/music/edgy.mp3"
        },
        {
            title: "ELECTRIC WEEKEND ZONE",
            artist: "FLAVOR FOLEY",
            src: "assets/audio/music/ELECTRIC WEEKEND ZONE.mp3"
        },
        {
            title: "INTERNET ANGEL",
            artist: "Aiobahn +81 and NEEDY GIRL OVERDOSE",
            src: "assets/audio/music/INTERNET ANGEL.mp3"
        },
        {
            title: "Let's Go Gambling!",
            artist: "FEM&M",
            src: "assets/audio/music/Let's Go Gambling!.mp3"
        },
        {
            title: "混沌ブギ 初音ミク",
            artist: "Jon -YAKITORI",
            src: "assets/audio/music/混沌ブギ 初音ミク.mp3"
        },
    ];

    let currentTrackIndex = 0;
    let isPlaying = false;
    let isLooping = false;
    let isShuffling = false;

    const audio = new Audio();
    
    const playBtn = document.getElementById("play-btn");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const loopBtn = document.getElementById("loop-btn");
    const shuffleBtn = document.getElementById("shuffle-btn");
    const trackTitle = document.getElementById("track-title");
    const trackArtist = document.getElementById("track-artist");
    const progressBar = document.getElementById("progress-bar");

    function loadTrack(index) {
        const track = playlist[index];
        audio.src = track.src;
        trackTitle.textContent = track.title;
        trackArtist.textContent = track.artist;
        audio.load();
    }

    function togglePlay() {
        if (isPlaying) {
            audio.pause();
            playBtn.textContent = "▶";
            isPlaying = false;
        } else {
            audio.play().catch(e => console.log("Playback blocked:", e));
            playBtn.textContent = "⏸";
            isPlaying = true;
        }
    }

    function nextTrack() {
        if (isShuffling) {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * playlist.length);
            } while (randomIndex === currentTrackIndex && playlist.length > 1);
            currentTrackIndex = randomIndex;
        } else {
            currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        }
        loadTrack(currentTrackIndex);
        if (isPlaying) audio.play();
    }

    function prevTrack() {
        currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        loadTrack(currentTrackIndex);
        if (isPlaying) audio.play();
    }

    playBtn.addEventListener("click", togglePlay);
    nextBtn.addEventListener("click", nextTrack);
    prevBtn.addEventListener("click", prevTrack);

    loopBtn.addEventListener("click", () => {
        isLooping = !isLooping;
        audio.loop = isLooping;
        loopBtn.classList.toggle("active", isLooping);
    });

    shuffleBtn.addEventListener("click", () => {
        isShuffling = !isShuffling;
        shuffleBtn.classList.toggle("active", isShuffling);
    });

    audio.addEventListener("timeupdate", () => {
        if (audio.duration) {
            progressBar.value = (audio.currentTime / audio.duration) * 100;
        }
    });

    progressBar.addEventListener("input", (e) => {
        if (audio.duration) {
            audio.currentTime = (e.target.value / 100) * audio.duration;
        }
    });

    audio.addEventListener("ended", () => {
        if (!isLooping) {
            nextTrack();
        }
    });

    loadTrack(currentTrackIndex);
});