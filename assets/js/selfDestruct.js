import { MISSION_CONFIG } from './config.js';
import { playShutdownSound, glitchEffect, fadeOut } from './effects.js';

/**
 * Self Destruct Controller
 * Handles the final countdown, cleanup, and redirection.
 */

let countdownTimer = null;

/**
 * Initiates the self-destruct sequence
 * @param {string} displaySelector - Selector for the countdown display container
 */
export function startSelfDestruct(displaySelector = '#countdown-display') {
    const display = document.querySelector(displaySelector);
    const timerSpan = document.getElementById('timer');

    if (!display || !timerSpan) return;

    // Show the countdown container
    display.classList.remove('hidden');
    display.style.opacity = '1';

    let timeLeft = MISSION_CONFIG.selfDestructCountdown || 5;

    // Initial update
    updateTimerDisplay(timerSpan, timeLeft);

    // Start interval
    countdownTimer = setInterval(() => {
        timeLeft--;

        // Update display
        updateTimerDisplay(timerSpan, timeLeft);

        // Add intensity effects as time runs out
        if (timeLeft <= 3) {
            document.body.classList.add('critical-alert'); // CSS class for red pulsing
            glitchEffect(document.body);
        }

        if (timeLeft <= 0) {
            triggerExplosion();
        }
    }, 1000);
}

/**
 * Updates the visual timer numbers
 * @param {HTMLElement} element 
 * @param {number} time 
 */
function updateTimerDisplay(element, time) {
    element.textContent = time.toFixed(2);
}

/**
 * Final cleanup and redirect
 */
function triggerExplosion() {
    clearInterval(countdownTimer);

    playShutdownSound();

    // Fade out everything
    fadeOut(document.body, () => {
        clearMissionData();

        // Redirect to expired page or close
        // Check if expired.html exists relative to current location
        const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
        window.location.href = `${baseUrl}/expired.html`;

        // Fallback or additional close attempt
        setTimeout(() => {
            window.close();
        }, 100);
    });
}

/**
 * Clears any stored mission data
 */
function clearMissionData() {
    try {
        localStorage.clear();
        sessionStorage.clear();
        // Clear history state if possible to prevent back button restoration
        if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', window.location.href);
        }
    } catch (e) {
        console.log('Cleanup error:', e);
    }
}
