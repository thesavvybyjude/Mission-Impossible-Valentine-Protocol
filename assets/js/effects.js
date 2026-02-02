/**
 * Mission Impossible Effects Module
 * Handles animations (via GSAP/Typed.js) and Sound Effects.
 */

// Sound state
let isMuted = false;

const sounds = {
    boot: new Audio('assets/sounds/boot.mp3'),
    type: new Audio('assets/sounds/type.mp3'),
    shutdown: new Audio('assets/sounds/shutdown.mp3')
};

// Preload sounds
Object.values(sounds).forEach(audio => {
    audio.preload = 'auto';
    audio.volume = 0.5;
});

/**
 * Plays the boot sequence sound
 */
export function playBootSound() {
    if (isMuted) return;
    sounds.boot.currentTime = 0;
    sounds.boot.play().catch(e => console.log('Audio play blocked:', e));
}

/**
 * Plays the typing sound loop
 */
export function playTypeSound() {
    if (isMuted) return;
    // Clone node to allow overlapping typing sounds or just play
    const clone = sounds.type.cloneNode();
    clone.volume = 0.2;
    clone.play().catch(e => { });
}

/**
 * Plays the shutdown/failure sound
 */
export function playShutdownSound() {
    if (isMuted) return;
    sounds.shutdown.play().catch(e => { });
}

/**
 * Animates a panel entrance using GSAP
 * @param {string|Element} panelSelector 
 * @param {Object} options - GSAP options
 */
export function animatePanel(panelSelector, options = {}) {
    if (typeof gsap === 'undefined') return;

    gsap.to(panelSelector, {
        duration: 0.8,
        opacity: 1,
        y: 0,
        ease: "power2.out",
        ...options
    });
}

/**
 * Fades out a panel smoothly
 * @param {string|Element} panelSelector 
 * @param {Function} callback - onComplete callback
 */
export function fadeOutPanel(panelSelector, callback) {
    if (typeof gsap === 'undefined') {
        if (callback) callback();
        return;
    }

    gsap.to(panelSelector, {
        duration: 0.5,
        opacity: 0,
        y: -10,
        ease: "power2.in",
        onComplete: callback
    });
}

/**
 * Fades in a panel smoothly
 * @param {string|Element} panelSelector
 */
export function fadeIn(panelSelector) {
    if (typeof gsap === 'undefined') {
        const el = typeof panelSelector === 'string' ? document.querySelector(panelSelector) : panelSelector;
        if (el) el.style.opacity = 1;
        return;
    }

    gsap.fromTo(panelSelector,
        { opacity: 0, y: 20 },
        { duration: 0.8, opacity: 1, y: 0, ease: "power2.out" }
    );
}

/**
 * Applies a glitch effect to an element
 * @param {string|Element} panelSelector 
 */
export function glitchEffect(panelSelector) {
    if (typeof gsap === 'undefined') return;

    const tl = gsap.timeline();
    tl.to(panelSelector, { skewX: 20, duration: 0.1 })
        .to(panelSelector, { skewX: -20, opacity: 0.8, duration: 0.1 })
        .to(panelSelector, { skewX: 0, opacity: 1, duration: 0.1 });
}

/**
 * Adds a pulsing effect to an element
 * @param {string|Element} panelSelector 
 */
export function pulseEffect(panelSelector) {
    if (typeof gsap === 'undefined') return;

    gsap.to(panelSelector, {
        scale: 1.05,
        duration: 0.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
    });
}

/**
 * Types text into a container using Typed.js
 * @param {string|Element} container - The element to type into
 * @param {string} text - The text string to type
 * @param {number} speed - Typing speed in ms
 * @param {Function} callback - Function called when typing finishes
 */
export function typedTextEffect(container, text, speed, callback) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;

    // Play sound roughly
    playTypeSound();

    if (typeof Typed === 'undefined') {
        // Fallback if Typed.js isn't loaded
        el.textContent = text;
        if (callback) callback();
        return;
    }

    new Typed(el, {
        strings: [text],
        typeSpeed: speed,
        showCursor: false,
        onComplete: () => {
            if (callback) callback();
        },
        onStringTyped: () => {
            // Could stop sound here if looping
        }
    });
}


/* --- Aliases for mission.js compatibility --- */
export const typeText = typedTextEffect;
export const glitchElement = glitchEffect;
export const fadeOut = fadeOutPanel;
// fadeIn is already named fadeIn above
