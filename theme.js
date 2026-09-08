(function () {

    const themes = {
        light: {
            name: "☀️ Light",
            bg: "#f7f9ff",
            surface: "#ffffff",
            surfaceSoft: "#f1f4ff",
            text: "#17213f",
            muted: "#69738f",
            border: "#e3e7f5",
            primary: "#5b6cff",
            primaryDark: "#4655e8"
        },

        dark: {
            name: "🌙 Dark",
            bg: "#0f172a",
            surface: "#111827",
            surfaceSoft: "#1e293b",
            text: "#f8fafc",
            muted: "#94a3b8",
            border: "#334155",
            primary: "#818cf8",
            primaryDark: "#6366f1"
        },

        lavender: {
            name: "💜 Lavender",
            bg: "#faf7ff",
            surface: "#ffffff",
            surfaceSoft: "#f3e8ff",
            text: "#2e1065",
            muted: "#7c6f9b",
            border: "#e9d5ff",
            primary: "#8b5cf6",
            primaryDark: "#7c3aed"
        },

        ocean: {
            name: "🌊 Ocean",
            bg: "#f0f9ff",
            surface: "#ffffff",
            surfaceSoft: "#e0f2fe",
            text: "#082f49",
            muted: "#5b7890",
            border: "#bae6fd",
            primary: "#0284c7",
            primaryDark: "#0369a1"
        },

        mint: {
            name: "🌿 Mint",
            bg: "#f0fdf4",
            surface: "#ffffff",
            surfaceSoft: "#dcfce7",
            text: "#14532d",
            muted: "#62806d",
            border: "#bbf7d0",
            primary: "#16a34a",
            primaryDark: "#15803d"
        }
    };

    const savedTheme =
        localStorage.getItem("foclyraTheme") || "light";

    applyTheme(
        themes[savedTheme]
            ? savedTheme
            : "light"
    );

    function applyTheme(themeName) {

        const theme = themes[themeName];

        if (!theme) return;

        document.documentElement.setAttribute(
            "data-theme",
            themeName
        );

        const root =
            document.documentElement;

        root.style.setProperty(
            "--foclyra-bg",
            theme.bg
        );

        root.style.setProperty(
            "--foclyra-surface",
            theme.surface
        );

        root.style.setProperty(
            "--foclyra-soft",
            theme.surfaceSoft
        );

        root.style.setProperty(
            "--foclyra-text",
            theme.text
        );

        root.style.setProperty(
            "--foclyra-muted",
            theme.muted
        );

        root.style.setProperty(
            "--foclyra-border",
            theme.border
        );

        root.style.setProperty(
            "--foclyra-primary",
            theme.primary
        );

        root.style.setProperty(
            "--foclyra-primary-dark",
            theme.primaryDark
        );

        localStorage.setItem(
            "foclyraTheme",
            themeName
        );
    }

    function injectThemeCSS() {

        if (
            document.getElementById(
                "foclyra-theme-css"
            )
        ) {
            return;
        }

        const style =
            document.createElement("style");

        style.id =
            "foclyra-theme-css";

        style.textContent = `
            :root {
                --foclyra-bg: #f7f9ff;
                --foclyra-surface: #ffffff;
                --foclyra-soft: #f1f4ff;
                --foclyra-text: #17213f;
                --foclyra-muted: #69738f;
                --foclyra-border: #e3e7f5;
                --foclyra-primary: #5b6cff;
                --foclyra-primary-dark: #4655e8;
            }

            body {
                background: var(--foclyra-bg) !important;
                color: var(--foclyra-text);
                transition:
                    background 0.25s ease,
                    color 0.25s ease;
            }

            .navbar {
                background: var(--foclyra-surface) !important;
                border-color: var(--foclyra-border) !important;
            }

            .logo {
                color: var(--foclyra-primary) !important;
            }

            .nav-links a {
                color: var(--foclyra-text) !important;
            }

            .nav-links a:hover {
                color: var(--foclyra-primary) !important;
            }

            input,
            textarea,
            select {
                background: var(--foclyra-surface) !important;
                color: var(--foclyra-text) !important;
                border-color: var(--foclyra-border) !important;
            }

            input::placeholder,
            textarea::placeholder {
                color: var(--foclyra-muted) !important;
            }

            .planner-container,
            .chat-container,
            .ai-info,
            .context-box,
            .dashboard-card,
            .feature-card,
            .card,
            .hero-card,
            .dashboard-preview {
                background: var(--foclyra-surface) !important;
                border-color: var(--foclyra-border) !important;
            }

            .chat-header,
            .input-area {
                border-color: var(--foclyra-border) !important;
            }

            p,
            .muted,
            .chat-subtitle,
            .input-hint {
                color: var(--foclyra-muted);
            }

            #foclyraThemeButton {
                border: 1px solid var(--foclyra-border);
                background: var(--foclyra-soft);
                color: var(--foclyra-text);
                padding: 9px 13px;
                border-radius: 10px;
                font-weight: 700;
                cursor: pointer;
                font-family: inherit;
                transition: 0.2s ease;
            }

            #foclyraThemeButton:hover {
                transform: translateY(-1px);
                border-color: var(--foclyra-primary);
            }

            #foclyraThemeMenu {
                position: fixed;
                z-index: 999999;
                min-width: 170px;
                padding: 8px;
                background: var(--foclyra-surface);
                border: 1px solid var(--foclyra-border);
                border-radius: 14px;
                box-shadow:
                    0 15px 40px rgba(15, 23, 42, 0.16);
            }

            #foclyraThemeMenu button {
                display: block;
                width: 100%;
                border: 0;
                background: transparent;
                color: var(--foclyra-text);
                text-align: left;
                padding: 11px 12px;
                border-radius: 9px;
                cursor: pointer;
                font-family: inherit;
                font-weight: 650;
            }

            #foclyraThemeMenu button:hover {
                background: var(--foclyra-soft);
                color: var(--foclyra-primary);
            }

            [data-theme="dark"] .hero-card,
            [data-theme="dark"] .dashboard-preview {
                box-shadow:
                    0 15px 40px rgba(0,0,0,0.25);
            }

            [data-theme="dark"] .message.ai,
            [data-theme="dark"] .message.assistant .bubble {
                background: #1e293b !important;
                color: #e2e8f0 !important;
                border-color: #334155 !important;
            }

            [data-theme="dark"] .message.user {
                background: var(--foclyra-primary) !important;
            }
        `;

        document.head.appendChild(style);
    }

    function createThemeButton() {

        const nav =
            document.querySelector(".nav-links");

        if (!nav) {
            return;
        }

        if (
            document.getElementById(
                "foclyraThemeButton"
            )
        ) {
            return;
        }

        const button =
            document.createElement("button");

        button.id =
            "foclyraThemeButton";

        button.type =
            "button";

        button.textContent =
            "🎨 Theme";

        nav.appendChild(button);

        button.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                const oldMenu =
                    document.getElementById(
                        "foclyraThemeMenu"
                    );

                if (oldMenu) {
                    oldMenu.remove();
                    return;
                }

                const menu =
                    document.createElement("div");

                menu.id =
                    "foclyraThemeMenu";

                Object.keys(themes).forEach(
                    function (themeName) {

                        const option =
                            document.createElement("button");

                        option.type =
                            "button";

                        option.textContent =
                            themes[themeName].name;

                        option.dataset.theme =
                            themeName;

                        option.addEventListener(
                            "click",
                            function (event) {

                                event.stopPropagation();

                                applyTheme(
                                    themeName
                                );

                                menu.remove();
                            }
                        );

                        menu.appendChild(option);
                    }
                );

                document.body.appendChild(menu);

                const rect =
                    button.getBoundingClientRect();

                menu.style.top =
                    (rect.bottom + 8) + "px";

                menu.style.left =
                    Math.max(
                        10,
                        rect.right - 170
                    ) + "px";
            }
        );
    }

    document.addEventListener(
        "click",
        function (event) {

            const menu =
                document.getElementById(
                    "foclyraThemeMenu"
                );

            const button =
                document.getElementById(
                    "foclyraThemeButton"
                );

            if (
                menu &&
                !menu.contains(event.target) &&
                event.target !== button
            ) {
                menu.remove();
            }
        }
    );

    injectThemeCSS();

    document.addEventListener(
        "DOMContentLoaded",
        function () {
            createThemeButton();
        }
    );

})();