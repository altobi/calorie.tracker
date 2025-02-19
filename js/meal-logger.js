class MealLogger {
    constructor() {
        this.mealLog = [];
        this.init();
    }

    init() {
        this.loadMealLog();
        this.setupEventListeners();
        this.renderMealLog();
        this.updateCalorieProgress();
    }

    loadMealLog() {
        const savedLog = localStorage.getItem('mealLog');
        this.mealLog = savedLog ? JSON.parse(savedLog) : [];
    }

    saveMealLog() {
        localStorage.setItem('mealLog', JSON.stringify(this.mealLog));
        this.updateCalorieProgress();
    }

    renderMealLog() {
        const logContainer = document.querySelector('.meal-log-entries');
        logContainer.innerHTML = '';

        // Group entries by date
        const groupedEntries = this.groupEntriesByDate();
        
        Object.entries(groupedEntries)
            .sort(([a], [b]) => new Date(b) - new Date(a))
            .forEach(([date, entries]) => {
                const dateSection = this.createDateSection(date, entries);
                logContainer.appendChild(dateSection);
            });
    }

    groupEntriesByDate() {
        return this.mealLog.reduce((groups, entry) => {
            if (!groups[entry.date]) {
                groups[entry.date] = [];
            }
            groups[entry.date].push(entry);
            return groups;
        }, {});
    }

    createDateSection(date, entries) {
        const section = document.createElement('div');
        section.className = 'meal-log-date';

        const totalCalories = entries.reduce((sum, entry) => 
            sum + this.calculateMealCalories(entry.items), 0);

        section.innerHTML = `
            <h3>
                ${new Date(date).toLocaleDateString()}
                <span>${Math.round(totalCalories)} calories</span>
            </h3>
            ${entries.map(entry => this.createMealEntry(entry)).join('')}
        `;

        return section;
    }

    createMealEntry(entry) {
        const itemsList = Object.entries(entry.items)
            .map(([key, item]) => `${item.name}: ${item.amount}g (${Math.round(item.calories * item.amount / 100)} cal)`)
            .join(', ');

        return `
            <div class="meal-entry" data-meal-id="${entry.id}">
                <div class="meal-entry-type">${entry.type}</div>
                <div class="meal-entry-items">${itemsList}</div>
                <div class="meal-entry-total">
                    Total: ${Math.round(this.calculateMealCalories(entry.items))} calories
                </div>
                <div class="meal-entry-controls">
                    <button class="btn btn-primary" onclick="mealLogger.editMeal(${entry.id})">
                        Edit
                    </button>
                    <button class="btn btn-danger" onclick="mealLogger.deleteMeal(${entry.id})">
                        Delete
                    </button>
                </div>
            </div>
        `;
    }

    calculateMealCalories(items) {
        return Object.values(items).reduce((sum, item) => 
            sum + (item.calories * item.amount / 100), 0);
    }

    showLogMealModal() {
        const modal = document.getElementById('editMealModal');
        modal.innerHTML = `
            <h3>Log Meal</h3>
            <div class="modal-content">
                <select id="mealType">
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                </select>
                <input type="date" id="mealDate" value="${new Date().toISOString().split('T')[0]}">
                <div class="selected-foods">
                    ${this.renderSelectedFoodsForModal()}
                </div>
            </div>
            <div class="modal-buttons">
                <button class="btn btn-primary" onclick="mealLogger.logMeal()">Save</button>
                <button class="btn" onclick="mealLogger.hideModal()">Cancel</button>
            </div>
        `;
        
        this.showModal(modal);
    }

    renderSelectedFoodsForModal() {
        return Object.entries(app.state.selectedFoods)
            .map(([key, food]) => `
                <div class="modal-food-item">
                    <span>${food.name}: ${food.amount}g</span>
                    <span>(${Math.round(food.calories * food.amount / 100)} cal)</span>
                </div>
            `).join('');
    }

    logMeal() {
        const type = document.getElementById('mealType').value;
        const date = document.getElementById('mealDate').value;
        
        const meal = {
            id: Date.now(),
            type,
            date,
            items: {...app.state.selectedFoods}
        };

        this.mealLog.push(meal);
        this.saveMealLog();
        this.renderMealLog();
        this.hideModal();

        // Clear selected foods
        app.state.selectedFoods = {};
        foodSelector.renderSelectedFoods();
    }

    editMeal(mealId) {
        const meal = this.mealLog.find(m => m.id === mealId);
        if (!meal) return;

        const modal = document.getElementById('editMealModal');
        modal.innerHTML = `
            <h3>Edit Meal</h3>
            <div class="modal-content">
                <select id="editMealType" value="${meal.type}">
                    <option value="breakfast" ${meal.type === 'breakfast' ? 'selected' : ''}>Breakfast</option>
                    <option value="lunch" ${meal.type === 'lunch' ? 'selected' : ''}>Lunch</option>
                    <option value="dinner" ${meal.type === 'dinner' ? 'selected' : ''}>Dinner</option>
                    <option value="snack" ${meal.type === 'snack' ? 'selected' : ''}>Snack</option>
                </select>
                <input type="date" id="editMealDate" value="${meal.date}">
                <div class="edit-foods">
                    ${this.renderEditableFoods(meal.items)}
                </div>
                <button class="btn btn-primary" onclick="mealLogger.showAddFoodToMeal(${mealId})">
                    Add Food
                </button>
            </div>
            <div class="modal-buttons">
                <button class="btn btn-primary" onclick="mealLogger.saveMealEdit(${mealId})">
                    Save Changes
                </button>
                <button class="btn" onclick="mealLogger.hideModal()">Cancel</button>
            </div>
        `;
        
        this.showModal(modal);
    }

    renderEditableFoods(items) {
        return Object.entries(items)
            .map(([key, food]) => `
                <div class="edit-food-item" data-food-key="${key}">
                    <span>${food.name}</span>
                    <div class="amount-controls">
                        <button onclick="mealLogger.adjustEditAmount('${key}', -1)">-</button>
                        <input type="number" value="${food.amount}" 
                               onchange="mealLogger.updateEditAmount('${key}', this.value)">
                        <button onclick="mealLogger.adjustEditAmount('${key}', 1)">+</button>
                    </div>
                    <button class="btn-danger" onclick="mealLogger.removeEditFood('${key}')">×</button>
                </div>
            `).join('');
    }

    saveMealEdit(mealId) {
        const meal = this.mealLog.find(m => m.id === mealId);
        if (!meal) return;

        meal.type = document.getElementById('editMealType').value;
        meal.date = document.getElementById('editMealDate').value;
        
        this.saveMealLog();
        this.renderMealLog();
        this.hideModal();
    }

    deleteMeal(mealId) {
        if (confirm('Are you sure you want to delete this meal?')) {
            this.mealLog = this.mealLog.filter(meal => meal.id !== mealId);
            this.saveMealLog();
            this.renderMealLog();
        }
    }

    updateCalorieProgress() {
        const budget = parseInt(localStorage.getItem('calorieBudget')) || 2000;
        const today = new Date().toISOString().split('T')[0];
        
        const todayEntries = this.mealLog.filter(entry => entry.date === today);
        const todayCalories = todayEntries.reduce((sum, entry) => 
            sum + this.calculateMealCalories(entry.items), 0);
        
        const percentage = Math.min((todayCalories / budget) * 100, 100);
        
        // Update progress ring
        const circle = document.querySelector('.progress-ring-value');
        if (circle) {
            const radius = circle.r.baseVal.value;
            const circumference = radius * 2 * Math.PI;
            const offset = circumference - (percentage / 100 * circumference);
            
            circle.style.strokeDasharray = `${circumference} ${circumference}`;
            circle.style.strokeDashoffset = offset;
            
            // Update color based on percentage
            circle.style.stroke = this.getColorForPercentage(percentage);
        }
        
        // Update percentage text
        const percentageText = document.getElementById('caloriePercentage');
        if (percentageText) {
            percentageText.textContent = `${Math.round(percentage)}%`;
        }
    }

    getColorForPercentage(percentage) {
        if (percentage <= 50) return '#4CAF50';
        if (percentage <= 75) return '#FFC107';
        if (percentage <= 90) return '#FF9800';
        return '#F44336';
    }

    showModal(modal) {
        document.getElementById('modalBackdrop').style.display = 'block';
        modal.style.display = 'block';
    }

    hideModal() {
        document.getElementById('modalBackdrop').style.display = 'none';
        document.getElementById('editMealModal').style.display = 'none';
    }

    setupEventListeners() {
        // Add event listeners for meal logging buttons
        document.querySelector('.log-meal-btn')?.addEventListener('click', () => {
            this.showLogMealModal();
        });

        const mealLogHeader = document.querySelector('.meal-log-header');
        mealLogHeader?.addEventListener('click', () => {
            const entries = document.querySelector('.meal-log-entries');
            const toggle = document.querySelector('.meal-log-toggle');
            
            entries.classList.toggle('collapsed');
            toggle.classList.toggle('collapsed');
            
            // Save state to localStorage
            localStorage.setItem('mealLogCollapsed', entries.classList.contains('collapsed'));
        });

        // Load collapsed state on init
        const isCollapsed = localStorage.getItem('mealLogCollapsed') === 'true';
        if (isCollapsed) {
            document.querySelector('.meal-log-entries')?.classList.add('collapsed');
            document.querySelector('.meal-log-toggle')?.classList.add('collapsed');
        }
    }
}

// Initialize meal logger
const mealLogger = new MealLogger(); 