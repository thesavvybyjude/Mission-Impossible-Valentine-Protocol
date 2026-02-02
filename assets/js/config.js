/**
 * Mission Impossible Dashboard Configuration
 * Central configuration for the Valentine's interactive experience.
 */

export const MISSION_CONFIG = {
    // Speed of value typing in milliseconds per character (lower is faster)
    typingSpeed: 50,

    // Time in seconds for the self-destruct sequence
    selfDestructCountdown: 5,

    // Boot sequence simulated text
    bootText: [
        "INITIALIZE SECURE CHANNEL...",
        "LOADING MISSION DATA..."
    ],

    // Main mission briefing text
    // Placeholders: [SENDER_CODENAME], [RECEIVER_CODENAME]
    briefing: [
        "Your mission, should you choose to accept it...",
        "Agent [RECEIVER_CODENAME],",
        "[SENDER_CODENAME] has a confidential message for you.",
        "Will you be my Valentine?"
    ],

    // User choices for the mission
    choices: {
        accept: "ACCEPT MISSION",
        decline: "DECLINE (RISK DISAVOWAL)"
    },

    // Responses based on user choice
    // Placeholder: {COUNTDOWN}
    responses: {
        accept: [
            "MISSION CONFIRMED.",
            "DOWNLOADING TARGET COORDINATES...",
            "RENDEZVOUS VECTOR LOCKED.",
            "THIS MESSAGE WILL SELF-DESTRUCT IN {COUNTDOWN} SECONDS..."
        ],
        decline: [
            "MISSION DECLINED.",
            "COMMUNICATIONS TERMINATED.",
            "AGENT DISAVOWED.",
            "SYSTEM PURGE INITIATED IN {COUNTDOWN} SECONDS..."
        ]
    },

    // Atmospheric tone presets
    // Maps tones to specific CSS variables for dynamic theming
    tones: {
        playful: {
            colorVar: "--playful-color",
            emoji: "🎉"
        },
        romantic: {
            colorVar: "--romantic-color",
            emoji: "❤️"
        },
        dramatic: {
            colorVar: "--dramatic-color",
            emoji: "🕶️"
        }
    },

    // Reference to main CSS theme variables
    // These keys match the CSS variable names used in the stylesheet
    cssColors: {
        bgColor: "--bg-color",
        surfaceColor: "--surface-color",
        primaryAccent: "--primary-accent",
        secondaryAccent: "--secondary-accent",
        textMain: "--text-main"
    }
};
