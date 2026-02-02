import { MISSION_CONFIG } from './config.js';

/**
 * Mission Impossible Sender Logic
 * Handles form validation, URL generation, and link display.
 */

// Initialize functionality when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-link-btn');
    if (generateBtn) {
        generateBtn.addEventListener('click', handleGenerateClick);
    }

    // Enforce uppercase on all text inputs
    const inputs = document.querySelectorAll('input[type="text"], textarea');
    inputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const start = input.selectionStart;
            const end = input.selectionEnd;
            input.value = input.value.toUpperCase();
            input.setSelectionRange(start, end);
        });
    });

    // Start polling for feedback
    setInterval(checkMissionFeedback, 3000);
});

/**
 * Polls localStorage for new mission feedback
 */
function checkMissionFeedback() {
    try {
        const feedbackQueue = JSON.parse(localStorage.getItem('mission_feedback_queue') || '[]');
        const unreadFeedback = feedbackQueue.filter(item => !item.read);

        if (unreadFeedback.length > 0) {
            // Process one at a time to avoid spam
            const feedback = unreadFeedback[0];
            showNotification(feedback);

            // Mark as read
            feedback.read = true;

            // Update storage (marking the specific one as read)
            const updatedQueue = feedbackQueue.map(item =>
                item.id === feedback.id ? { ...item, read: true } : item
            );
            localStorage.setItem('mission_feedback_queue', JSON.stringify(updatedQueue));
        }
    } catch (e) {
        console.log('Feedback polling error or empty');
    }
}

/**
 * Displays a toast notification for mission feedback
 * @param {Object} feedback 
 */
function showNotification(feedback) {
    const toast = document.createElement('div');
    toast.className = 'feedback-toast';

    const isAccepted = feedback.response === 'ACCEPTED';
    const icon = isAccepted ? '✅' : '🚫';
    const accentColor = isAccepted ? 'var(--success-color)' : 'var(--error-color)';

    toast.style.borderColor = accentColor;

    toast.innerHTML = `
        <div class="feedback-icon">${icon}</div>
        <div class="feedback-content">
            <h4 class="feedback-title" style="color:${accentColor}">MISSION UPDATE</h4>
            <p class="feedback-message">
                AGENT <strong>${feedback.to}</strong> HAS <strong>${feedback.response}</strong> THE MISSION.
            </p>
        </div>
    `;

    // Add to body
    document.body.appendChild(toast);

    // Sound effect if available (optional, reusing type sound for now)
    const audio = new Audio('assets/sounds/type.mp3');
    audio.volume = 0.2;
    audio.play().catch(e => console.log('Audio blocked'));

    // Auto remove after 10 seconds
    setTimeout(() => {
        toast.classList.add('hiding');
        toast.addEventListener('animationend', () => toast.remove());
    }, 10000);

    // Click to remove immediately
    toast.addEventListener('click', () => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 500);
    });
}

/**
 * Handles the click event for the Generate button
 * @param {Event} e 
 */
function handleGenerateClick(e) {
    e.preventDefault();

    const formData = getFormData();

    if (validateData(formData)) {
        const missionUrl = generateMissionLink(formData);
        displayLink(missionUrl);
    }
}

/**
 * Retrieves values from the form inputs
 * @returns {Object} Data object containing form values
 */
function getFormData() {
    return {
        from: document.getElementById('sender-codename').value.trim(),
        to: document.getElementById('receiver-codename').value.trim(),
        tone: document.getElementById('tone-select').value,
        msg: document.getElementById('custom-message').value.trim()
    };
}

/**
 * Validates the form data
 * @param {Object} data - The form data object
 * @returns {boolean} True if valid, false otherwise
 */
function validateData(data) {
    const toInput = document.getElementById('receiver-codename');

    // Clear previous error states
    toInput.classList.remove('input-error');

    if (!data.to) {
        // Visual feedback for error
        toInput.classList.add('input-error');
        toInput.focus();

        // Optional: Shake animation or alert could go here 
        // (Assuming CSS handles .input-error styling)
        return false;
    }

    // Sender is optional, but we could warn if needed. 
    // Leaving optional per requirements.

    return true;
}

/**
 * Generates the shareable mission URL with encoded parameters
 * @param {Object} data - The form data object
 * @returns {string} The complete URL
 */
function generateMissionLink(data) {
    const params = new URLSearchParams();

    if (data.from) params.set('from', data.from);
    params.set('to', data.to);
    params.set('tone', data.tone);
    if (data.msg) params.set('msg', data.msg); // Encode custom message

    // Construct URL pointing to mission.html
    // Assumes mission.html is in the same directory as index.html
    const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/')) + '/mission.html';

    return `${baseUrl}?${params.toString()}`;
}

/**
 * Displays the generated link to the user
 * @param {string} url - The generated mission URL
 */
function displayLink(url) {
    let displayPanel = document.getElementById('mission-link-display');
    const formPanel = document.querySelector('.panel-body');

    // Create the display panel if it doesn't exist
    if (!displayPanel) {
        displayPanel = document.createElement('div');
        displayPanel.id = 'mission-link-display';
        displayPanel.className = 'link-result-panel fade-in-up';

        // Append after the form inside the main panel body, or after the form container
        formPanel.appendChild(displayPanel);
    }

    // Get tone color for accent
    const toneSelect = document.getElementById('tone-select');
    const currentTone = toneSelect.value;
    const toneConfig = MISSION_CONFIG.tones[currentTone];
    const accentColor = toneConfig ? `var(${toneConfig.colorVar})` : 'var(--primary-accent)';

    // Update content
    displayPanel.innerHTML = `
        <div class="mission-brief-line" style="border-color: ${accentColor}">
            <h3 class="result-title">MISSION LINK GENERATED</h3>
            <p class="result-instruction">SEND THIS SECURE UPLINK TO THE TARGET:</p>
            
            <div class="url-container">
                <input type="text" readonly value="${url}" class="terminal-input url-input" id="generated-url-input">
                <button type="button" class="btn secondary-btn" id="copy-btn">
                    COPY LINK
                </button>
            </div>
            
            <p class="copy-feedback" id="copy-feedback" style="visibility: hidden;">COPIED TO CLIPBOARD</p>
        </div>
    `;

    // Add Copy Logic
    const copyBtn = document.getElementById('copy-btn');
    const urlInput = document.getElementById('generated-url-input');
    const feedback = document.getElementById('copy-feedback');

    copyBtn.addEventListener('click', () => {
        urlInput.select();
        urlInput.setSelectionRange(0, 99999); // For mobile devices

        navigator.clipboard.writeText(url).then(() => {
            feedback.style.visibility = 'visible';
            feedback.classList.add('blinking');

            setTimeout(() => {
                feedback.style.visibility = 'hidden';
                feedback.classList.remove('blinking');
            }, 2000);
        });
    });

    // Scroll to the result
    displayPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
