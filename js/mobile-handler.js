class MobileHandler {
    constructor() {
        this.init();
        this.setupEventListeners();
    }

    init() {
        this.populateCategorySelect();
        this.updatePageTitle(document.body.dataset.page || 'calculator');
        
        // Setup date selector when page loads or changes
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.dataset.page === 'log') {
                    // Wait for page transition
                    setTimeout(() => {
                        this.setupDateSelector();
                    }, 100);
                }
            });
        });

        // Initial setup
        if (document.body.dataset.page === 'log') {
            this.setupDateSelector();
        }
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
                
                // Remove active class from all buttons
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                btn.classList.add('active');
                
                // Update page title
                this.updatePageTitle(page);
                
                // Update body dataset
                document.body.dataset.page = page;
                
                // Additional page-specific setup
                if (page === 'log') {
                    setTimeout(() => {
                        this.setupDateSelector();
                    }, 100);
                }
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
        // Get all title elements
        const calculatorTitle = document.querySelector('.calculator-title');
        const logTitle = document.querySelector('.log-title');
        const settingsTitle = document.querySelector('.settings-title');

        // Hide all titles first
        if (calculatorTitle) calculatorTitle.style.display = 'none';
        if (logTitle) logTitle.style.display = 'none';
        if (settingsTitle) settingsTitle.style.display = 'none';

        // Show only the current page title
        switch (page) {
            case 'calculator':
                if (calculatorTitle) calculatorTitle.style.display = 'block';
                break;
            case 'log':
                if (logTitle) logTitle.style.display = 'block';
                break;
            case 'settings':
                if (settingsTitle) logTitle.style.display = 'block';
                break;
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
        if (!preview) return;
        
        if (!foodKey) {
            preview.classList.remove('show');
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
        preview.classList.add('show');
    }

    addFoodToMeal(categoryKey, foodKey) {
        if (window.foodSelector) {
            window.foodSelector.addFoodToSelected(categoryKey, foodKey);
            // Clear selections and hide preview
            document.getElementById('mobileFoodSelect').value = '';
            const preview = document.getElementById('selectedFoodPreview');
            preview.classList.remove('show');
            preview.innerHTML = '';
        }
    }

    setupDateSelector() {
        const dateList = document.querySelector('.date-list');
        if (!dateList) return;

        const today = new Date();
        const todayString = today.toISOString().split('T')[0];
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
            const dateString = date.toISOString().split('T')[0];
            return `
                <div class="date-item ${isToday ? 'active' : ''}" 
                     data-date="${dateString}">
                    <span class="date-weekday">${date.toLocaleString('default', { weekday: 'short' })}</span>
                    <span class="date-day">${date.getDate()}</span>
                </div>
            `;
        }).join('');

        // Center the active date
        this.centerActiveDate();

        // Show today's meals
        this.handleDateSelection(todayString);
    }

    handleDateSelection(dateString) {
        console.log('Date selected:', dateString);
        console.log('MealLogger exists:', !!window.mealLogger);
        console.log('MealLog exists:', !!window.mealLogger?.mealLog);
        console.log('Current mealLog:', window.mealLogger?.mealLog);

        // Update active state of date items
        document.querySelectorAll('.date-item').forEach(item => {
            item.classList.toggle('active', item.dataset.date === dateString);
        });

        if (!window.mealLogger || !window.mealLogger.mealLog) {
            console.log('No mealLogger or mealLog found');
            return;
        }

        // Get meals for the selected date
        const selectedMeals = window.mealLogger.mealLog.filter(meal => {
            try {
                // Get just the date part from the meal timestamp
                const mealDate = meal.date || meal.timestamp.split('T')[0];
                console.log('Comparing dates:', mealDate, dateString);
                return mealDate === dateString;
            } catch (e) {
                console.error('Error comparing dates:', e);
                return false;
            }
        });

        console.log('Selected meals:', selectedMeals);

        // Update calorie budget display
        const budget = parseInt(localStorage.getItem('calorieBudget')) || 2000;

        // Calculate total calories for the selected date
        const totalCalories = selectedMeals.reduce((sum, meal) => sum + meal.totalCalories, 0);
        const percentage = (totalCalories / budget) * 100;

        // Update progress ring
        const circle = document.querySelector('.progress-ring-value');
        if (circle) {
            const radius = circle.r.baseVal.value;
            const circumference = radius * 2 * Math.PI;
            const offset = circumference - (percentage / 100 * circumference);
            circle.style.strokeDasharray = `${circumference} ${circumference}`;
            circle.style.strokeDashoffset = offset;
            circle.style.stroke = this.getColorForPercentage(percentage);

            // Update percentage text
            const percentageText = document.getElementById('caloriePercentage');
            if (percentageText) {
                percentageText.textContent = `${Math.round(percentage)}%`;
            }
        }

        // Update meal log entries
        const mealLogEntries = document.querySelector('.meal-log-entries');
        const isMobile = window.innerWidth <= 768;

        if (mealLogEntries && isMobile) {
            if (selectedMeals.length > 0) {
                const mealHtml = selectedMeals.map(meal => {
                    console.log('Processing meal for delete:', meal); // Debug log to see meal structure
                    const mealType = meal.type ? meal.type.charAt(0).toUpperCase() + meal.type.slice(1) : '';
                    
                    // Handle different meal item structures
                    let itemsHtml = '';
                    if (meal.items) {
                        if (Array.isArray(meal.items)) {
                            itemsHtml = meal.items.map(item => `
                                <div class="meal-item">
                                    <span class="item-name">${item.name}</span>
                                    <span class="item-amount">${item.grams}g (${item.calories} cal)</span>
                                </div>
                            `).join('');
                        } else if (typeof meal.items === 'object') {
                            // If items is an object (key-value pairs)
                            itemsHtml = Object.entries(meal.items).map(([name, item]) => `
                                <div class="meal-item">
                                    <span class="item-name">${name}</span>
                                    <span class="item-amount">${item.grams || item.amount}g (${item.calories} cal)</span>
                                </div>
                            `).join('');
                        }
                    }

                    return `
                        <div class="meal-entry" data-meal-id="${meal.id}">
                            <div class="meal-entry-header">
                                <span class="meal-time">${mealType}</span>
                                <div class="meal-actions">
                                    <span class="meal-calories">${meal.totalCalories} cal</span>
                                    <button class="btn btn-icon" onclick="window.mealLogger.editMeal(${meal.id})">
                                        <span class="material-icons">edit</span>
                                    </button>
                                    <button class="btn btn-icon" onclick="window.mealLogger.deleteMeal(${meal.id})">
                                        <span class="material-icons">delete</span>
                                    </button>
                                </div>
                            </div>
                            <div class="meal-items">
                                ${itemsHtml}
                            </div>
                        </div>
                    `;
                }).join('');

                mealLogEntries.innerHTML = mealHtml;
            } else {
                // Format the "no meals" date
                let formattedDate = dateString;
                try {
                    const date = new Date(dateString);
                    if (!isNaN(date.getTime())) { // Check if date is valid
                        formattedDate = date.toLocaleDateString(undefined, {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        });
                    }
                } catch (e) {
                    console.error('Error formatting date:', e);
                }
                
                mealLogEntries.innerHTML = `
                    <div class="no-meals">
                        <p>No meals logged for ${formattedDate}</p>
                    </div>
                `;
            }
        } else if (!isMobile) {
            // On desktop, let the original meal logger handle it
            window.mealLogger.renderMealLog();
        }
    }

    getColorForPercentage(percentage) {
        if (percentage <= 50) return '#4CAF50';  // Green
        if (percentage <= 75) return '#FFC107';  // Yellow
        if (percentage <= 100) return '#FF9800'; // Orange
        return '#F44336';  // Red for over 100%
    }

    // Separate method for centering
    centerActiveDate() {
        // Wait for the DOM to be fully rendered and measurements to be accurate
        setTimeout(() => {
            const dateList = document.querySelector('.date-list');
            const activeDate = dateList?.querySelector('.date-item.active');
            
            if (dateList && activeDate) {
                // Calculate the scroll position to center the active date
                const scrollOffset = activeDate.offsetLeft - (dateList.offsetWidth / 2) + (activeDate.offsetWidth / 2);
                dateList.scrollLeft = scrollOffset;
            }
        }, 100);
    }
}

// Initialize mobile handler after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mobileHandler = new MobileHandler();
});

// Add a resize handler to switch rendering modes
window.addEventListener('resize', utils.debounce(() => {
    const isMobile = window.innerWidth <= 768;
    if (document.body.dataset.page === 'log') {
        if (isMobile) {
            const activeDate = document.querySelector('.date-item.active');
            if (activeDate) {
                window.mobileHandler.handleDateSelection(activeDate.dataset.date);
            }
        } else {
            // Reset to desktop view
            const mealLogEntries = document.querySelector('.meal-log-entries');
            if (mealLogEntries) {
                mealLogEntries.innerHTML = ''; // Clear mobile styling
                window.mealLogger.renderMealLog(); // Re-render with desktop styling
            }
            
            // Remove any mobile-specific classes
            document.querySelectorAll('.meal-entry').forEach(entry => {
                entry.classList.remove('mobile-meal-entry');
            });
        }
    }
}, 250)); 