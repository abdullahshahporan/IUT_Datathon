export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                ink: {
                    950: "#050816",
                    900: "#091022",
                    850: "#101a33",
                    800: "#16213d",
                    700: "#223154",
                },
                aurora: {
                    400: "#5eead4",
                    500: "#14b8a6",
                    600: "#0f766e",
                },
                ember: {
                    400: "#f59e0b",
                    500: "#d97706",
                },
                rose: {
                    400: "#fb7185",
                },
            },
            boxShadow: {
                glass: "0 18px 48px rgba(5, 8, 22, 0.45)",
            },
            backgroundImage: {
                "office-grid": "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
                "aurora-radial": "radial-gradient(circle at top left, rgba(20, 184, 166, 0.2), transparent 30%), radial-gradient(circle at 80% 10%, rgba(217, 119, 6, 0.16), transparent 24%), radial-gradient(circle at 50% 100%, rgba(251, 113, 133, 0.12), transparent 25%)",
            },
            keyframes: {
                drift: {
                    "0%, 100%": { transform: "translate3d(0, 0, 0)" },
                    "50%": { transform: "translate3d(0, -8px, 0)" },
                },
                pulseGlow: {
                    "0%, 100%": { opacity: "0.65", transform: "scale(1)" },
                    "50%": { opacity: "1", transform: "scale(1.05)" },
                },
                spinSlow: {
                    from: { transform: "rotate(0deg)" },
                    to: { transform: "rotate(360deg)" },
                },
            },
            animation: {
                drift: "drift 8s ease-in-out infinite",
                pulseGlow: "pulseGlow 2.8s ease-in-out infinite",
                spinSlow: "spinSlow 5s linear infinite",
            },
            fontFamily: {
                sans: ["Inter", "ui-sans-serif", "system-ui"],
                display: ["Space Grotesk", "ui-sans-serif", "system-ui"],
            },
        },
    },
    plugins: [],
};
