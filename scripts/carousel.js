const EFFECTS = [
    'Cross-Fade', 'Horizontal Slide', 'Vertical Slide', 'Zoom In', 'Zoom Out',
    'Ken Burns', 'Blur Dissolve', 'Horizontal Wipe', 'Vertical Wipe', 'Circular Reveal',
    'Camera Flash', '3D Flip', '3D Cube', 'Push', 'Slide & Overlap',
    'Grayscale to Color', 'Perspective Tilt', 'Doorway Reveal', 'Mosaic', 'Parallax'
];

const carousel = document.getElementById('bg-carousel');
const slides = Array.from(document.querySelectorAll('.bg-slide'));

let current = 0, transitioning = false, effectIdx = 0, timer = null;

// Returns true if a slide contains a video element
function isVideoSlide(slide) {
    return !!slide.querySelector('video');
}

// How long to display this slide before transitioning (ms)
function slideDuration(slide) {
    return isVideoSlide(slide) ? 10000 : 7000;
}

function startIdle(slide) {
    // Videos handle their own motion — skip idle animation
    if (isVideoSlide(slide)) return;

    const inner = slide.querySelector('.bg-slide-inner');
    if (!inner) return;

    const type = Math.floor(Math.random() * 3);

    inner.style.animation = 'none';
    void inner.offsetWidth;

    const duration = '7s';
    const easing = 'cubic-bezier(0.445, 0.05, 0.55, 0.95) infinite alternate';

    if (type === 0) {
        inner.style.animation = `idleZoom ${duration} ${easing}`;
    } else if (type === 1) {
        inner.style.animation = `idlePan ${duration} ${easing}`;
    } else {
        inner.style.animation = `idleDrift ${duration} ${easing}`;
    }
}

function clearSlide(s) {
    s.style.animation = 'none';
    s.style.transition = 'none';
    s.style.transform = '';
    s.style.opacity = '0';
    s.style.filter = '';
    s.style.clipPath = '';
    s.style.zIndex = '';
    void s.offsetWidth;

    // Pause & reset any video so it's ready for next time
    const vid = s.querySelector('video');
    if (vid) {
        vid.pause();
        vid.currentTime = 0;
    }
}

function playSlideVideo(slide) {
    const vid = slide.querySelector('video');
    if (!vid) return;
    vid.currentTime = 0;
    vid.play().catch(() => {/* autoplay blocked — silent fail */});
}

function goTo(next) {
    if (transitioning || next === current) return;
    transitioning = true;
    clearTimeout(timer);

    const prev = current;
    const prevSlide = slides[prev];
    const nextSlide = slides[next];
    const effect = EFFECTS[effectIdx];
    effectIdx = (effectIdx + 1) % EFFECTS.length;

    prevSlide.classList.remove('active');
    prevSlide.classList.add('prev');
    nextSlide.style.opacity = '0';
    nextSlide.classList.add('active');

    clearSlide(nextSlide);
    nextSlide.style.animation = 'none';
    prevSlide.style.animation = 'none';

    const dur = 1200;

    function done() {
        transitioning = false;
        clearSlide(prevSlide);
        prevSlide.classList.remove('prev');
        current = next;

        // Start video playback on the incoming slide (if any)
        playSlideVideo(nextSlide);

        scheduleNext();
    }

    if (effect === 'Cross-Fade') {
        prevSlide.style.transition = `opacity ${dur}ms ease`;
        nextSlide.style.transition = `opacity ${dur}ms ease`;
        prevSlide.style.opacity = '0';
        nextSlide.style.opacity = '1';
        setTimeout(done, dur);

    } else if (effect === 'Horizontal Slide') {
        const dir = next > prev ? 1 : -1;
        nextSlide.style.transform = `translateX(${dir * 100}%)`;
        nextSlide.style.opacity = '1';
        void nextSlide.offsetWidth;
        nextSlide.style.transition = `transform ${dur}ms cubic-bezier(.77,0,.18,1)`;
        prevSlide.style.transition = `transform ${dur}ms cubic-bezier(.77,0,.18,1)`;
        nextSlide.style.transform = 'translateX(0)';
        prevSlide.style.transform = `translateX(${-dir * 100}%)`;
        setTimeout(done, dur);

    } else if (effect === 'Vertical Slide') {
        const dir = next > prev ? 1 : -1;
        nextSlide.style.transform = `translateY(${dir * 100}%)`;
        nextSlide.style.opacity = '1';
        void nextSlide.offsetWidth;
        nextSlide.style.transition = `transform ${dur}ms cubic-bezier(.77,0,.18,1)`;
        prevSlide.style.transition = `transform ${dur}ms cubic-bezier(.77,0,.18,1)`;
        nextSlide.style.transform = 'translateY(0)';
        prevSlide.style.transform = `translateY(${-dir * 100}%)`;
        setTimeout(done, dur);

    } else if (effect === 'Zoom In') {
        nextSlide.style.transform = 'scale(1.3)';
        nextSlide.style.opacity = '0';
        void nextSlide.offsetWidth;
        nextSlide.style.transition = `transform ${dur}ms ease, opacity ${dur * 0.6}ms ease`;
        nextSlide.style.transform = 'scale(1)';
        nextSlide.style.opacity = '1';
        prevSlide.style.transition = `opacity ${dur * 0.6}ms ease`;
        prevSlide.style.opacity = '0';
        setTimeout(done, dur);

    } else if (effect === 'Zoom Out') {
        nextSlide.style.transform = 'scale(0.7)';
        nextSlide.style.opacity = '0';
        void nextSlide.offsetWidth;
        nextSlide.style.transition = `transform ${dur}ms ease, opacity ${dur * 0.6}ms ease`;
        nextSlide.style.transform = 'scale(1)';
        nextSlide.style.opacity = '1';
        prevSlide.style.transition = `transform ${dur}ms ease, opacity ${dur * 0.6}ms ease`;
        prevSlide.style.transform = 'scale(1.3)';
        prevSlide.style.opacity = '0';
        setTimeout(done, dur);

    } else if (effect === 'Ken Burns') {
        nextSlide.style.transform = 'scale(1.1) translateX(3%)';
        nextSlide.style.opacity = '0';
        void nextSlide.offsetWidth;
        nextSlide.style.transition = `transform ${dur * 5}ms ease, opacity ${dur * 0.8}ms ease`;
        nextSlide.style.transform = 'scale(1) translateX(0)';
        nextSlide.style.opacity = '1';
        prevSlide.style.transition = `opacity ${dur * 0.8}ms ease`;
        prevSlide.style.opacity = '0';
        setTimeout(done, dur);

    } else if (effect === 'Blur Dissolve') {
        nextSlide.style.filter = 'blur(20px)';
        nextSlide.style.opacity = '0';
        void nextSlide.offsetWidth;
        nextSlide.style.transition = `filter ${dur}ms ease, opacity ${dur}ms ease`;
        prevSlide.style.transition = `filter ${dur}ms ease, opacity ${dur}ms ease`;
        nextSlide.style.filter = 'blur(0)';
        nextSlide.style.opacity = '1';
        prevSlide.style.filter = 'blur(20px)';
        prevSlide.style.opacity = '0';
        setTimeout(done, dur);

    } else if (effect === 'Horizontal Wipe') {
        const dir = next > prev ? 1 : -1;
        nextSlide.style.clipPath = dir > 0 ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)';
        nextSlide.style.opacity = '1';
        void nextSlide.offsetWidth;
        nextSlide.style.transition = `clip-path ${dur}ms cubic-bezier(.77,0,.18,1)`;
        prevSlide.style.transition = `opacity ${dur}ms ease`;
        nextSlide.style.clipPath = 'inset(0 0% 0 0)';
        prevSlide.style.opacity = '0';
        setTimeout(done, dur);

    } else if (effect === 'Vertical Wipe') {
        nextSlide.style.clipPath = 'inset(0 0 100% 0)';
        nextSlide.style.opacity = '1';
        void nextSlide.offsetWidth;
        nextSlide.style.transition = `clip-path ${dur}ms cubic-bezier(.77,0,.18,1)`;
        prevSlide.style.transition = `opacity ${dur}ms ease`;
        nextSlide.style.clipPath = 'inset(0 0 0% 0)';
        prevSlide.style.opacity = '0';
        setTimeout(done, dur);

    } else if (effect === 'Circular Reveal') {
        nextSlide.style.clipPath = 'circle(0% at 50% 50%)';
        nextSlide.style.opacity = '1';
        void nextSlide.offsetWidth;
        nextSlide.style.transition = `clip-path ${dur}ms cubic-bezier(.4,0,.2,1)`;
        prevSlide.style.transition = `opacity ${dur * 0.5}ms ease ${dur * 0.5}ms`;
        nextSlide.style.clipPath = 'circle(150% at 50% 50%)';
        prevSlide.style.opacity = '0';
        setTimeout(done, dur);

    } else if (effect === 'Camera Flash') {
        const flash = document.createElement('div');
        flash.style.cssText = 'position:absolute;inset:0;background:#fff;z-index:20;opacity:0;pointer-events:none;transition:opacity 0.1s ease';
        carousel.appendChild(flash);
        nextSlide.style.opacity = '1';
        prevSlide.style.transition = 'opacity 0.1s ease';
        setTimeout(() => { flash.style.opacity = '1'; }, 50);
        setTimeout(() => { prevSlide.style.opacity = '0'; }, 150);
        setTimeout(() => { flash.style.opacity = '0'; }, 200);
        setTimeout(() => { carousel.removeChild(flash); done(); }, 500);

    } else if (effect === '3D Flip') {
        nextSlide.style.opacity = '0';
        prevSlide.style.transition = `transform ${dur * 0.5}ms ease, opacity 0.1s ease ${dur * 0.45}ms`;
        prevSlide.style.transform = 'perspective(1200px) rotateY(90deg)';
        setTimeout(() => {
            prevSlide.style.opacity = '0';
            nextSlide.style.transform = 'perspective(1200px) rotateY(-90deg)';
            nextSlide.style.opacity = '1';
            void nextSlide.offsetWidth;
            nextSlide.style.transition = `transform ${dur * 0.5}ms ease`;
            nextSlide.style.transform = 'perspective(1200px) rotateY(0deg)';
        }, dur * 0.5);
        setTimeout(done, dur);

    } else if (effect === '3D Cube') {
        const dir = next > prev ? 1 : -1;
        nextSlide.style.transform = `translateX(${dir * 100}%) rotateY(${-dir * 90}deg)`;
        nextSlide.style.transformOrigin = dir > 0 ? 'left center' : 'right center';
        nextSlide.style.opacity = '1';
        void nextSlide.offsetWidth;
        nextSlide.style.transition = `transform ${dur}ms cubic-bezier(.4,0,.2,1)`;
        prevSlide.style.transition = `transform ${dur}ms cubic-bezier(.4,0,.2,1)`;
        prevSlide.style.transformOrigin = dir > 0 ? 'right center' : 'left center';
        nextSlide.style.transform = 'translateX(0) rotateY(0deg)';
        prevSlide.style.transform = `translateX(${-dir * 100}%) rotateY(${dir * 90}deg)`;
        setTimeout(done, dur);

    } else if (effect === 'Push') {
        const dir = next > prev ? 1 : -1;
        nextSlide.style.transform = `translateX(${dir * 100}%)`;
        nextSlide.style.opacity = '1';
        void nextSlide.offsetWidth;
        const t = `transform ${dur}ms cubic-bezier(.77,0,.18,1)`;
        nextSlide.style.transition = t;
        prevSlide.style.transition = t;
        nextSlide.style.transform = 'translateX(0)';
        prevSlide.style.transform = `translateX(${-dir * 40}%)`;
        setTimeout(done, dur);

    } else if (effect === 'Slide & Overlap') {
        const dir = next > prev ? 1 : -1;
        nextSlide.style.transform = `translateX(${dir * 100}%)`;
        nextSlide.style.opacity = '1';
        nextSlide.style.zIndex = '3';
        void nextSlide.offsetWidth;
        nextSlide.style.transition = `transform ${dur}ms cubic-bezier(.77,0,.18,1)`;
        nextSlide.style.transform = 'translateX(0)';
        prevSlide.style.transition = `opacity 0.2s ease ${dur - 200}ms`;
        prevSlide.style.opacity = '0';
        setTimeout(done, dur);

    } else if (effect === 'Grayscale to Color') {
        nextSlide.style.filter = 'grayscale(100%) brightness(0.7)';
        nextSlide.style.opacity = '0';
        void nextSlide.offsetWidth;
        nextSlide.style.transition = `opacity ${dur * 0.5}ms ease, filter ${dur}ms ease`;
        prevSlide.style.transition = `opacity ${dur * 0.5}ms ease`;
        nextSlide.style.filter = 'grayscale(0%) brightness(1)';
        nextSlide.style.opacity = '1';
        prevSlide.style.opacity = '0';
        setTimeout(done, dur);

    } else if (effect === 'Perspective Tilt') {
        nextSlide.style.transform = 'perspective(1200px) rotateX(40deg) scale(0.85)';
        nextSlide.style.opacity = '0';
        void nextSlide.offsetWidth;
        nextSlide.style.transition = `transform ${dur}ms cubic-bezier(.4,0,.2,1), opacity ${dur * 0.5}ms ease`;
        prevSlide.style.transition = `transform ${dur}ms cubic-bezier(.4,0,.2,1), opacity ${dur * 0.5}ms ease`;
        nextSlide.style.transform = 'perspective(1200px) rotateX(0deg) scale(1)';
        nextSlide.style.opacity = '1';
        prevSlide.style.transform = 'perspective(1200px) rotateX(-40deg) scale(0.85)';
        prevSlide.style.opacity = '0';
        setTimeout(done, dur);

    } else if (effect === 'Doorway Reveal') {
        const bg = prevSlide.style.backgroundImage;
        const baseStyle = `position:absolute;top:0;bottom:0;z-index:15;background-size:cover;transition:transform ${dur}ms cubic-bezier(.77,0,.18,1)`;
        const leftDoor = document.createElement('div');
        const rightDoor = document.createElement('div');
        leftDoor.style.cssText = baseStyle + `;left:0;width:50%;background-image:${bg};background-position:left center;transform:translateX(0)`;
        rightDoor.style.cssText = baseStyle + `;right:0;width:50%;background-image:${bg};background-position:right center;transform:translateX(0)`;
        carousel.appendChild(leftDoor);
        carousel.appendChild(rightDoor);
        nextSlide.style.opacity = '1';
        prevSlide.style.opacity = '0';
        void leftDoor.offsetWidth;
        leftDoor.style.transform = 'translateX(-100%)';
        rightDoor.style.transform = 'translateX(100%)';
        setTimeout(() => { carousel.removeChild(leftDoor); carousel.removeChild(rightDoor); done(); }, dur + 100);

    } else if (effect === 'Mosaic') {
        const canvas = document.createElement('canvas');
        const w = carousel.offsetWidth, h = carousel.offsetHeight;
        canvas.width = w; canvas.height = h;
        canvas.style.cssText = 'position:absolute;inset:0;z-index:15;';
        carousel.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        const img = new Image(); img.crossOrigin = 'anonymous';
        img.src = slides[prev].style.backgroundImage.replace(/url\(["']?|["']?\)/g, '');
        nextSlide.style.opacity = '1';
        prevSlide.style.opacity = '0';
        const tileSize = 40;
        const cols = Math.ceil(w / tileSize), rows = Math.ceil(h / tileSize);
        let tiles = [];
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) tiles.push({ r, c });
        tiles.sort(() => Math.random() - 0.5);
        let idx = 0;
        img.onload = () => {
            ctx.drawImage(img, 0, 0, w, h);
            const interval = setInterval(() => {
                const batch = Math.ceil(tiles.length / 20);
                for (let i = 0; i < batch && idx < tiles.length; i++, idx++) {
                    ctx.clearRect(tiles[idx].c * tileSize, tiles[idx].r * tileSize, tileSize, tileSize);
                }
                if (idx >= tiles.length) { clearInterval(interval); carousel.removeChild(canvas); done(); }
            }, dur / 20);
        };
        img.onerror = () => { carousel.removeChild(canvas); done(); };

    } else if (effect === 'Parallax') {
        nextSlide.style.transform = 'translateX(8%) scale(1.08)';
        nextSlide.style.opacity = '0';
        void nextSlide.offsetWidth;
        nextSlide.style.transition = `transform ${dur * 1.5}ms ease, opacity ${dur}ms ease`;
        prevSlide.style.transition = `transform ${dur * 1.5}ms ease, opacity ${dur}ms ease`;
        nextSlide.style.transform = 'translateX(0) scale(1)';
        nextSlide.style.opacity = '1';
        prevSlide.style.transform = 'translateX(-8%) scale(1.08)';
        prevSlide.style.opacity = '0';
        setTimeout(done, dur);
    }
}

function scheduleNext() {
    // Use the current slide's duration (10s for video, 7s for image)
    const delay = slideDuration(slides[current]);
    timer = setTimeout(() => goTo((current + 1) % slides.length), delay);
}

// Init
slides[0].classList.add('active');
slides[0].style.opacity = '1';

// Start idle animations on image slides only; videos play only when transitioned to
slides.forEach(slide => {
    if (!isVideoSlide(slide)) startIdle(slide);
});

scheduleNext();