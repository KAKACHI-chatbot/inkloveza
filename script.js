const startDate = new Date(2025, 7, 15, 0, 0, 0);

function pulseSeconds() {
    const el = document.getElementById('seconds');
    if (!el) return;
    el.classList.remove('tick-pulse');
    void el.offsetWidth; // reflow to restart the animation every tick
    el.classList.add('tick-pulse');
}

function updateCounter() {
    const now = new Date();
    const diff = now - startDate;

    if (diff < 0) {
        document.getElementById('days').innerText = '0';
        document.getElementById('hours').innerText = '00';
        document.getElementById('minutes').innerText = '00';
        document.getElementById('seconds').innerText = '00';
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    document.getElementById('days').innerText = days;
    document.getElementById('hours').innerText = String(hours).padStart(2, '0');
    document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
    document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
    pulseSeconds();
}

setInterval(updateCounter, 1000);
updateCounter();

// ==================== เพลงพื้นหลังจาก YouTube ====================
// วิธีใส่เพลง: เอา Video ID จากลิงก์ YouTube มาใส่ตรงนี้
// เช่น https://www.youtube.com/watch?v=dQw4w9WgXcQ  -> ID คือ "dQw4w9WgXcQ"
// หรือ https://youtu.be/dQw4w9WgXcQ                  -> ID คือ "dQw4w9WgXcQ" เช่นกัน
const YT_VIDEO_ID = "LXIEBWnqiBA";

let ytPlayer = null;
let ytIsReady = false;
let ytWantsToPlay = false; // true เมื่อผู้ใช้ปลดล็อกซองแล้ว (ถือว่ามี user gesture)
let ytMuted = false;

function extractYouTubeId(url) {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : url; // ถ้า string ที่ให้มาเป็น ID อยู่แล้ว ก็ใช้ได้ตรงๆ
}

function loadYouTubeAPI() {
    if (window.YT && window.YT.Player) {
        createYTPlayer();
        return;
    }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = createYTPlayer;
}

function createYTPlayer() {
    const videoId = extractYouTubeId(YT_VIDEO_ID);
    if (!videoId) return;

    ytPlayer = new YT.Player('yt-player', {
        height: '1',
        width: '1',
        videoId: videoId,
        playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
            loop: 1,
            playlist: videoId // จำเป็นสำหรับให้ loop:1 ทำงานกับวิดีโอเดี่ยว
        },
        events: {
            onReady: () => {
                ytIsReady = true;
                const musicBtn = document.getElementById('musicToggleBtn');
                if (musicBtn) musicBtn.style.display = 'flex';
                // ถ้าผู้ใช้ปลดล็อกซองไปแล้วก่อนที่ player จะโหลดเสร็จ ให้เล่นทันที
                if (ytWantsToPlay) tryPlayMusic();
            },
            onError: () => {
                // เล่นไม่ได้ (เช่น วิดีโอถูกจำกัดการฝัง) - ซ่อนปุ่มไปเลย
                const musicBtn = document.getElementById('musicToggleBtn');
                if (musicBtn) musicBtn.style.display = 'none';
            }
        }
    });
}

function tryPlayMusic() {
    if (!ytPlayer || !ytIsReady) return;
    try {
        ytPlayer.playVideo();
        const musicBtn = document.getElementById('musicToggleBtn');
        if (musicBtn) musicBtn.textContent = '🔊';
    } catch (err) {
        // เบราว์เซอร์บล็อก autoplay เสียง - ให้ผู้ใช้กดปุ่มลำโพงเองแทน
    }
}

const musicToggleBtn = document.getElementById('musicToggleBtn');
if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', () => {
        if (!ytPlayer || !ytIsReady) return;
        const state = ytPlayer.getPlayerState();
        // 1 = playing
        if (state === 1 && !ytMuted) {
            ytPlayer.mute();
            ytMuted = true;
            musicToggleBtn.textContent = '🔇';
        } else if (ytMuted) {
            ytPlayer.unMute();
            ytMuted = false;
            musicToggleBtn.textContent = '🔊';
        } else {
            ytPlayer.playVideo();
            musicToggleBtn.textContent = '🔊';
        }
    });
}

loadYouTubeAPI();

// ==================== ระบบกดค้างที่หน้า 1 ====================
const holdBtn = document.getElementById('holdBtn');
const holdContainer = document.getElementById('holdContainer');
const heartProgress = document.getElementById('heartProgress');
const hintText = document.getElementById('hintText');
const envelopeOverlay = document.getElementById('envelopeOverlay');
const envelopeCard = document.querySelector('.envelope');
const canvasContainer = document.getElementById('canvas-container');

let pathLength = 0;
if (heartProgress) {
    pathLength = heartProgress.getTotalLength();
    heartProgress.style.strokeDasharray = pathLength;
    heartProgress.style.strokeDashoffset = pathLength;
}

let holdTimer = null;
let holdProgressVal = 0;
const holdDuration = 1500;
const updateInterval = 20;

function setProgress(percent) {
    if (!heartProgress) return;
    const offset = pathLength - (percent / 100 * pathLength);
    heartProgress.style.strokeDashoffset = offset;
}

function startHold(e) {
    e.preventDefault();
    if (holdContainer) holdContainer.classList.add('holding');
    if (hintText) {
        hintText.innerText = "กำลังปลดล็อก...";
        hintText.style.color = "#ff007f";
    }

    holdTimer = setInterval(() => {
        holdProgressVal += (updateInterval / holdDuration) * 100;
        setProgress(holdProgressVal);

        if (holdProgressVal >= 70 && envelopeCard) {
            envelopeCard.classList.add('urgent');
        }

        if (holdProgressVal >= 100) {
            completeHold();
        }
    }, updateInterval);
}

function endHold() {
    if (holdProgressVal < 100) {
        clearInterval(holdTimer);
        holdProgressVal = 0;
        setProgress(0);
        if (holdContainer) holdContainer.classList.remove('holding');
        if (envelopeCard) envelopeCard.classList.remove('urgent');
        if (hintText) {
            hintText.innerText = "กดค้างไว้เพื่อเปิด ✨";
            hintText.style.color = "#00f0ff";
        }
    }
}

function completeHold() {
    clearInterval(holdTimer);
    if (holdContainer) holdContainer.classList.remove('holding');
    if (envelopeCard) envelopeCard.classList.remove('urgent');
    if (hintText) hintText.innerText = "สำเร็จ!";

    ytWantsToPlay = true;
    tryPlayMusic();

    setTimeout(() => {
        if (envelopeOverlay) envelopeOverlay.classList.add('hide');
        if (canvasContainer) canvasContainer.classList.add('show');
        spawnAmbientHearts();
        init3DScene();
    }, 200);
}

if (holdBtn) {
    holdBtn.addEventListener('mousedown', startHold);
    holdBtn.addEventListener('mouseup', endHold);
    holdBtn.addEventListener('mouseleave', endHold);
    holdBtn.addEventListener('touchstart', startHold, { passive: false });
    holdBtn.addEventListener('touchend', endHold);
    holdBtn.addEventListener('touchcancel', endHold);
}

// ==================== ลูกเล่นเสริม: หัวใจลอยพื้นหลัง ====================
function spawnAmbientHearts() {
    if (!canvasContainer || canvasContainer.querySelector('.ambient-hearts')) return;
    const wrap = document.createElement('div');
    wrap.className = 'ambient-hearts';
    const glyphs = ['💗', '✨', '💕', '🌟'];
    const count = 16;
    for (let i = 0; i < count; i++) {
        const span = document.createElement('span');
        span.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
        const left = Math.random() * 100;
        const duration = 9 + Math.random() * 10;
        const delay = Math.random() * duration;
        const size = 0.8 + Math.random() * 0.9;
        span.style.left = left + '%';
        span.style.animationDuration = duration + 's';
        span.style.animationDelay = '-' + delay + 's';
        span.style.fontSize = size + 'rem';
        wrap.appendChild(span);
    }
    canvasContainer.appendChild(wrap);
}

// ==================== ลูกเล่นเสริม: ประกายตามเมาส์ ====================
let lastSparkTime = 0;
function maybeSpawnSpark(x, y) {
    const now = Date.now();
    if (now - lastSparkTime < 90) return;
    lastSparkTime = now;
    const glyphs = ['💗', '✨', '♥'];
    const el = document.createElement('span');
    el.className = 'cursor-spark';
    el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
}
window.addEventListener('pointermove', (e) => {
    if (canvasContainer && canvasContainer.classList.contains('show')) {
        maybeSpawnSpark(e.clientX, e.clientY);
    }
}, { passive: true });

// ==================== ลูกเล่นเสริม: ปุ่มกดมีคลื่นกระเพื่อม ====================
function attachRipple(btn) {
    btn.addEventListener('pointerdown', (e) => {
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 1.3;
        const span = document.createElement('span');
        span.className = 'ripple';
        span.style.width = span.style.height = size + 'px';
        span.style.left = (e.clientX - rect.left - size / 2) + 'px';
        span.style.top = (e.clientY - rect.top - size / 2) + 'px';
        btn.appendChild(span);
        span.addEventListener('animationend', () => span.remove());
    }, { passive: true });
}
document.querySelectorAll('.btn-love, .close-btn').forEach(attachRipple);

// ==================== ลูกเล่นเสริม: หัวใจระเบิดตอนเปิดผลลัพธ์ ====================
function spawnHeartBurst(anchorEl) {
    const wrap = document.createElement('div');
    wrap.className = 'heart-burst-wrap';
    const rect = anchorEl ? anchorEl.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
    wrap.style.left = (rect.left + rect.width / 2) + 'px';
    wrap.style.top = (rect.top + rect.height / 2) + 'px';
    const glyphs = ['💖', '💗', '✨', '💕'];
    const count = 14;
    for (let i = 0; i < count; i++) {
        const span = document.createElement('span');
        span.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
        const dist = 60 + Math.random() * 70;
        span.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
        span.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
        span.style.animationDelay = (Math.random() * 0.1) + 's';
        wrap.appendChild(span);
    }
    document.body.appendChild(wrap);
    setTimeout(() => wrap.remove(), 1100);
}

// ==================== ระบบเปิด-ปิดการ์ดป๊อบอัพ ====================
const openCardBtn = document.getElementById('openCardBtn');
const openTarotBtn = document.getElementById('openTarotBtn');
const closeCardBtn = document.getElementById('closeCardBtn');
const closeTarotBtn = document.getElementById('closeTarotBtn');
const closeResultBtn = document.getElementById('closeResultBtn');

const card = document.getElementById('card');
const tarotModal = document.getElementById('tarotModal');
const resultModal = document.getElementById('resultModal');
const actionBtnGroup = document.querySelector('.action-btn-group');

// เมื่อป๊อบอัพเปิดอยู่ ให้ฉาก 3D "หยุดคำนวณ" อนุภาคที่มองไม่เห็น (ยังหมุนกล้อง/กาแล็กซี่เบาๆ ได้)
// เพื่อลดภาระ GPU ตอน backdrop-filter blur ทำงานหนักอยู่แล้ว
let anyModalOpen = false;
function refreshModalState() {
    anyModalOpen = !!(
        (card && card.classList.contains('show')) ||
        (tarotModal && tarotModal.classList.contains('show')) ||
        (resultModal && resultModal.classList.contains('show'))
    );
}

if (openCardBtn) {
    openCardBtn.addEventListener('click', () => {
        if (card) card.classList.add('show');
        if (actionBtnGroup) actionBtnGroup.style.display = 'none';
        refreshModalState();
    });
}

if (closeCardBtn) {
    closeCardBtn.addEventListener('click', () => {
        if (card) card.classList.remove('show');
        if (actionBtnGroup) actionBtnGroup.style.display = 'flex';
        refreshModalState();
    });
}

if (openTarotBtn) {
    openTarotBtn.addEventListener('click', () => {
        if (tarotModal) tarotModal.classList.add('show');
        if (actionBtnGroup) actionBtnGroup.style.display = 'none';
        refreshModalState();
    });
}

if (closeTarotBtn) {
    closeTarotBtn.addEventListener('click', () => {
        if (tarotModal) tarotModal.classList.remove('show');
        if (actionBtnGroup) actionBtnGroup.style.display = 'flex';
        refreshModalState();
    });
}

const tarotCards = document.querySelectorAll('.tarot-card');
const resultTitle = document.getElementById('resultTitle');
const resultDesc = document.getElementById('resultDesc');

tarotCards.forEach(c => {
    c.addEventListener('click', () => {
        if (c.classList.contains('flipped')) return;
        c.classList.add('flipped');

        const title = c.getAttribute('data-title');
        const desc = c.getAttribute('data-desc');
        if (resultTitle) resultTitle.innerText = title;
        if (resultDesc) resultDesc.innerText = desc;

        setTimeout(() => {
            if (tarotModal) tarotModal.classList.remove('show');
            setTimeout(() => {
                if (resultModal) {
                    resultModal.classList.add('show');
                    spawnHeartBurst(resultModal);
                }
                c.classList.remove('flipped');
                refreshModalState();
            }, 200);
        }, 480);
    });
});

if (closeResultBtn) {
    closeResultBtn.addEventListener('click', () => {
        if (resultModal) resultModal.classList.remove('show');
        if (actionBtnGroup) actionBtnGroup.style.display = 'flex';
        refreshModalState();
    });
}

// ==================== ระบบเรนเดอร์ฉาก 3D (ปรับให้ลื่นขึ้น) ====================
function init3DScene() {
    // --- ตรวจสเปคเครื่องคร่าวๆ เพื่อปรับความละเอียดอนุภาคอัตโนมัติ ---
    const cores = navigator.hardwareConcurrency || 4;
    const isNarrow = window.innerWidth <= 768;
    const isLowPower = isNarrow || cores <= 4;

    const heartParticlesCount = isLowPower ? 3200 : 6500;
    const galaxyCount = isLowPower ? 4200 : 8500;
    const starsCount = isLowPower ? 1200 : 2500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 7, 20);

    const renderer = new THREE.WebGLRenderer({
        antialias: !isLowPower,
        alpha: true,
        powerPreference: 'high-performance'
    });
    // จำกัด pixel ratio ไว้ที่ 2 (จอ retina/มือถือบางรุ่นสูงถึง 3-4 ซึ่งหนักเกินจำเป็น)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isLowPower ? 1.5 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (canvasContainer) canvasContainer.insertBefore(renderer.domElement, canvasContainer.firstChild);

    const centerLight = new THREE.PointLight(0xff007f, 2, 50);
    centerLight.position.set(0, 3, 0);
    scene.add(centerLight);

    const starsGeometry = new THREE.BufferGeometry();
    const starsPositions = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i++) {
        starsPositions[i] = (Math.random() - 0.5) * 140;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
    const starField = new THREE.Points(starsGeometry, new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, transparent: true, opacity: 0.5 }));
    scene.add(starField);

    const heartGeometry = new THREE.BufferGeometry();
    const currentPositions = new Float32Array(heartParticlesCount * 3);
    const targetPositions = new Float32Array(heartParticlesCount * 3);
    const burstVelocities = new Float32Array(heartParticlesCount * 3);

    for (let i = 0; i < heartParticlesCount; i++) {
        const idx = i * 3;

        const t = Math.random() * Math.PI * 2;
        let x = 16 * Math.pow(Math.sin(t), 3);
        let y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
        let z = (Math.random() - 0.5) * 5;

        const scale = 0.35 + (Math.random() - 0.5) * 0.05;
        targetPositions[idx] = x * scale;
        targetPositions[idx + 1] = (y * scale) + 4.5;
        targetPositions[idx + 2] = z * scale;

        currentPositions[idx] = (Math.random() - 0.5) * 0.5;
        currentPositions[idx + 1] = 2 + (Math.random() - 0.5) * 0.5;
        currentPositions[idx + 2] = (Math.random() - 0.5) * 0.5;

        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = Math.cbrt(Math.random()) * 22;

        burstVelocities[idx] = r * Math.sin(phi) * Math.cos(theta);
        burstVelocities[idx + 1] = r * Math.sin(phi) * Math.sin(theta) + 2;
        burstVelocities[idx + 2] = r * Math.cos(phi);
    }

    heartGeometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));
    heartGeometry.attributes.position.setUsage(THREE.DynamicDrawUsage);

    // ไล่สีอนุภาคหัวใจ: โทนชมพูเข้มด้านล่าง ไล่ไปขาวอมชมพูด้านบน เหมือนภาพต้นแบบ
    let heartMinY = Infinity, heartMaxY = -Infinity;
    for (let i = 0; i < heartParticlesCount; i++) {
        const y = targetPositions[i * 3 + 1];
        if (y < heartMinY) heartMinY = y;
        if (y > heartMaxY) heartMaxY = y;
    }
    const heartRangeY = (heartMaxY - heartMinY) || 1;
    const heartColors = new Float32Array(heartParticlesCount * 3);
    const heartColorBase = new THREE.Color(0xff1f8a);
    const heartColorTip = new THREE.Color(0xffeaf6);
    for (let i = 0; i < heartParticlesCount; i++) {
        const idx = i * 3;
        const t = (targetPositions[idx + 1] - heartMinY) / heartRangeY;
        const mixed = heartColorBase.clone().lerp(heartColorTip, Math.pow(Math.max(0, Math.min(1, t)), 1.3));
        heartColors[idx] = mixed.r;
        heartColors[idx + 1] = mixed.g;
        heartColors[idx + 2] = mixed.b;
    }
    heartGeometry.setAttribute('color', new THREE.BufferAttribute(heartColors, 3));

    const heartMaterial = new THREE.PointsMaterial({
        size: 0.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending
    });
    const heartParticles = new THREE.Points(heartGeometry, heartMaterial);
    scene.add(heartParticles);

    const galaxyGeometry = new THREE.BufferGeometry();
    const galaxyPositions = new Float32Array(galaxyCount * 3);
    const galaxyColors = new Float32Array(galaxyCount * 3);
    const color1 = new THREE.Color(0xff007f);
    const color2 = new THREE.Color(0x00f0ff);

    for (let i = 0; i < galaxyCount; i++) {
        const r = Math.random() * 14 + 1.2;
        const spinAngle = r * 1.3;
        const branchAngle = ((i % 3) * 2 * Math.PI) / 3;

        galaxyPositions[i * 3] = Math.cos(branchAngle + spinAngle) * r + (Math.random() - 0.5) * 1.5;
        galaxyPositions[i * 3 + 1] = (Math.random() - 0.5) * 0.8 - 1.8;
        galaxyPositions[i * 3 + 2] = Math.sin(branchAngle + spinAngle) * r + (Math.random() - 0.5) * 1.5;

        const mixedColor = color1.clone().lerp(color2, r / 14);
        galaxyColors[i * 3] = mixedColor.r;
        galaxyColors[i * 3 + 1] = mixedColor.g;
        galaxyColors[i * 3 + 2] = mixedColor.b;
    }

    galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(galaxyPositions, 3));
    galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(galaxyColors, 3));
    const galaxyParticles = new THREE.Points(galaxyGeometry, new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    }));
    scene.add(galaxyParticles);

    // --- ดาวเคราะห์เรืองแสงพร้อมวงแหวน ตรงกลางกาแล็กซี่ (เหมือนภาพต้นแบบ) ---
    function createPlanet() {
        const group = new THREE.Group();

        const bodyCanvas = document.createElement('canvas');
        bodyCanvas.width = 256; bodyCanvas.height = 256;
        const bctx = bodyCanvas.getContext('2d');
        const bodyGrad = bctx.createRadialGradient(96, 88, 8, 128, 128, 150);
        bodyGrad.addColorStop(0, '#fff3fb');
        bodyGrad.addColorStop(0.45, '#ff9fd9');
        bodyGrad.addColorStop(1, '#7a1258');
        bctx.fillStyle = bodyGrad;
        bctx.fillRect(0, 0, 256, 256);
        const bodyTexture = new THREE.CanvasTexture(bodyCanvas);

        const bodyGeo = new THREE.SphereGeometry(1.5, 32, 32);
        const bodyMat = new THREE.MeshBasicMaterial({ map: bodyTexture });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        group.add(body);

        const ringGeo = new THREE.RingGeometry(2.1, 3.6, 64);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xffb3e6,
            transparent: true,
            opacity: 0.35,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2 - 0.32;
        group.add(ringMesh);

        const glowLight = new THREE.PointLight(0xff8fd0, 3, 18);
        group.add(glowLight);

        group.position.set(0, -1.8, 0);
        return group;
    }
    const planet = createPlanet();
    scene.add(planet);

    const ringGroup = new THREE.Group();
    scene.add(ringGroup);

    function createCatTexture() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 256; canvas.height = 256;

        ctx.fillStyle = 'rgba(255, 0, 127, 0.4)';
        ctx.beginPath(); ctx.arc(128, 128, 100, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(128, 135, 65, 0, Math.PI * 2); ctx.fill();

        ctx.beginPath(); ctx.moveTo(70, 95); ctx.lineTo(85, 45); ctx.lineTo(110, 80); ctx.fill();
        ctx.beginPath(); ctx.moveTo(186, 95); ctx.lineTo(171, 45); ctx.lineTo(146, 80); ctx.fill();

        ctx.fillStyle = '#ff758f';
        ctx.beginPath(); ctx.moveTo(76, 90); ctx.lineTo(86, 55); ctx.lineTo(104, 80); ctx.fill();
        ctx.beginPath(); ctx.moveTo(180, 90); ctx.lineTo(170, 55); ctx.lineTo(152, 80); ctx.fill();

        ctx.strokeStyle = '#333333'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(100, 130, 12, 0.2, Math.PI - 0.2); ctx.stroke();
        ctx.beginPath(); ctx.arc(156, 130, 12, 0.2, Math.PI - 0.2); ctx.stroke();

        ctx.fillStyle = '#ff8fa3';
        ctx.beginPath(); ctx.arc(85, 145, 12, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(171, 145, 12, 0, Math.PI * 2); ctx.fill();

        return new THREE.CanvasTexture(canvas);
    }

    // แมวลอยอยู่สูงขึ้น ใกล้ฐานหัวใจ แทนที่จะอยู่ระดับวงแหวนล่างสุด
    const catTexture = createCatTexture();
    const catCount = 3;
    for (let i = 0; i < catCount; i++) {
        const spriteMat = new THREE.SpriteMaterial({ map: catTexture, transparent: true });
        const catSprite = new THREE.Sprite(spriteMat);
        const angle = (i / catCount) * Math.PI * 2 + 0.5;
        catSprite.position.set(Math.cos(angle) * 7.5, 0.8, Math.sin(angle) * 7.5);
        catSprite.scale.set(1.7, 1.7, 1);
        ringGroup.add(catSprite);
    }

    // ป้ายข้อความหลากหลายรอบวง เหมือนภาพต้นแบบ (แทนคำเดิม "LOVE U" ซ้ำ)
    const labels = [
        "FOREVER", "ALWAYS U", "ANNIVERSARY", "ONLY U",
        "MY HEART", "LOVE U THE MOST", "OUR LOVE",
        "HAPPY ANNIVERSARY", "LOVE U"
    ];
    labels.forEach((text, index) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 512; canvas.height = 128;
        ctx.font = 'Bold 30px Prompt, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ff007f';
        ctx.shadowBlur = 16;
        ctx.textAlign = 'center';
        ctx.fillText(text, 256, 70);

        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true }));
        const angle = (index / labels.length) * Math.PI * 2;
        sprite.position.set(Math.cos(angle) * 10.5, -0.8, Math.sin(angle) * 10.5);
        sprite.scale.set(4.4, 1.1, 1);
        ringGroup.add(sprite);
    });

    // --- พลุ: จำกัดจำนวนพลุพร้อมกันสูงสุด กันสแปมคลิกจนหนักเครื่อง ---
    const fireworks = [];
    const MAX_FIREWORKS = isLowPower ? 4 : 8;
    let lastFireworkTime = 0;

    function createFirework(x, y) {
        const now = performance.now();
        if (now - lastFireworkTime < 60) return; // กันสแปมเร็วเกินไป
        if (fireworks.length >= MAX_FIREWORKS) return;
        lastFireworkTime = now;

        const pCount = isLowPower ? 45 : 80;
        const pGeo = new THREE.BufferGeometry();
        const pPos = new Float32Array(pCount * 3);
        const pVelo = [];

        const vector = new THREE.Vector3((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1, 0.5);
        vector.unproject(camera);
        const dir = vector.sub(camera.position).normalize();
        const pos = camera.position.clone().add(dir.multiplyScalar(-camera.position.z / dir.z));

        for (let i = 0; i < pCount; i++) {
            pPos[i * 3] = pos.x; pPos[i * 3 + 1] = pos.y; pPos[i * 3 + 2] = pos.z;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const speed = 0.15 + Math.random() * 0.15;
            pVelo.push({ x: Math.sin(phi) * Math.cos(theta) * speed, y: Math.sin(phi) * Math.sin(theta) * speed, z: Math.cos(phi) * speed });
        }

        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        pGeo.attributes.position.setUsage(THREE.DynamicDrawUsage);
        const firework = new THREE.Points(pGeo, new THREE.PointsMaterial({
            color: Math.random() > 0.5 ? 0x00f0ff : 0xff007f,
            size: 0.22,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending
        }));
        scene.add(firework);
        fireworks.push({ mesh: firework, velo: pVelo, life: 1.0 });
    }

    window.addEventListener('pointerdown', (e) => {
        if (canvasContainer && canvasContainer.classList.contains('show') && !anyModalOpen) {
            createFirework(e.clientX, e.clientY);
        }
    }, { passive: true });

    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2) * 0.0008;
        mouseY = (e.clientY - window.innerHeight / 2) * 0.0008;
    }, { passive: true });

    const clock = new THREE.Clock();
    // อ้างอิงต่อ 60fps เป็นฐาน เพื่อให้ lerp/rotation คงที่ไม่ว่าเฟรมเรตจริงจะเป็นเท่าไร
    const REFERENCE_FPS = 60;

    let rafId = null;
    let isRunning = true;

    function animate() {
        if (!isRunning) return;
        rafId = requestAnimationFrame(animate);

        const rawDelta = clock.getDelta();
        // กันเฟรมกระโดดตอนสลับแท็บกลับมา (คลิปไว้ไม่เกิน ~3 เฟรม)
        const delta = Math.min(rawDelta, 3 / REFERENCE_FPS);
        const frameScale = delta * REFERENCE_FPS; // 1.0 ที่ 60fps พอดี

        const elapsedTime = clock.elapsedTime;
        const positions = heartGeometry.attributes.position.array;

        if (elapsedTime < 1.8) {
            const burstSpeed = 1 - Math.pow(1 - 0.08, frameScale);
            centerLight.intensity = 10;
            for (let i = 0; i < heartParticlesCount; i++) {
                const idx = i * 3;
                positions[idx] += (burstVelocities[idx] - positions[idx]) * burstSpeed;
                positions[idx + 1] += (burstVelocities[idx + 1] - positions[idx + 1]) * burstSpeed;
                positions[idx + 2] += (burstVelocities[idx + 2] - positions[idx + 2]) * burstSpeed;
            }
        } else {
            const formSpeed = 1 - Math.pow(1 - 0.035, frameScale);
            centerLight.intensity = 4 + Math.sin(elapsedTime * 3) * 2;
            for (let i = 0; i < heartParticlesCount; i++) {
                const idx = i * 3;
                positions[idx] += (targetPositions[idx] - positions[idx]) * formSpeed;
                positions[idx + 1] += (targetPositions[idx + 1] - positions[idx + 1]) * formSpeed;
                positions[idx + 2] += (targetPositions[idx + 2] - positions[idx + 2]) * formSpeed;
            }
            const pulse = 1 + Math.sin(elapsedTime * 3) * 0.05;
            heartParticles.scale.set(pulse, pulse, pulse);
        }

        heartGeometry.attributes.position.needsUpdate = true;

        for (let i = fireworks.length - 1; i >= 0; i--) {
            const fw = fireworks[i];
            const fwPos = fw.mesh.geometry.attributes.position.array;
            fw.life -= 0.02 * frameScale;
            fw.mesh.material.opacity = Math.max(fw.life, 0);
            for (let j = 0; j < fwPos.length / 3; j++) {
                fwPos[j * 3] += fw.velo[j].x * frameScale;
                fwPos[j * 3 + 1] += fw.velo[j].y * frameScale;
                fwPos[j * 3 + 2] += fw.velo[j].z * frameScale;
            }
            fw.mesh.geometry.attributes.position.needsUpdate = true;
            if (fw.life <= 0) {
                scene.remove(fw.mesh);
                fw.mesh.geometry.dispose();
                fw.mesh.material.dispose();
                fireworks.splice(i, 1);
            }
        }

        heartParticles.rotation.y += 0.004 * frameScale;
        galaxyParticles.rotation.y += 0.002 * frameScale;
        ringGroup.rotation.y += 0.0025 * frameScale;
        planet.rotation.y += 0.006 * frameScale;

        targetX += (mouseX - targetX) * Math.min(0.05 * frameScale, 1);
        targetY += (mouseY - targetY) * Math.min(0.05 * frameScale, 1);
        camera.position.x = Math.sin(targetX) * 20;
        camera.position.z = Math.cos(targetX) * 20;
        camera.position.y = 7 + targetY * 8;
        camera.lookAt(0, 2, 0);

        renderer.render(scene, camera);
    }

    animate();

    // หยุดเรนเดอร์ตอนสลับแท็บ/มินิไมซ์ เพื่อไม่ให้กินแบตและ CPU/GPU เปล่าๆ
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            isRunning = false;
            if (rafId) cancelAnimationFrame(rafId);
        } else {
            if (!isRunning) {
                isRunning = true;
                clock.getDelta(); // เคลียร์เวลาที่ค้างไว้ตอนซ่อนอยู่ ไม่ให้กระโดด
                animate();
            }
        }
    });

    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }, 120);
    });
}