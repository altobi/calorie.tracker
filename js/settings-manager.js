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

        // Apply calorie goal
        document.getElementById('dailyCalories').value = this.settings.dailyCalories;
        document.getElementById('dailyBudget').value = this.settings.dailyCalories;

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

    exportData() {
        const data = {
            settings: this.settings,
            foodData: foodSelector.foodData,
            mealLog: mealLogger.mealLog
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `calorie-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.addEventListener('change', async (e) => {
            try {
                const file = e.target.files[0];
                const text = await file.text();
                const data = JSON.parse(text);

                // Validate data structure
                if (!data.settings || !data.foodData || !data.mealLog) {
                    throw new Error('Invalid backup file format');
                }

                // Import settings
                this.settings = { ...this.settings, ...data.settings };
                this.saveSettings();

                // Import food data
                foodSelector.foodData = data.foodData;
                localStorage.setItem('foodData', JSON.stringify(data.foodData));
                foodSelector.renderCategories();

                // Import meal log
                mealLogger.mealLog = data.mealLog;
                mealLogger.saveMealLog();
                mealLogger.renderMealLog();

                alert('Data imported successfully!');
            } catch (error) {
                alert('Error importing data: ' + error.message);
            }
        });

        input.click();
    }

    confirmClearData() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <h3>Clear All Data</h3>
            <p>Are you sure you want to clear all data? This action cannot be undone.</p>
            <div class="modal-buttons">
                <button class="btn btn-danger" onclick="settingsManager.clearAllData()">
                    Clear All Data
                </button>
                <button class="btn" onclick="this.closest('.modal').remove()">
                    Cancel
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    clearAllData() {
        // Clear all localStorage
        localStorage.clear();

        // Reset settings
        this.settings = {
            theme: 'light',
            dailyCalories: 2000,
            systemTheme: false
        };
        this.saveSettings();

        // Reset food data
        foodSelector.foodData = { categories: {} };
        foodSelector.renderCategories();

        // Reset meal log
        mealLogger.mealLog = [];
        mealLogger.renderMealLog();

        // Hide modal
        document.querySelector('.modal')?.remove();

        // Show confirmation
        alert('All data has been cleared.');
    }
}

// Initialize settings manager
const settingsManager = new SettingsManager(); 