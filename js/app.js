// Main application state
const state = {
    selectedCategory: null,
    selectedFoods: {},
    currentPage: 'calculator'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
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
    // Load selected foods from localStorage
    const savedFoods = localStorage.getItem('selectedFoods');
    if (savedFoods) {
        state.selectedFoods = JSON.parse(savedFoods);
        renderSelectedFoods();
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
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterFoodItems(searchTerm);
    });

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

// Export state and functions for other modules
window.app = {
    state,
    setActivePage
}; 