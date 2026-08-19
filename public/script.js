document.addEventListener("DOMContentLoaded", () => {
    const playBtn = document.getElementById("play-btn");

    if (playBtn) {
        const playlist = [
            { title: "Chiwawa", artist: "Wanko Ni Mero Mero", src: "assets/audio/music/Chiwawa.mp3" },
            { title: "edgy", artist: "luvwillow", src: "assets/audio/music/edgy.mp3" },
            { title: "ELECTRIC WEEKEND ZONE", artist: "FLAVOR FOLEY", src: "assets/audio/music/ELECTRIC WEEKEND ZONE.mp3" },
            { title: "INTERNET ANGEL", artist: "Aiobahn +81 and NEEDY GIRL OVERDOSE", src: "assets/audio/music/INTERNET ANGEL.mp3" },
            { title: "Let's Go Gambling!", artist: "FEM&M", src: "assets/audio/music/Let's Go Gambling!.mp3" },
            { title: "混沌ブギ 初音ミク", artist: "Jon -YAKITORI", src: "assets/audio/music/混沌ブギ 初音ミク.mp3" },
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
    const tabBlogBtn = document.getElementById("tab-blog-btn");
    const tabStatusBtn = document.getElementById("tab-status-btn");
    const tabBlogContent = document.getElementById("tab-blog-content");
    const tabStatusContent = document.getElementById("tab-status-content");

    if (tabBlogBtn && tabStatusBtn) {
        tabBlogBtn.addEventListener("click", () => {
            tabBlogContent.style.display = "block";
            tabStatusContent.style.display = "none";
            tabBlogBtn.classList.add("active");
            tabStatusBtn.classList.remove("active");
        });

        tabStatusBtn.addEventListener("click", () => {
            tabBlogContent.style.display = "none";
            tabStatusContent.style.display = "block";
            tabStatusBtn.classList.add("active");
            tabBlogBtn.classList.remove("active");
        });
    }
});

function getGitHubToken() {
    let token = localStorage.getItem("github_token");
    if (!token) {
        token = prompt("I've Got No Happy Place!");
        if (token) {
            localStorage.setItem("github_token", token.trim());
        }
    }
    return token;
}

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

        const token = getGitHubToken();
        if (!token) return;

        statusMsg.style.color = "var(--purple)";
        statusMsg.textContent = "Publishing to GitHub...";

        const owner = "SugarHyou";
        const repo = "sugarhyperdose-v2";
        const path = "public/admin.json";
        const branch = "main";
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

        try {
            let siteData = { onlineStatus: "ONLINE", posts: [] };
            let sha = null;

            const getRes = await fetch(apiUrl, {
                headers: { "Authorization": `token ${token}` }
            });

            if (getRes.status === 401) {
                localStorage.removeItem("github_token");
                throw new Error("Invalid or expired token. Please try again.");
            }

            if (getRes.ok) {
                const fileData = await getRes.json();
                sha = fileData.sha;
                const decodedContent = decodeURIComponent(escape(atob(fileData.content)));
                const parsed = JSON.parse(decodedContent);
                if (Array.isArray(parsed)) {
                    siteData.posts = parsed;
                } else {
                    siteData = parsed;
                }
            }

            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' – ' + 
                            now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            siteData.posts.unshift({ title, date: dateStr, content });

            const updatedContent = btoa(unescape(encodeURIComponent(JSON.stringify(siteData, null, 2))));

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

document.addEventListener("DOMContentLoaded", () => {
    const saveStatusBtn = document.getElementById("save-status-btn");
    if (!saveStatusBtn) return;

    saveStatusBtn.addEventListener("click", async () => {
        const newStatus = document.getElementById("status-select").value;
        const statusMsg = document.getElementById("status-setting-msg");

        const token = getGitHubToken();
        if (!token) return;

        statusMsg.style.color = "var(--purple)";
        statusMsg.textContent = "Updating status on GitHub...";

        const owner = "SugarHyou";
        const repo = "sugarhyperdose-v2";
        const path = "public/admin.json";
        const branch = "main";
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

        try {
            let siteData = { onlineStatus: "ONLINE", posts: [] };
            let sha = null;

            const getRes = await fetch(apiUrl, {
                headers: { "Authorization": `token ${token}` }
            });

            if (getRes.status === 401) {
                localStorage.removeItem("github_token");
                throw new Error("Invalid or expired token. Please try again.");
            }

            if (getRes.ok) {
                const fileData = await getRes.json();
                sha = fileData.sha;
                const decodedContent = decodeURIComponent(escape(atob(fileData.content)));
                const parsed = JSON.parse(decodedContent);
                if (Array.isArray(parsed)) {
                    siteData.posts = parsed;
                } else {
                    siteData = parsed;
                }
            }

            siteData.onlineStatus = newStatus;

            const updatedContent = btoa(unescape(encodeURIComponent(JSON.stringify(siteData, null, 2))));

            const putRes = await fetch(apiUrl, {
                method: "PUT",
                headers: {
                    "Authorization": `token ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: `Update site status to: ${newStatus}`,
                    content: updatedContent,
                    sha: sha,
                    branch: branch
                })
            });

            if (putRes.ok) {
                statusMsg.style.color = "limegreen";
                statusMsg.textContent = "Success! Status updated live!";
            } else {
                const errData = await putRes.json();
                throw new Error(errData.message || "Failed to update status");
            }
        } catch (err) {
            statusMsg.style.color = "red";
            statusMsg.textContent = "Error: " + err.message;
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const blogFeed = document.getElementById("blog-feed");
    const onlineStatusSpan = document.getElementById("online-status");

    if (!blogFeed && !onlineStatusSpan) return;

    fetch("admin.json")
        .then(response => {
            if (!response.ok) throw new Error("Could not load admin config.");
            return response.json();
        })
        .then(data => {
            let posts = [];
            let status = "ONLINE";

            if (Array.isArray(data)) {
                posts = data;
            } else {
                posts = data.posts || [];
                status = data.onlineStatus || "ONLINE";
            }

            if (onlineStatusSpan) {
                onlineStatusSpan.textContent = `● ${status}`;
                if (status === "ONLINE") {
                    onlineStatusSpan.style.color = "var(--green)";
                } else if (status === "OFFLINE") {
                    onlineStatusSpan.style.color = "red";
                }
            }

            if (blogFeed) {
                blogFeed.innerHTML = "";
                if (posts.length === 0) {
                    blogFeed.innerHTML = "<p style='text-align: center; color: var(--purple);'>No posts yet!</p>";
                    return;
                }

                posts.forEach(post => {
                    const postCard = document.createElement("div");
                    postCard.className = "blog-post";

                    postCard.innerHTML = `
                        <div class="blog-header flex align-center" style="gap: 10px;">
                            <img src="assets/art/Sugar-11-(Jul-25-2026).gif" alt="PFP" style="width: 40px; height: 40px; object-fit: cover; border: 1px solid var(--purple);">
                            <div>
                                <div style="font-weight: bold;">SugarHyperdose</div>
                                <div style="font-size: 10px; color: gray;">${post.date}</div>
                            </div>
                        </div>
                        <div class="blog-title" style="font-weight: bold; margin: 7px 0 2px;">${post.title}</div>
                        <div class="blog-text" style="font-size: 14px;">${post.content}</div>
                    `;
                    blogFeed.appendChild(postCard);
                });
            }
        })
        .catch(err => {
            console.error(err);
            if (blogFeed) blogFeed.innerHTML = "<p style='color: red; text-align: center;'>Failed to load blog feed.</p>";
        });
});