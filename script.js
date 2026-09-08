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
    holdBtn.addEventListener('touchstart', startHold);
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
});

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
    });
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

if (openCardBtn) {
    openCardBtn.addEventListener('click', () => {
        if (card) card.classList.add('show');
        if (actionBtnGroup) actionBtnGroup.style.display = 'none';
    });
}

if (closeCardBtn) {
    closeCardBtn.addEventListener('click', () => {
        if (card) card.classList.remove('show');
        if (actionBtnGroup) actionBtnGroup.style.display = 'flex';
    });
}

if (openTarotBtn) {
    openTarotBtn.addEventListener('click', () => {
        if (tarotModal) tarotModal.classList.add('show');
        if (actionBtnGroup) actionBtnGroup.style.display = 'none';
    });
}

if (closeTarotBtn) {
    closeTarotBtn.addEventListener('click', () => {
        if (tarotModal) tarotModal.classList.remove('show');
        if (actionBtnGroup) actionBtnGroup.style.display = 'flex';
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
            }, 200);
        }, 480);
    });
});

if (closeResultBtn) {
    closeResultBtn.addEventListener('click', () => {
        if (resultModal) resultModal.classList.remove('show');
        if (actionBtnGroup) actionBtnGroup.style.display = 'flex';
    });
}

// ==================== ระบบเรนเดอร์ฉาก 3D ====================
function init3DScene() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 7, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    if (canvasContainer) canvasContainer.insertBefore(renderer.domElement, canvasContainer.firstChild);

    const centerLight = new THREE.PointLight(0xff007f, 2, 50);
    centerLight.position.set(0, 3, 0);
    scene.add(centerLight);

    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 2500;
    const starsPositions = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i++) {
        starsPositions[i] = (Math.random() - 0.5) * 140;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
    const starField = new THREE.Points(starsGeometry, new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, transparent: true, opacity: 0.5 }));
    scene.add(starField);

    const heartParticlesCount = 6500;
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
    const heartMaterial = new THREE.PointsMaterial({
        color: 0xff33bb,
        size: 0.22,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending
    });
    const heartParticles = new THREE.Points(heartGeometry, heartMaterial);
    scene.add(heartParticles);

    const galaxyGeometry = new THREE.BufferGeometry();
    const galaxyCount = 8500;
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

    const catTexture = createCatTexture();
    for (let i = 0; i < 3; i++) {
        const spriteMat = new THREE.SpriteMaterial({ map: catTexture, transparent: true });
        const catSprite = new THREE.Sprite(spriteMat);
        const angle = (i / 3) * Math.PI * 2 + 0.5;
        catSprite.position.set(Math.cos(angle) * 8.5, -2.5, Math.sin(angle) * 8.5);
        catSprite.scale.set(2.0, 2.0, 1);
        ringGroup.add(catSprite);
    }

    const labels = ["LOVE U", "LOVE U", "LOVE U", "LOVE U", "LOVE U", "LOVE U"];
    labels.forEach((text, index) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 512; canvas.height = 128;
        ctx.font = 'Bold 32px Prompt, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ff007f';
        ctx.shadowBlur = 16;
        ctx.textAlign = 'center';
        ctx.fillText(text, 256, 70);

        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true }));
        const angle = (index / labels.length) * Math.PI * 2;
        sprite.position.set(Math.cos(angle) * 10.5, -3.0, Math.sin(angle) * 10.5);
        sprite.scale.set(5.0, 1.25, 1);
        ringGroup.add(sprite);
    });

    const fireworks = [];
    function createFirework(x, y) {
        const pCount = 80;
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
        if (canvasContainer && canvasContainer.classList.contains('show') &&
            (!card || !card.classList.contains('show')) &&
            (!tarotModal || !tarotModal.classList.contains('show')) &&
            (!resultModal || !resultModal.classList.contains('show'))) {
            createFirework(e.clientX, e.clientY);
        }
    });

    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2) * 0.0008;
        mouseY = (e.clientY - window.innerHeight / 2) * 0.0008;
    });

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();
        const positions = heartGeometry.attributes.position.array;

        if (elapsedTime < 1.8) {
            const burstSpeed = 0.08;
            centerLight.intensity = 10;
            for (let i = 0; i < heartParticlesCount; i++) {
                const idx = i * 3;
                positions[idx] += (burstVelocities[idx] - positions[idx]) * burstSpeed;
                positions[idx + 1] += (burstVelocities[idx + 1] - positions[idx + 1]) * burstSpeed;
                positions[idx + 2] += (burstVelocities[idx + 2] - positions[idx + 2]) * burstSpeed;
            }
        } else {
            const formSpeed = 0.035;
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
            fw.life -= 0.02;
            fw.mesh.material.opacity = fw.life;
            for (let j = 0; j < fwPos.length / 3; j++) {
                fwPos[j * 3] += fw.velo[j].x;
                fwPos[j * 3 + 1] += fw.velo[j].y;
                fwPos[j * 3 + 2] += fw.velo[j].z;
            }
            fw.mesh.geometry.attributes.position.needsUpdate = true;
            if (fw.life <= 0) { scene.remove(fw.mesh); fireworks.splice(i, 1); }
        }

        heartParticles.rotation.y += 0.004;
        galaxyParticles.rotation.y += 0.002;
        ringGroup.rotation.y += 0.0025;

        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;
        camera.position.x = Math.sin(targetX) * 20;
        camera.position.z = Math.cos(targetX) * 20;
        camera.position.y = 7 + targetY * 8;
        camera.lookAt(0, 2, 0);

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}