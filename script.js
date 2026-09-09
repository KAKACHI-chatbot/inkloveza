// 📸 ลิงก์รูปภาพคู่ของคุณ (นำรูปคู่ไปวางไว้ในโฟลเดอร์เดียวกับ script.js แล้วตั้งชื่อว่า couple.jpg)
const PHOTO_URL = './couple.jpg';

const startDate = new Date(2025, 7, 15, 0, 0, 0);

function pulseSeconds() {
    const el = document.getElementById('seconds');
    if (!el) return;
    el.classList.remove('tick-pulse');
    void el.offsetWidth;
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
const YT_VIDEO_ID = "LXIEBWnqiBA";

let ytPlayer = null;
let ytIsReady = false;
let ytWantsToPlay = false;
let ytMuted = false;

function extractYouTubeId(url) {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : url;
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
            playlist: videoId
        },
        events: {
            onReady: () => {
                ytIsReady = true;
                const musicBtn = document.getElementById('musicToggleBtn');
                if (musicBtn) musicBtn.style.display = 'flex';
                if (ytWantsToPlay) tryPlayMusic();
            },
            onError: () => {
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
    } catch (err) {}
}

const musicToggleBtn = document.getElementById('musicToggleBtn');
if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', () => {
        if (!ytPlayer || !ytIsReady) return;
        const state = ytPlayer.getPlayerState();
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

// ==================== ระบบกดค้างรูปหัวใจที่หน้า 1 ====================
const holdBtn = document.getElementById('holdBtn');
const holdContainer = document.getElementById('holdContainer');
const hintText = document.getElementById('hintText');
const envelopeOverlay = document.getElementById('envelopeOverlay');
const envelopeCard = document.querySelector('.envelope');
const canvasContainer = document.getElementById('canvas-container');

const gradStop1 = document.getElementById('gradStop1');
const gradStop2 = document.getElementById('gradStop2');
const gradStop3 = document.getElementById('gradStop3');
const gradStop4 = document.getElementById('gradStop4');

let holdTimer = null;
let holdProgressVal = 0;
const holdDuration = 1500;
const updateInterval = 20;

function setHeartFill(percent) {
    const pStr = percent + '%';
    if (gradStop1) gradStop1.setAttribute('offset', pStr);
    if (gradStop2) gradStop2.setAttribute('offset', pStr);
    if (gradStop3) gradStop3.setAttribute('offset', pStr);
    if (gradStop4) gradStop4.setAttribute('offset', pStr);
}

function startHold(e) {
    e.preventDefault();
    if (holdContainer) holdContainer.classList.add('holding');
    if (hintText) {
        hintText.innerText = "กำลังดำดิ่งสู่มหาสมุทรแห่งรัก...";
        hintText.style.color = "#ff6fb0";
    }

    holdTimer = setInterval(() => {
        holdProgressVal += (updateInterval / holdDuration) * 100;
        if (holdProgressVal > 100) holdProgressVal = 100;

        setHeartFill(holdProgressVal);

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
        setHeartFill(0);
        if (holdContainer) holdContainer.classList.remove('holding');
        if (envelopeCard) envelopeCard.classList.remove('urgent');
        if (hintText) {
            hintText.innerText = "กดค้างไว้เพื่อเปิด ✨";
            hintText.style.color = "#35e6ff";
        }
    }
}

function completeHold() {
    clearInterval(holdTimer);
    if (holdContainer) holdContainer.classList.remove('holding');
    if (envelopeCard) envelopeCard.classList.remove('urgent');
    if (hintText) hintText.innerText = "ดำดิ่งสู่โลกใต้น้ำแล้ว!";

    ytWantsToPlay = true;
    tryPlayMusic();

    setTimeout(() => {
        if (envelopeOverlay) envelopeOverlay.classList.add('hide');
        if (canvasContainer) canvasContainer.classList.add('show');
        spawnAmbientBubbles();
        init3DOceanScene();
    }, 250);
}

if (holdBtn) {
    holdBtn.addEventListener('mousedown', startHold);
    holdBtn.addEventListener('mouseup', endHold);
    holdBtn.addEventListener('mouseleave', endHold);
    holdBtn.addEventListener('touchstart', startHold, { passive: false });
    holdBtn.addEventListener('touchend', endHold);
    holdBtn.addEventListener('touchcancel', endHold);
}

// ==================== ฟองอากาศลอยขึ้นใต้น้ำ ====================
function spawnAmbientBubbles() {
    if (!canvasContainer || canvasContainer.querySelector('.ambient-hearts')) return;
    const wrap = document.createElement('div');
    wrap.className = 'ambient-hearts';
    const glyphs = ['🫧', '🫧', ];
    const count = 14;
    for (let i = 0; i < count; i++) {
        const span = document.createElement('span');
        span.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
        const left = Math.random() * 100;
        const duration = 8 + Math.random() * 10;
        const delay = Math.random() * duration;
        const size = 0.8 + Math.random() * 0.8;
        span.style.left = left + '%';
        span.style.animationDuration = duration + 's';
        span.style.animationDelay = '-' + delay + 's';
        span.style.fontSize = size + 'rem';
        wrap.appendChild(span);
    }
    canvasContainer.appendChild(wrap);
}

// ==================== ประกายใต้น้ำตามเมาส์ ====================
let lastSparkTime = 0;
function maybeSpawnSpark(x, y) {
    const now = Date.now();
    if (now - lastSparkTime < 90) return;
    lastSparkTime = now;
    const glyphs = ['🫧', '🫧', ];
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

// ==================== คลื่นกระเพื่อมปุ่มกด ====================
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

// ==================== ระเบิดฟองอากาศหัวใจ ====================
function spawnHeartBurst(anchorEl) {
    const wrap = document.createElement('div');
    wrap.className = 'heart-burst-wrap';
    const rect = anchorEl ? anchorEl.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
    wrap.style.left = (rect.left + rect.width / 2) + 'px';
    wrap.style.top = (rect.top + rect.height / 2) + 'px';
    const glyphs = ['🫧', '🫧', ];
    const count = 12;
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

// ==================== ระบบเรนเดอร์ 3D "GLOWING CORAL HEART REEF" ====================
function init3DOceanScene() {
    const cores = navigator.hardwareConcurrency || 4;
    const isNarrow = window.innerWidth <= 768;
    const isLowPower = isNarrow || cores <= 4;

    const bubbleParticlesCount = isLowPower ? 2000 : 3800;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020718, 0.022);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 35, 30);

    const renderer = new THREE.WebGLRenderer({
        antialias: !isLowPower,
        alpha: true,
        powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isLowPower ? 1.5 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (canvasContainer) canvasContainer.insertBefore(renderer.domElement, canvasContainer.firstChild);

    // ระบบแสงสว่าง
    const oceanLight1 = new THREE.PointLight(0xff3b9d, 0, 40);
    oceanLight1.position.set(0, 4, 3);
    scene.add(oceanLight1);

    const oceanLight2 = new THREE.PointLight(0x00f0ff, 0, 50);
    oceanLight2.position.set(-8, 10, -4);
    scene.add(oceanLight2);

    const ambientLight = new THREE.AmbientLight(0x0d2247, 1.2);
    scene.add(ambientLight);

    // --- 1. ละอองฟองอากาศใต้น้ำ ---
    const bubbleGeo = new THREE.BufferGeometry();
    const bubblePos = new Float32Array(bubbleParticlesCount * 3);
    const bubbleVel = new Float32Array(bubbleParticlesCount);
    const bubbleColors = new Float32Array(bubbleParticlesCount * 3);

    const colorCyan = new THREE.Color(0x35e6ff);
    const colorPink = new THREE.Color(0xff6fb0);

    for (let i = 0; i < bubbleParticlesCount; i++) {
        const idx = i * 3;
        bubblePos[idx] = (Math.random() - 0.5) * 55;
        bubblePos[idx + 1] = (Math.random() - 0.5) * 55;
        bubblePos[idx + 2] = (Math.random() - 0.5) * 55;

        bubbleVel[i] = 0.018 + Math.random() * 0.035;

        const mixedColor = colorCyan.clone().lerp(colorPink, Math.random());
        bubbleColors[idx] = mixedColor.r;
        bubbleColors[idx + 1] = mixedColor.g;
        bubbleColors[idx + 2] = mixedColor.b;
    }

    bubbleGeo.setAttribute('position', new THREE.BufferAttribute(bubblePos, 3));
    bubbleGeo.setAttribute('color', new THREE.BufferAttribute(bubbleColors, 3));
    bubbleGeo.attributes.position.setUsage(THREE.DynamicDrawUsage);

    const bubbleMat = new THREE.PointsMaterial({
        size: 0.16,
        vertexColors: true,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
    });
    const bubbleParticles = new THREE.Points(bubbleGeo, bubbleMat);
    scene.add(bubbleParticles);

    // --- 2. สร้างโครงแนวปะการังคริสตัลทรงหัวใจ 3D (Glowing Coral Heart Reef) ---
    const coralHeartGroup = new THREE.Group();
    coralHeartGroup.position.set(0, 3.2, 0);

    const coralNodes = [];
    const nodeCount = isLowPower ? 60 : 100;
    
    // สร้างเส้นทางสมูทรูปทรงหัวใจ 3D
    const heartCurvePoints = [];
    for (let i = 0; i <= 60; i++) {
        const t = (i / 60) * Math.PI * 2;
        let x = 16 * Math.pow(Math.sin(t), 3);
        let y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
        let z = Math.sin(t * 2) * 1.5;
        
        const scale = 0.38;
        heartCurvePoints.push(new THREE.Vector3(x * scale, y * scale, z));
    }
    const heartPath = new THREE.CatmullRomCurve3(heartCurvePoints, true);

    const coralTubeGeo = new THREE.TubeGeometry(heartPath, 80, 0.42, 12, true);
    const coralTubeMat = new THREE.MeshPhongMaterial({
        color: 0xff3b9d,
        emissive: 0x801048,
        specular: 0x35e6ff,
        shininess: 80,
        transparent: true,
        opacity: 0.85
    });
    const coralTubeMesh = new THREE.Mesh(coralTubeGeo, coralTubeMat);
    coralHeartGroup.add(coralTubeMesh);

    for (let i = 0; i < nodeCount; i++) {
        const u = i / nodeCount;
        const pos = heartPath.getPointAt(u);

        const anemoneGeo = new THREE.DodecahedronGeometry(0.22 + Math.random() * 0.25, 1);
        const anemoneMat = new THREE.MeshBasicMaterial({
            color: Math.random() > 0.4 ? 0xffa3e0 : 0x80f5ff,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        const anemone = new THREE.Mesh(anemoneGeo, anemoneMat);
        anemone.position.copy(pos).add(new THREE.Vector3((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5));
        coralHeartGroup.add(anemone);
        coralNodes.push({ mesh: anemone, baseScale: anemone.scale.x, phase: Math.random() * Math.PI * 2 });
    }
    
    // --- 📸 โหลดและแสดงผลรูปคู่ 3D ทรงกลมตรงกลางปะการัง (Couple Photo Portal) ---
    const textureLoader = new THREE.TextureLoader();
    let photoMesh = null;

    textureLoader.load(PHOTO_URL, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;

        const photoGeo = new THREE.CircleGeometry(2.5, 32);
        const photoMat = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 1.0,
            depthTest: false,
            depthWrite: false
        });
        photoMesh = new THREE.Mesh(photoGeo, photoMat);
        photoMesh.position.set(0, 0.5, 0.5);
        photoMesh.renderOrder = 999;
        coralHeartGroup.add(photoMesh);

        const ringGlowGeo = new THREE.RingGeometry(2.52, 2.75, 32);
        const ringGlowMat = new THREE.MeshBasicMaterial({
            color: 0x35e6ff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            depthWrite: false
        });
        const ringGlow = new THREE.Mesh(ringGlowGeo, ringGlowMat);
        ringGlow.position.set(0, 0.5, 0.51);
        ringGlow.renderOrder = 1000;
        coralHeartGroup.add(ringGlow);
    }, undefined, (err) => {
        console.error('โหลดรูป ' + PHOTO_URL + ' ไม่สำเร็จ:', err);
    });

    const centerGlowGeo = new THREE.SphereGeometry(2.8, 24, 24);
    const centerGlowMat = new THREE.MeshBasicMaterial({
        color: 0xff6fb0,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending
    });
    const centerGlow = new THREE.Mesh(centerGlowGeo, centerGlowMat);
    coralHeartGroup.add(centerGlow);

    scene.add(coralHeartGroup);

    // --- 3. แมงกะพรุนเนื้อแก้วสามมิติเสมือนจริง ---
    function createCinematicJellyfish(pinkTone = true) {
        const group = new THREE.Group();

        const points = [];
        for (let i = 0; i <= 24; i++) {
            const t = i / 24;
            const x = Math.sin(t * Math.PI * 0.58) * 1.6;
            const y = Math.cos(t * Math.PI * 0.58) * 1.3;
            points.push(new THREE.Vector2(x, y));
        }

        const capGeo = new THREE.LatheGeometry(points, 32);
        const capMat = new THREE.MeshPhongMaterial({
            color: pinkTone ? 0xff4da6 : 0x00f0ff,
            emissive: pinkTone ? 0x801048 : 0x005577,
            specular: 0xffffff,
            shininess: 90,
            transparent: true,
            opacity: 0.45,
            side: THREE.DoubleSide,
            blending: THREE.NormalBlending
        });
        const capMesh = new THREE.Mesh(capGeo, capMat);
        group.add(capMesh);

        const rimGeo = new THREE.TorusGeometry(1.58, 0.05, 12, 32);
        const rimMat = new THREE.MeshBasicMaterial({
            color: pinkTone ? 0xffa3e0 : 0x99f7ff,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending
        });
        const rimMesh = new THREE.Mesh(rimGeo, rimMat);
        rimMesh.rotation.x = Math.PI / 2;
        rimMesh.position.y = -0.1;
        group.add(rimMesh);

        const organGeo = new THREE.SphereGeometry(0.55, 20, 20);
        const organMat = new THREE.MeshBasicMaterial({
            color: pinkTone ? 0xffcce6 : 0xd4f8ff,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending
        });
        const organCore = new THREE.Mesh(organGeo, organMat);
        organCore.position.y = 0.5;
        group.add(organCore);

        const armGroup = new THREE.Group();
        const armCount = 4;
        const arms = [];

        for (let i = 0; i < armCount; i++) {
            const armPoints = [];
            const angle = (i / armCount) * Math.PI * 2;
            for (let j = 0; j < 12; j++) {
                const h = -(j * 0.32);
                const r = 0.3 + Math.sin(j * 0.7) * 0.15;
                armPoints.push(new THREE.Vector3(Math.cos(angle) * r, h, Math.sin(angle) * r));
            }
            const armGeo = new THREE.BufferGeometry().setFromPoints(armPoints);
            const armMat = new THREE.LineBasicMaterial({
                color: pinkTone ? 0xff75c3 : 0x33ebff,
                transparent: true,
                opacity: 0.75,
                blending: THREE.AdditiveBlending
            });
            const armLine = new THREE.Line(armGeo, armMat);
            armGroup.add(armLine);
            arms.push({ line: armLine, points: armPoints, angleOffset: angle });
        }
        group.add(armGroup);

        const tentacleCount = 14;
        const tentacles = [];
        for (let i = 0; i < tentacleCount; i++) {
            const tPoints = [];
            const angle = (i / tentacleCount) * Math.PI * 2;
            const radius = 1.5;
            const startX = Math.cos(angle) * radius;
            const startZ = Math.sin(angle) * radius;

            for (let j = 0; j < 14; j++) {
                tPoints.push(new THREE.Vector3(startX, -(j * 0.38), startZ));
            }

            const lineGeo = new THREE.BufferGeometry().setFromPoints(tPoints);
            const lineMat = new THREE.LineBasicMaterial({
                color: pinkTone ? 0xffb0e1 : 0x80f5ff,
                transparent: true,
                opacity: 0.5,
                blending: THREE.AdditiveBlending
            });
            const tentacleLine = new THREE.Line(lineGeo, lineMat);
            group.add(tentacleLine);
            tentacles.push({ line: tentacleLine, points: tPoints, angleOffset: angle });
        }

        return {
            group,
            capMesh,
            rimMesh,
            organCore,
            arms,
            tentacles,
            basePosY: 0,
            speed: 0.6 + Math.random() * 0.3
        };
    }

    const jellyfishList = [];
    const jellyfishPosList = [
        { x: -6.5, y: 3.5, z: -1, pink: true },
        { x: 6.5, y: 4.5, z: -1, pink: false },
        { x: -8, y: -2, z: 2, pink: false },
        { x: 7.5, y: -1, z: 1.5, pink: true },
        { x: 0, y: 8, z: -5, pink: true }
    ];

    jellyfishPosList.forEach((info) => {
        const jf = createCinematicJellyfish(info.pink);
        jf.group.position.set(info.x, info.y, info.z);
        jf.basePosY = info.y;
        jf.group.scale.set(0, 0, 0);
        scene.add(jf.group);
        jellyfishList.push(jf);
    });

    // --- 4. ฝูงละอองหัวใจเรืองแสงใต้น้ำ (Glowing Heart Dust & Stars) ---
    const heartParticlesGroup = new THREE.Group();
    scene.add(heartParticlesGroup);

    // สร้าง Texture รูปหัวใจด้วย Canvas 2D
    function createHeartTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(32, 20);
        ctx.bezierCurveTo(32, 17, 27, 10, 18, 10);
        ctx.bezierCurveTo(8, 10, 8, 24.5, 8, 24.5);
        ctx.bezierCurveTo(8, 34, 18, 43, 32, 52);
        ctx.bezierCurveTo(46, 43, 56, 34, 56, 24.5);
        ctx.bezierCurveTo(56, 24.5, 56, 10, 46, 10);
        ctx.bezierCurveTo(37, 10, 32, 17, 32, 20);
        ctx.fill();

        return new THREE.CanvasTexture(canvas);
    }

    const heartTexture = createHeartTexture();
    const magicHearts = [];
    const magicHeartCount = isLowPower ? 30 : 65;

    for (let i = 0; i < magicHeartCount; i++) {
        const mat = new THREE.SpriteMaterial({
            map: heartTexture,
            color: Math.random() > 0.45 ? 0xff6fb0 : 0x35e6ff,
            transparent: true,
            opacity: 0.6 + Math.random() * 0.4,
            blending: THREE.AdditiveBlending
        });

        const sprite = new THREE.Sprite(mat);
        const radius = 4.5 + Math.random() * 7.5;
        const angle = Math.random() * Math.PI * 2;
        const y = (Math.random() - 0.5) * 8 + 2;
        const scale = 0.25 + Math.random() * 0.35;

        sprite.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
        sprite.scale.set(scale, scale, 1);
        heartParticlesGroup.add(sprite);

        magicHearts.push({
            mesh: sprite,
            radius: radius,
            angle: angle,
            y: y,
            speed: 0.003 + Math.random() * 0.005,
            pulsePhase: Math.random() * Math.PI * 2,
            baseScale: scale
        });
    }

    // --- 5. วงแหวนตัวอักษรบอกรักใต้น้ำ ---
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);

    const labels = [
        "LUX INK", "LUX INK", "JUBJUB",
        "LUX INK", "JUBJUB", "LOVE INK KRUB",
        "EIEI", "INKLNWZA"
    ];
    labels.forEach((text, index) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 512; canvas.height = 128;
        ctx.font = 'Bold 28px Prompt, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#35e6ff';
        ctx.shadowBlur = 14;
        ctx.textAlign = 'center';
        ctx.fillText(text, 256, 70);

        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, opacity: 0 }));
        const angle = (index / labels.length) * Math.PI * 2;
        sprite.position.set(Math.cos(angle) * 10, -1, Math.sin(angle) * 10);
        sprite.scale.set(4, 1, 1);
        ringGroup.add(sprite);
    });

    // --- 6. ฟองอากาศระเบิดใต้น้ำ ---
    const fireworks = [];
    const MAX_FIREWORKS = isLowPower ? 4 : 8;
    let lastFireworkTime = 0;

    function createFirework(x, y) {
        const now = performance.now();
        if (now - lastFireworkTime < 60) return;
        if (fireworks.length >= MAX_FIREWORKS) return;
        lastFireworkTime = now;

        const pCount = isLowPower ? 35 : 65;
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
            const speed = 0.1 + Math.random() * 0.1;
            pVelo.push({ x: Math.sin(phi) * Math.cos(theta) * speed, y: Math.sin(phi) * Math.sin(theta) * speed + 0.02, z: Math.cos(phi) * speed });
        }

        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        pGeo.attributes.position.setUsage(THREE.DynamicDrawUsage);
        const firework = new THREE.Points(pGeo, new THREE.PointsMaterial({
            color: Math.random() > 0.5 ? 0x35e6ff : 0xff6fb0,
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
    const REFERENCE_FPS = 60;
    let rafId = null;
    let isRunning = true;

    const introOverlayText = document.getElementById('introOverlayText');
    if (introOverlayText) introOverlayText.classList.add('show');

    function animate() {
        if (!isRunning) return;
        rafId = requestAnimationFrame(animate);

        const rawDelta = clock.getDelta();
        const delta = Math.min(rawDelta, 3 / REFERENCE_FPS);
        const frameScale = delta * REFERENCE_FPS;
        const elapsedTime = clock.elapsedTime;

        if (elapsedTime < 3.0) {
            const diveProgress = elapsedTime / 3.0;
            const easeDive = 1 - Math.pow(1 - diveProgress, 3);

            camera.position.y = 35 - (35 - 3.5) * easeDive;
            camera.position.z = 30 - (30 - 20) * easeDive;

            oceanLight1.intensity = easeDive * 3.5;
            oceanLight2.intensity = easeDive * 2.8;
            ambientLight.intensity = 0.5 + easeDive * 1.0;

            bubbleMat.opacity = easeDive * 0.7;
            coralHeartGroup.scale.set(easeDive, easeDive, easeDive);

            jellyfishList.forEach((jf) => {
                const s = easeDive;
                jf.group.scale.set(s, s, s);
            });

            ringGroup.children.forEach(sprite => {
                sprite.material.opacity = easeDive * 0.85;
            });

            if (elapsedTime > 2.0 && introOverlayText) {
                introOverlayText.classList.remove('show');
            }
        } else {
            if (actionBtnGroup && !actionBtnGroup.classList.contains('ready')) {
                actionBtnGroup.classList.add('ready');
            }

            const coralPulse = 1 + Math.sin(elapsedTime * 2.2) * 0.04;
            coralHeartGroup.scale.set(coralPulse, coralPulse, coralPulse);
            coralHeartGroup.rotation.y += 0.002 * frameScale;

            coralNodes.forEach((node) => {
                const s = node.baseScale * (1 + Math.sin(elapsedTime * 3 + node.phase) * 0.2);
                node.mesh.scale.set(s, s, s);
            });

            // หมุนแผ่นรูปภาพให้หันหน้าเข้าหากล้องตลอดเวลา
            if (photoMesh) {
                photoMesh.lookAt(camera.position);
            }

            targetX += (mouseX - targetX) * Math.min(0.04 * frameScale, 1);
            targetY += (mouseY - targetY) * Math.min(0.04 * frameScale, 1);
            camera.position.x = Math.sin(targetX) * 20;
            camera.position.z = Math.cos(targetX) * 20;
            camera.position.y = 3.5 + targetY * 5;
        }

        // อัปเดตฟองอากาศ
        const bArray = bubbleParticles.geometry.attributes.position.array;
        for (let i = 0; i < bubbleParticlesCount; i++) {
            const idx = i * 3;
            bArray[idx + 1] += bubbleVel[i] * frameScale;
            bArray[idx] += Math.sin(elapsedTime * 2 + i) * 0.012 * frameScale;

            if (bArray[idx + 1] > 22) {
                bArray[idx + 1] = -20;
                bArray[idx] = (Math.random() - 0.5) * 50;
            }
        }
        bubbleParticles.geometry.attributes.position.needsUpdate = true;

        // อัปเดตการลอยวนของละอองหัวใจและดาววิ้งๆ
        magicHearts.forEach((item) => {
            item.angle += item.speed * frameScale;
            const currentRadius = item.radius + Math.sin(elapsedTime * 1.2 + item.pulsePhase) * 0.5;

            item.mesh.position.x = Math.cos(item.angle) * currentRadius;
            item.mesh.position.z = Math.sin(item.angle) * currentRadius;
            item.mesh.position.y = item.y + Math.sin(elapsedTime * 1.8 + item.pulsePhase) * 0.3;

            const pulse = item.baseScale * (1 + Math.sin(elapsedTime * 3 + item.pulsePhase) * 0.25);
            item.mesh.scale.set(pulse, pulse, 1);
        });

        // อัปเดตแมงกะพรุน
        jellyfishList.forEach((jf, index) => {
            const swimCycle = Math.sin(elapsedTime * jf.speed * 1.8 + index * 1.5);
            jf.group.position.y = jf.basePosY + swimCycle * 1.1;

            const squeezeX = 1 + swimCycle * 0.16;
            const squeezeY = 1 - swimCycle * 0.14;
            jf.capMesh.scale.set(squeezeX, squeezeY, squeezeX);
            jf.rimMesh.scale.set(squeezeX, squeezeX, squeezeX);

            jf.organCore.rotation.y += 0.015 * frameScale;

            jf.arms.forEach((arm) => {
                const pos = arm.line.geometry.attributes.position.array;
                for (let k = 1; k < 12; k++) {
                    const wave = Math.sin(elapsedTime * 2.8 - k * 0.35 + arm.angleOffset) * 0.09;
                    pos[k * 3] = arm.points[k].x + wave;
                    pos[k * 3 + 2] = arm.points[k].z + wave;
                }
                arm.line.geometry.attributes.position.needsUpdate = true;
            });

            jf.tentacles.forEach((tent) => {
                const pos = tent.line.geometry.attributes.position.array;
                for (let k = 1; k < 14; k++) {
                    const wave = Math.sin(elapsedTime * 2.2 - k * 0.3 + tent.angleOffset) * (0.04 + k * 0.016);
                    pos[k * 3] = tent.points[k].x + wave;
                    pos[k * 3 + 2] = tent.points[k].z + wave;
                }
                tent.line.geometry.attributes.position.needsUpdate = true;
            });
        });

        // อัปเดตฟองอากาศระเบิด
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

        ringGroup.rotation.y += 0.002 * frameScale;
        camera.lookAt(0, 1.8, 0);

        renderer.render(scene, camera);
    }

    animate();

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            isRunning = false;
            if (rafId) cancelAnimationFrame(rafId);
        } else {
            if (!isRunning) {
                isRunning = true;
                clock.getDelta();
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