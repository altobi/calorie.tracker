class MobileHandler {
    constructor() {
        this.init();
        this.setupEventListeners();
    }

    init() {
        this.populateCategorySelect();
        this.setupDateSelector();
        this.updatePageTitle(document.body.dataset.page || 'calculator');
    }

    setupEventListeners() {
        // Category and Food Selection
        const categorySelect = document.getElementById('mobileCategorySelect');
        const foodSelect = document.getElementById('mobileFoodSelect');

        categorySelect?.addEventListener('change', (e) => {
            this.handleCategoryChange(e.target.value);
        });

        foodSelect?.addEventListener('change', (e) => {
            this.handleFoodSelection(e.target.value);
        });

        // Page Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = btn.dataset.page;
                this.updatePageTitle(page);
            });
        });

        // Date Selection
        document.querySelector('.date-list')?.addEventListener('click', (e) => {
            const dateItem = e.target.closest('.date-item');
            if (dateItem) {
                this.handleDateSelection(dateItem.dataset.date);
            }
        });
    }

    updatePageTitle(page) {
        // Hide all titles
        document.querySelectorAll('.mobile-only.calculator-title, .mobile-only.log-title, .mobile-only.settings-title')
            .forEach(el => el.style.display = 'none');

        // Show current page title
        const titleMap = {
            calculator: '.calculator-title',
            log: '.log-title',
            settings: '.settings-title'
        };

        const titleElement = document.querySelector(titleMap[page]);
        if (titleElement) {
            titleElement.style.display = 'block';
        }
    }

    populateCategorySelect() {
        const select = document.getElementById('mobileCategorySelect');
        if (!select || !window.foodSelector) return;

        select.innerHTML = '<option value="">Select Category</option>';
        Object.entries(window.foodSelector.foodData).forEach(([key, category]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = category.name;
            select.appendChild(option);
        });
    }

    handleCategoryChange(categoryKey) {
        const foodSelect = document.getElementById('mobileFoodSelect');
        if (!foodSelect || !window.foodSelector) return;

        foodSelect.innerHTML = '<option value="">Select Food</option>';
        foodSelect.disabled = !categoryKey;

        if (categoryKey && window.foodSelector.foodData[categoryKey]) {
            const foods = window.foodSelector.foodData[categoryKey].items;
            Object.entries(foods).forEach(([key, food]) => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = `${key} (${food.calories} cal/100g)`;
                foodSelect.appendChild(option);
            });
        }
    }

    handleFoodSelection(foodKey) {
        const preview = document.getElementById('selectedFoodPreview');
        if (!preview || !foodKey) {
            preview.innerHTML = '';
            return;
        }

        const categoryKey = document.getElementById('mobileCategorySelect').value;
        const food = window.foodSelector.foodData[categoryKey].items[foodKey];

        preview.innerHTML = `
            <div class="food-item-main">
                <span class="food-item-name">${foodKey}</span>
                <span class="food-item-calories">${food.calories} cal/100g</span>
            </div>
            <div class="nutrition-info">
                <div>Protein: ${food.protein || 0}g</div>
                <div>Fat: ${food.fat || 0}g</div>
                <div>Carbs: ${food.carbs || 0}g</div>
            </div>
            <div class="food-item-actions">
                <button class="btn btn-primary btn-sm" onclick="mobileHandler.addFoodToMeal('${categoryKey}', '${foodKey}')">
                    Add to Meal
                </button>
                <button class="btn btn-secondary btn-sm" onclick="window.foodSelector.showEditFoodModal('${categoryKey}', '${foodKey}')">
                    Edit
                </button>
            </div>
        `;
    }

    addFoodToMeal(categoryKey, foodKey) {
        if (window.foodSelector) {
            window.foodSelector.addFoodToSelected(categoryKey, foodKey);
            // Clear selections
            document.getElementById('mobileFoodSelect').value = '';
            document.getElementById('selectedFoodPreview').innerHTML = '';
        }
    }

    setupDateSelector() {
        const dateList = document.querySelector('.date-list');
        if (!dateList) return;

        const today = new Date();
        const dates = [];

        // Generate dates for the last week and next week
        for (let i = -7; i <= 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date);
        }

        // Update month label
        const monthLabel = document.querySelector('.month-label');
        if (monthLabel) {
            monthLabel.textContent = today.toLocaleString('default', { month: 'long', year: 'numeric' });
        }

        // Create date items
        dateList.innerHTML = dates.map(date => {
            const isToday = date.toDateString() === today.toDateString();
            return `
                <div class="date-item ${isToday ? 'active' : ''}" 
                     data-date="${date.toISOString().split('T')[0]}">
                    <span class="date-weekday">${date.toLocaleString('default', { weekday: 'short' })}</span>
                    <span class="date-day">${date.getDate()}</span>
                </div>
            `;
        }).join('');
    }

    handleDateSelection(dateString) {
        document.querySelectorAll('.date-item').forEach(item => {
            item.classList.toggle('active', item.dataset.date === dateString);
        });

        // Update meal log to show selected date's entries
        if (window.mealLogger) {
            const selectedDate = new Date(dateString);
            const today = new Date();
            
            // Update calorie budget display
            const budget = localStorage.getItem('calorieBudget') || 2000;
            document.getElementById('dailyBudget').value = budget;
            
            // Filter meals for selected date
            const meals = window.mealLogger.mealLog.filter(meal => 
                meal.date === dateString
            );
            
            // Calculate total calories for the day
            const totalCalories = meals.reduce((sum, meal) => sum + meal.totalCalories, 0);
            const percentage = Math.min((totalCalories / budget) * 100, 100);
            
            // Update progress ring
            const circle = document.querySelector('.progress-ring-value');
            if (circle) {
                const radius = circle.r.baseVal.value;
                const circumference = radius * 2 * Math.PI;
                const offset = circumference - (percentage / 100 * circumference);
                circle.style.strokeDasharray = `${circumference} ${circumference}`;
                circle.style.strokeDashoffset = offset;
                circle.style.stroke = this.getColorForPercentage(percentage);
            }
            
            // Update percentage text
            document.getElementById('caloriePercentage').textContent = `${Math.round(percentage)}%`;
            
            // Update meal log display
            window.mealLogger.renderMealLog(meals);
        }
    }

    getColorForPercentage(percentage) {
        // Implement your logic to determine the color based on the percentage
        // This is a placeholder and should be replaced with your actual implementation
        return 'black';
    }
}

// Initialize mobile handler after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mobileHandler = new MobileHandler();
}); 