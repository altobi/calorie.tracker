// Utility functions for the application
const utils = {
    // Date formatting
    formatDate(date) {
        return new Date(date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    // Number formatting
    formatNumber(number, decimals = 0) {
        return Number(number).toFixed(decimals);
    },

    // Debounce function for search
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Safe localStorage wrapper
    storage: {
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('Error saving to localStorage:', e);
                return false;
            }
        },

        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.error('Error reading from localStorage:', e);
                return defaultValue;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.error('Error removing from localStorage:', e);
                return false;
            }
        }
    },

    // DOM helpers
    createElement(tag, className, innerHTML) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    },

    // Animation helpers
    animate(element, keyframes, options) {
        return element.animate(keyframes, {
            duration: 300,
            easing: 'ease-in-out',
            ...options
        });
    },

    // Search helper
    searchItems(items, searchTerm) {
        const term = searchTerm.toLowerCase();
        return items.filter(item => 
            item.name.toLowerCase().includes(term) ||
            item.category?.toLowerCase().includes(term)
        );
    },

    // Validation helpers
    isValidNumber(value) {
        return !isNaN(value) && isFinite(value) && value >= 0;
    },

    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    },

    // Error handling
    handleError(error, fallback = null) {
        console.error('Error:', error);
        return fallback;
    },

    // Mobile detection
    isMobile() {
        return window.innerWidth <= 768;
    },

    // Color helpers
    getContrastColor(hexcolor) {
        const r = parseInt(hexcolor.slice(1, 3), 16);
        const g = parseInt(hexcolor.slice(3, 5), 16);
        const b = parseInt(hexcolor.slice(5, 7), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '#000000' : '#ffffff';
    }
};

// Make utils globally available
window.utils = utils; 