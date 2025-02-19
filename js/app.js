// Main application state
const state = {
    selectedCategory: null,
    selectedFoods: {},
    currentPage: 'calculator'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.currentMeal = {}; // Initialize currentMeal
    initializeApp();
    loadSavedState();
    setupEventListeners();
});

function initializeApp() {
    // Load theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Load calorie budget
    const budget = localStorage.getItem('calorieBudget') || 2000;
    document.getElementById('dailyBudget').value = budget;

    // Initialize mobile navigation
    setActivePage(state.currentPage);
}

function loadSavedState() {
    // Load selected foods
    const savedFoods = localStorage.getItem('selectedFoods');
    if (savedFoods) {
        try {
            state.selectedFoods = JSON.parse(savedFoods);
            // Only call if foodSelector exists
            if (window.foodSelector && typeof window.foodSelector.renderSelectedFoods === 'function') {
                foodSelector.renderSelectedFoods();
            }
        } catch (e) {
            console.error('Error loading saved foods:', e);
        }
    }
}

function setupEventListeners() {
    // Mobile navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.dataset.page;
            setActivePage(page);
        });
    });

    // Search functionality
    const searchInput = document.getElementById('foodSearch');
    if (searchInput) {
        searchInput.addEventListener('input', utils.debounce((e) => {
            if (window.foodSelector) {
                foodSelector.handleSearch(e.target.value);
            }
        }, 300));
    }

    // Calorie budget
    document.getElementById('dailyBudget').addEventListener('change', (e) => {
        const budget = parseInt(e.target.value) || 2000;
        localStorage.setItem('calorieBudget', budget);
        updateCalorieProgress();
    });
}

function setActivePage(page) {
    state.currentPage = page;
    document.body.dataset.page = page;
    
    // Update navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.page === page);
    });

    // Show/hide sections based on active page
    const sections = {
        calculator: document.querySelector('.main-content'),
        log: document.querySelector('.meal-log'),
        settings: document.querySelector('.settings-page')
    };

    Object.entries(sections).forEach(([key, element]) => {
        if (element) {
            element.style.display = key === page ? 'block' : 'none';
        }
    });
}

// Add the missing filterFoodItems function
function filterFoodItems(searchTerm) {
    if (!window.foodSelector) return [];
    
    const term = searchTerm.toLowerCase();
    const results = [];
    
    Object.entries(foodSelector.foodData.categories).forEach(([categoryKey, category]) => {
        Object.entries(category.items).forEach(([itemKey, item]) => {
            if (item.name.toLowerCase().includes(term)) {
                results.push({
                    ...item,
                    key: itemKey,
                    category: categoryKey
                });
            }
        });
    });
    
    return results;
}

// Make it globally available
window.filterFoodItems = filterFoodItems;

// Export state and functions for other modules
window.app = {
    state,
    setActivePage
};

function switchPage(page) {
    document.body.dataset.page = page;
    
    // Update active state of nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.page === page);
    });

    // Smooth transition between pages
    const pages = ['calculator', 'log', 'settings'];
    pages.forEach(p => {
        const section = document.querySelector(`.${p}-page`);
        if (section) {
            if (p === page) {
                section.style.display = 'block';
                // Add a small delay to trigger the transition
                setTimeout(() => {
                    section.style.opacity = '1';
                    section.style.transform = 'translateX(0)';
                }, 50);
            } else {
                section.style.opacity = '0';
                section.style.transform = 'translateX(20px)';
                setTimeout(() => {
                    section.style.display = 'none';
                }, 300);
            }
        }
    });
} 