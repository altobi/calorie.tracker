class SettingsManager {
    constructor() {
        this.settings = {
            theme: 'light',
            dailyCalories: 2000,
            systemTheme: false
        };
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.setupSystemThemeDetection();
        this.initializeTheme();
        this.setupSettingsModal();
    }

    loadSettings() {
        const savedSettings = utils.storage.get('settings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...savedSettings };
        }
        this.applySettings();
    }

    saveSettings() {
        utils.storage.set('settings', this.settings);
        this.applySettings();
    }

    applySettings() {
        // Apply theme
        if (this.settings.systemTheme) {
            this.applySystemTheme();
        } else {
            document.documentElement.setAttribute('data-theme', this.settings.theme);
        }

        // Apply calorie goal - only if elements exist
        const dailyCaloriesInput = document.getElementById('dailyCalories');
        const dailyBudgetInput = document.getElementById('dailyBudget');
        
        if (dailyCaloriesInput) dailyCaloriesInput.value = this.settings.dailyCalories;
        if (dailyBudgetInput) dailyBudgetInput.value = this.settings.dailyCalories;

        // Update theme selector
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.value = this.settings.systemTheme ? 'system' : this.settings.theme;
        }
    }

    setupSystemThemeDetection() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', () => {
            if (this.settings.systemTheme) {
                this.applySystemTheme();
            }
        });
    }

    applySystemTheme() {
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    }

    setupEventListeners() {
        // Theme selection
        document.getElementById('themeSelect')?.addEventListener('change', (e) => {
            const value = e.target.value;
            if (value === 'system') {
                this.settings.systemTheme = true;
                this.applySystemTheme();
            } else {
                this.settings.systemTheme = false;
                this.settings.theme = value;
                document.documentElement.setAttribute('data-theme', value);
            }
            this.saveSettings();
        });

        // Daily calorie goal
        document.getElementById('dailyCalories')?.addEventListener('change', (e) => {
            this.settings.dailyCalories = parseInt(e.target.value) || 2000;
            this.saveSettings();
            mealLogger.updateCalorieProgress();
        });
    }

    exportMealLog() {
        const mealLog = JSON.parse(localStorage.getItem('mealLog') || '[]');
        
        // Format the meal log into readable text
        const formattedLog = mealLog.map(meal => {
            const date = new Date(meal.date).toLocaleDateString();
            const items = Object.values(meal.items)
                .map(item => `  • ${item.name}: ${item.amount}g (${item.calories} calories)`)
                .join('\n');

            return `${date} - ${meal.type.toUpperCase()}\n` +
                   `${items}\n` +
                   `Total Calories: ${meal.totalCalories}\n` +
                   `----------------------------------------`;
        }).join('\n\n');

        const header = "MEAL LOG\n" +
                      "========\n\n";

        const content = header + formattedLog;

        // Create and download text file
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meal-log-${new Date().toLocaleDateString().replace(/\//g, '-')}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    confirmClearData() {
        if (confirm('Are you sure you want to reset all data to defaults? This will remove all saved meals but keep your theme settings.')) {
            this.clearAllData();
        }
    }

    clearAllData() {
        // Clear all localStorage except theme settings
        const currentTheme = localStorage.getItem('theme');
        const currentSystemTheme = this.settings.systemTheme;
        localStorage.clear();
        
        // Restore theme settings
        if (currentTheme) {
            localStorage.setItem('theme', currentTheme);
        }

        // Reset settings to defaults but keep theme
        this.settings = {
            theme: this.settings.theme,
            dailyCalories: 2000,
            systemTheme: currentSystemTheme
        };
        this.saveSettings();

        // Reset food data to defaults and save to storage
        utils.storage.set('foodData', defaultFoodData);

        // Reload the page to ensure everything is fresh
        window.location.reload();
    }

    initializeTheme() {
        // Check if user has previously set a theme
        const savedTheme = localStorage.getItem('theme');
        
        if (!savedTheme) {
            // Use system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
            }
        } else {
            // Use saved theme
            document.documentElement.setAttribute('data-theme', savedTheme);
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (!localStorage.getItem('theme')) {
                document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            }
        });
    }

    setupSettingsModal() {
        // Create backdrop if it doesn't exist (only for desktop)
        if (window.innerWidth >= 769) {
            let backdrop = document.querySelector('.settings-backdrop');
            if (!backdrop) {
                backdrop = document.createElement('div');
                backdrop.className = 'settings-backdrop';
                document.body.appendChild(backdrop);
            }
        }

        // Setup event listeners
        const settingsBtn = document.getElementById('settingsBtn');
        const closeBtn = document.getElementById('closeSettingsBtn');
        const isMobile = window.innerWidth < 769;

        settingsBtn?.addEventListener('click', () => {
            if (isMobile) {
                document.body.dataset.page = 'settings';
            } else {
                document.querySelector('.settings-backdrop')?.classList.add('show');
            }
            document.querySelector('.settings-page').classList.add('show');
        });

        closeBtn?.addEventListener('click', () => {
            this.hideSettings();
        });

        document.querySelector('.settings-backdrop')?.addEventListener('click', () => {
            this.hideSettings();
        });

        // Update the reset defaults button structure
        const resetContainer = document.querySelector('.setting-item:has(button.btn-danger)');
        if (resetContainer) {
            resetContainer.innerHTML = `
                <div class="reset-buttons">
                    <button class="btn btn-danger" id="resetDefaultsBtn">
                        Reset to Defaults
                    </button>
                    <button class="btn btn-danger" id="confirmResetBtn" style="display: none;">
                        Confirm Reset
                    </button>
                </div>
                <p class="setting-description">
                    This will reset all data to default values and remove saved meals
                </p>
            `;

            const resetBtn = document.getElementById('resetDefaultsBtn');
            const confirmBtn = document.getElementById('confirmResetBtn');

            resetBtn.addEventListener('click', () => {
                resetBtn.style.display = 'none';
                confirmBtn.style.display = 'inline-block';
                
                // Hide confirm button after 3 seconds if not clicked
                setTimeout(() => {
                    resetBtn.style.display = 'inline-block';
                    confirmBtn.style.display = 'none';
                }, 3000);
            });

            confirmBtn.addEventListener('click', () => {
                this.clearAllData();
            });
        }

        // Update export functionality
        const exportBtn = document.getElementById('exportDataBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportMealLog());
        }

        // Remove import button from HTML
        const importBtn = document.getElementById('importDataBtn');
        if (importBtn) {
            importBtn.remove();
        }

        // Add to Home Screen functionality
        const addToHomeBtn = document.getElementById('addToHomeBtn');
        if (addToHomeBtn) {
            // Only show on mobile and if the feature is available
            if (window.matchMedia('(display-mode: browser)').matches && 
                ('beforeinstallprompt' in window || 
                 (navigator.standalone === false && /(iPhone|iPod|iPad)/i.test(navigator.userAgent)))) {
                
                addToHomeBtn.style.display = 'block';
                
                // For Android
                let deferredPrompt;
                window.addEventListener('beforeinstallprompt', (e) => {
                    e.preventDefault();
                    deferredPrompt = e;
                });
                
                addToHomeBtn.addEventListener('click', async () => {
                    if (deferredPrompt) {
                        // Android
                        deferredPrompt.prompt();
                        const { outcome } = await deferredPrompt.userChoice;
                        deferredPrompt = null;
                    } else if (/(iPhone|iPod|iPad)/i.test(navigator.userAgent)) {
                        // iOS
                        alert('To add to home screen: tap the share button below (rectangle with arrow pointing up) and select "Add to Home Screen"');
                    }
                });
            } else {
                addToHomeBtn.style.display = 'none';
            }
        }
    }

    hideSettings() {
        const isMobile = window.innerWidth < 769;
        if (isMobile) {
            document.body.dataset.page = 'calculator';
        } else {
            document.querySelector('.settings-backdrop')?.classList.remove('show');
        }
        document.querySelector('.settings-page')?.classList.remove('show');
    }
}

// Initialize settings manager
const settingsManager = new SettingsManager(); 