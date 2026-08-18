document.addEventListener("DOMContentLoaded", () => {
    const playBtn = document.getElementById("play-btn");

    if (playBtn) {
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
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const publishBtn = document.getElementById("publish-btn");
    if (!publishBtn) return;

    publishBtn.addEventListener("click", async () => {
        const title = document.getElementById("post-title").value.trim();
        const content = document.getElementById("post-content").value.trim();
        const statusMsg = document.getElementById("status-msg");

        if (!title || !content) {
            statusMsg.style.color = "red";
            statusMsg.textContent = "Error: Fill out both title and content!";
            return;
        }

        const token = prompt("Enter your GitHub Personal Access Token:");
        if (!token) return;

        statusMsg.style.color = "var(--purple)";
        statusMsg.textContent = "Publishing to GitHub...";

        const owner = "SugarHyou";
        const repo = "sugarhyperdose-v2";
        const path = "public/admin.json";
        const branch = "main";

        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/public/${path}`;

        try {
            let posts = [];
            let sha = null;

            const getRes = await fetch(apiUrl, {
                headers: { "Authorization": `token ${token}` }
            });

            if (getRes.ok) {
                const fileData = await getRes.json();
                sha = fileData.sha;
                const decodedContent = decodeURIComponent(escape(atob(fileData.content)));
                posts = JSON.parse(decodedContent);
            }

            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' – ' + 
                            now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            const newPost = {
                title: title,
                date: dateStr,
                content: content
            };

            posts.unshift(newPost);

            const updatedContent = btoa(unescape(encodeURIComponent(JSON.stringify(posts, null, 2))));

            const putRes = await fetch(apiUrl, {
                method: "PUT",
                headers: {
                    "Authorization": `token ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: `New blog post: ${title}`,
                    content: updatedContent,
                    sha: sha,
                    branch: branch
                })
            });

            if (putRes.ok) {
                statusMsg.style.color = "limegreen";
                statusMsg.textContent = "Success! Post published live!";
                document.getElementById("post-title").value = "";
                document.getElementById("post-content").value = "";
            } else {
                const errData = await putRes.json();
                throw new Error(errData.message || "Failed to push to GitHub");
            }

        } catch (err) {
            statusMsg.style.color = "red";
            statusMsg.textContent = "Error: " + err.message;
        }
    });
});