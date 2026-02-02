import { MISSION_CONFIG } from './config.js';
import { typeText, glitchElement, fadeOut, fadeIn } from './effects.js';
import { startSelfDestruct } from './selfDestruct.js';

/**
 * Mission Briefing Controller
 * Orchestrates the boot sequence, briefing display, and user decisions.
 */

// State
let missionData = {};

document.addEventListener('DOMContentLoaded', () => {
    missionData = getUrlParams();

    // Wait for user interaction to start (enables Fullscreen & Audio)
    const startOverlay = document.getElementById('start-overlay');
    if (startOverlay) {
        startOverlay.addEventListener('click', () => {
            // Attempt Fullscreen
            try {
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen();
                } else if (document.documentElement.webkitRequestFullscreen) { /* Safari */
                    document.documentElement.webkitRequestFullscreen();
                }
            } catch (e) {
                console.log('Fullscreen denied or failed');
            }

            // Hide overlay and start system
            startOverlay.classList.add('hidden');
            setTimeout(() => {
                startOverlay.style.display = 'none';
                displayBootSequence();
            }, 800);
        });
    } else {
        // Fallback for dev/debug
        displayBootSequence();
    }
});

/**
 * Parses URL parameters to get mission details
 * @returns {Object} Mission parameters (from, to, tone, msg)
 */
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        from: params.get('from') || 'UNKNOWN AGENT',
        to: params.get('to') || 'AGENT',
        tone: params.get('tone') || 'dramatic',
        msg: params.get('msg') || ''
    };
}

/**
 * Runs the cinematic boot sequence
 */
async function displayBootSequence() {
    const bootContainer = document.getElementById('boot-sequence');
    const terminalContent = bootContainer.querySelector('.terminal-content');
    const loadingBar = bootContainer.querySelector('.loading-bar');

    // Apply tone-specific styling if needed
    applyTone(missionData.tone);

    // Show boot log lines
    for (const line of MISSION_CONFIG.bootText) {
        const p = document.createElement('p');
        p.textContent = line;
        terminalContent.appendChild(p);

        // Random glitch effect on some lines
        if (Math.random() > 0.7) glitchElement(p);

        // Wait based on config timing or default
        const delay = (MISSION_CONFIG.bootLineDelay) || 600;
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Finalize loading bar
    loadingBar.style.width = '100%';
    await new Promise(resolve => setTimeout(resolve, 800));

    // Transition to Briefing
    fadeOut(bootContainer, () => {
        bootContainer.style.display = 'none';
        displayMissionBriefing();
    });
}

/**
 * Applies tone-specific colors or themes
 * @param {string} tone - The selected tone key
 */
function applyTone(tone) {
    const toneConfig = MISSION_CONFIG.tones[tone];
    if (toneConfig && toneConfig.colorVar) {
        document.documentElement.style.setProperty('--primary-accent', `var(${toneConfig.colorVar})`);
    }
}

/**
 * Displays the main mission briefing with typed text
 */
function displayMissionBriefing() {
    const briefingPanel = document.getElementById('mission-briefing');
    briefingPanel.classList.remove('hidden');
    fadeIn(briefingPanel);

    const greetingEl = briefingPanel.querySelector('.greeting-line');
    const detailsContainer = briefingPanel.querySelector('.mission-details');
    const customMsgEl = briefingPanel.querySelector('.custom-msg-content');
    const additionalIntel = document.getElementById('additional-intel');
    const actions = briefingPanel.querySelector('.mission-actions');

    // Parse placeholders
    const replacePlaceholders = (text) => {
        return text.replace(/\[SENDER_CODENAME\]/g, missionData.from)
            .replace(/\[RECEIVER_CODENAME\]/g, missionData.to);
    };

    // Get tone-specific briefing template or default
    const tonePreset = MISSION_CONFIG.tones[missionData.tone] || MISSION_CONFIG.tones.dramatic;
    // Use the tone's specific briefing if available, otherwise fall back to generic
    // Note: Config structure implies specific text might be in tones, or generic in MISSION_CONFIG.briefing
    // Based on previous config structure, MISSION_CONFIG.briefing is an array of strings.
    // Let's use the array from config, but we could allow overrides if config supported it.
    // For now, using standard briefing structure.

    const briefingLines = MISSION_CONFIG.briefing.map(replacePlaceholders);

    // 1. Type Greeting
    typeText(greetingEl, briefingLines[0], MISSION_CONFIG.typingSpeed, () => {

        // 2. Type Main Body (remaining lines)
        let lineIndex = 1;

        function typeNextLine() {
            if (lineIndex < briefingLines.length) {
                const p = document.createElement('p');
                detailsContainer.appendChild(p);
                typeText(p, briefingLines[lineIndex], MISSION_CONFIG.typingSpeed, () => {
                    lineIndex++;
                    typeNextLine();
                });
            } else {
                // 3. Show Custom Message if exists
                if (missionData.msg) {
                    additionalIntel.classList.remove('hidden');
                    typeText(customMsgEl, missionData.msg, MISSION_CONFIG.typingSpeed, showActions);
                } else {
                    showActions();
                }
            }
        }

        typeNextLine();
    });

    function showActions() {
        // Reveal buttons
        actions.style.opacity = '1'; // Ensure visibility if hidden
        // Attach listeners
        document.getElementById('accept-btn').addEventListener('click', () => handleDecision('accept'));
        document.getElementById('decline-btn').addEventListener('click', () => handleDecision('decline'));
    }
}

/**
 * Handles the user's Accept or Decline choice
 * @param {string} decision - 'accept' or 'decline'
 */
function handleDecision(decision) {
    const buttons = document.getElementById('decision-buttons');
    const responseContainer = document.getElementById('response-message');

    // Store feedback for the sender
    try {
        const feedback = {
            id: Date.now(),
            from: missionData.from, // Sender
            to: missionData.to,     // Receiver (who is deciding)
            response: decision === 'accept' ? 'ACCEPTED' : 'DECLINED',
            read: false
        };

        let feedbackQueue = JSON.parse(localStorage.getItem('mission_feedback_queue') || '[]');
        feedbackQueue.push(feedback);
        localStorage.setItem('mission_feedback_queue', JSON.stringify(feedbackQueue));
    } catch (e) {
        console.warn('Storage disabled, feedback not sent.');
    }

    // Hide buttons
    fadeOut(buttons, () => buttons.style.display = 'none');

    // Show response text
    responseContainer.classList.remove('hidden');
    responseContainer.innerHTML = ''; // Request clear

    // Get response lines
    const responses = MISSION_CONFIG.responses[decision];
    // This is an array of strings. 

    // Helper to display lines one by one
    let lineIndex = 0;

    function showNextResponse() {
        if (lineIndex < responses.length) {
            const p = document.createElement('p');
            // Check for countdown placeholder
            let text = responses[lineIndex];
            const hasCountdown = text.includes('{COUNTDOWN}');

            p.textContent = text.replace('{COUNTDOWN}', MISSION_CONFIG.selfDestructCountdown);
            if (decision === 'decline') p.classList.add('error-text');

            responseContainer.appendChild(p);
            glitchElement(p); // Glitch effect on response

            lineIndex++;
            setTimeout(showNextResponse, 1000); // 1s delay between response lines

            // If this line had the countdown, create a reference for it?
            // Actually, selfDestruct module manages its own UI usually, but we need to trigger it.
            if (hasCountdown) {
                setTimeout(() => {
                    startSelfDestruct();
                }, 1000);
            }
        }
    }

    showNextResponse();
}
