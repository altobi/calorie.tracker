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
        console.log('Loading meal log');
        const savedLog = localStorage.getItem('mealLog');
        if (savedLog) {
            try {
                this.mealLog = JSON.parse(savedLog);
                console.log('Loaded meal log:', this.mealLog);
            } catch (e) {
                console.error('Error loading meal log:', e);
                this.mealLog = [];
            }
        }
    }

    saveMealLog() {
        console.log('Saving meal log:', this.mealLog);
        localStorage.setItem('mealLog', JSON.stringify(this.mealLog));
        this.updateCalorieProgress();
    }

    renderMealLog() {
        const logContainer = document.querySelector('.meal-log-entries');
        if (!logContainer) return;

        // Clear the container first to prevent duplicates
        logContainer.innerHTML = '';

        // Remove the extra Log Meal button from the header
        const header = document.querySelector('.meal-log-header');
        header.innerHTML = `
            <h2>Meal Log</h2>
            <button class="meal-log-toggle-btn">
                <span class="toggle-icon">▼</span>
            </button>
        `;

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
            sum + entry.totalCalories, 0);

        section.innerHTML = `
            <h3>
                ${new Date(date).toLocaleDateString()}
                <span>${totalCalories} calories</span>
            </h3>
            ${entries.map(entry => this.createMealEntry(entry)).join('')}
        `;

        return section;
    }

    createMealEntry(entry) {
        const itemsList = Object.entries(entry.items)
            .map(([key, item]) => {
                // Use the stored calories directly instead of recalculating
                return `${item.name}: ${item.amount}g (${item.calories} cal)`;
            })
            .join(', ');

        return `
            <div class="meal-entry" data-meal-id="${entry.id}">
                <div class="meal-entry-type">${entry.type}</div>
                <div class="meal-entry-items">${itemsList}</div>
                <div class="meal-entry-total">
                    Total: ${entry.totalCalories} calories
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

    showLogMealModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Log Meal</h3>
                <div class="form-group">
                    <label for="mealType">Meal Type:</label>
                    <select id="mealType">
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="snack">Snack</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="mealDate">Date:</label>
                    <input type="date" id="mealDate" value="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="modal-buttons">
                    <button class="btn btn-primary" id="saveLogMealBtn">Save</button>
                    <button class="btn" id="cancelLogMealBtn">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.classList.add('show');
        
        const backdrop = document.getElementById('modalBackdrop');
        if (backdrop) backdrop.style.display = 'block';

        const saveBtn = modal.querySelector('#saveLogMealBtn');
        const cancelBtn = modal.querySelector('#cancelLogMealBtn');

        saveBtn.addEventListener('click', () => {
            const mealType = document.getElementById('mealType').value;
            const mealDate = document.getElementById('mealDate').value;
            
            const selectedFoods = {};
            const selectedItems = document.querySelectorAll('.selected-food-item');
            
            selectedItems.forEach(item => {
                const foodKey = item.dataset.foodKey;
                const amount = parseFloat(item.querySelector('input').value);
                const food = window.foodSelector.findFoodByKey(foodKey);
                
                if (amount > 0 && food) {
                    const calories = window.foodSelector.calculateCalories(foodKey, amount);
                    selectedFoods[foodKey] = {
                        name: foodKey,
                        amount: amount,
                        caloriesPer100g: food.calories,
                        calories: calories
                    };
                }
            });

            if (Object.keys(selectedFoods).length === 0) {
                alert('Please add some food items to log');
                return;
            }

            const totalCalories = Object.values(selectedFoods)
                .reduce((sum, item) => sum + item.calories, 0);

            const logEntry = {
                id: Date.now(),
                date: mealDate,
                type: mealType,
                items: selectedFoods,
                totalCalories: totalCalories
            };

            this.mealLog.push(logEntry);
            this.saveMealLog();
            this.renderMealLog();

            // Clear UI but preserve structure
            this.clearCurrentMeal();
            
            // Reset the state
            window.currentMeal = {};
            window.foodSelector.resetCurrentMeal();
            
            this.hideModal();
            this.updateCalorieProgress();
        });

        cancelBtn.addEventListener('click', () => this.hideModal());
    }

    clearCurrentMeal() {
        // Clear the Selected Food Items section but preserve structure
        const selectedFoodsContainer = document.getElementById('selectedFoods');
        if (selectedFoodsContainer) {
            // Only keep items that aren't in the footer
            const itemsToRemove = selectedFoodsContainer.querySelectorAll('.selected-food-item');
            itemsToRemove.forEach(item => item.remove());
        }

        // Reset all food item inputs
        document.querySelectorAll('.food-item input[type="number"]').forEach(input => {
            input.value = 0;
        });

        // Clear current meal summary
        const currentMealItems = document.getElementById('currentMealItems');
        const currentMealTotal = document.getElementById('currentMealTotal');
        if (currentMealItems) currentMealItems.innerHTML = '';
        if (currentMealTotal) currentMealTotal.textContent = '0';

        // Reset the window.currentMeal object
        window.currentMeal = {};

        // Update the total calories in the footer
        const totalCaloriesSpan = document.querySelector('.common-foods-footer .total-calories #totalCalories');
        if (totalCaloriesSpan) {
            totalCaloriesSpan.textContent = '0';
        }

        // Update any other displays that show calories
        this.updateCalorieProgress();
    }

    renderCurrentMealSummary() {
        const summaryContainer = document.getElementById('currentMealSummary');
        if (!summaryContainer) return;

        let html = '<h3>Current Meal</h3>';
        let total = 0;

        Object.entries(currentMeal).forEach(([name, data]) => {
            const calories = data.amount * (data.caloriesPer100g / 100);
            total += calories;
            html += `
                <div class="meal-item">
                    <span>${name}</span>
                    <span>${data.amount}g (${Math.round(calories)} cal)</span>
                </div>
            `;
        });

        html += `<div class="meal-total">Total: ${Math.round(total)} calories</div>`;
        summaryContainer.innerHTML = html;
        
        // Update the hidden total field
        const totalElement = document.getElementById('currentMealTotal');
        if (totalElement) totalElement.textContent = Math.round(total);
    }

    cleanAllValues() {
        document.querySelectorAll('.food-item input[type="number"]').forEach(input => {
            input.value = 0;
        });
    }

    editMeal(id) {
        const meal = this.mealLog.find(m => m.id === id);
        if (!meal) return;

        // Create a deep copy of the meal for editing
        const editingMeal = JSON.parse(JSON.stringify(meal));
        this.currentEditingMealId = id;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Edit Meal</h3>
                <div class="form-group">
                    <label for="editMealType">Meal Type:</label>
                    <select id="editMealType">
                        <option value="breakfast" ${meal.type === 'breakfast' ? 'selected' : ''}>Breakfast</option>
                        <option value="lunch" ${meal.type === 'lunch' ? 'selected' : ''}>Lunch</option>
                        <option value="dinner" ${meal.type === 'dinner' ? 'selected' : ''}>Dinner</option>
                        <option value="snack" ${meal.type === 'snack' ? 'selected' : ''}>Snack</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="editMealDate">Date:</label>
                    <input type="date" id="editMealDate" value="${meal.date}">
                </div>
                <div class="meal-items">
                    ${this.renderEditableFoods(meal.items)}
                </div>
                <div class="edit-meal-total">Total: ${meal.totalCalories} calories</div>
                <div class="modal-buttons">
                    <button class="btn btn-primary" id="saveEditMealBtn">Save Changes</button>
                    <button class="btn" id="cancelEditMealBtn">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.classList.add('show');
        
        const backdrop = document.getElementById('modalBackdrop');
        if (backdrop) backdrop.style.display = 'block';

        const saveBtn = modal.querySelector('#saveEditMealBtn');
        const cancelBtn = modal.querySelector('#cancelEditMealBtn');

        saveBtn.addEventListener('click', () => {
            // Update the original meal with the edited copy's data
            meal.type = document.getElementById('editMealType').value;
            meal.date = document.getElementById('editMealDate').value;
            meal.items = editingMeal.items;
            meal.totalCalories = editingMeal.totalCalories;

            this.saveMealLog();
            
            // Check if we're on mobile
            if (window.innerWidth <= 768) {
                const activeDate = document.querySelector('.date-item.active');
                if (activeDate && window.mobileHandler) {
                    window.mobileHandler.handleDateSelection(activeDate.dataset.date);
                }
            } else {
                this.renderMealLog();
            }
            this.hideModal();
            this.updateCalorieProgress();
            this.currentEditingMealId = null;
        });

        cancelBtn.addEventListener('click', () => {
            this.hideModal();
            this.currentEditingMealId = null;
        });
    }

    renderEditableFoods(items) {
        return Object.entries(items).map(([name, item]) => `
            <div class="meal-item">
                <div class="meal-item-details">
                    <span>${name}</span>
                    <span>${item.amount}g (${item.calories} cal)</span>
                </div>
                <div class="meal-item-controls">
                    <input type="number" 
                           value="${item.amount}" 
                           min="0" 
                           data-name="${name}"
                           onchange="mealLogger.updateMealItemAmount('${name}', this.value)">
                    <button class="btn btn-danger btn-sm" 
                            onclick="mealLogger.removeMealItem('${name}')">×</button>
                </div>
            </div>
        `).join('');
    }

    updateMealItemAmount(name, amount) {
        const meal = this.mealLog.find(m => m.id === this.currentEditingMealId);
        if (!meal || !meal.items[name]) return;

        amount = parseFloat(amount);
        if (isNaN(amount) || amount < 0) amount = 0;

        const item = meal.items[name];
        item.amount = amount;
        item.calories = Math.round((amount * item.caloriesPer100g) / 100);

        // Update total calories in the meal object
        meal.totalCalories = Object.values(meal.items)
            .reduce((sum, item) => sum + item.calories, 0);

        // Update the total display in the modal
        const totalDisplay = document.querySelector('.edit-meal-total');
        if (totalDisplay) {
            totalDisplay.textContent = `Total: ${meal.totalCalories} calories`;
        }
    }

    removeMealItem(name) {
        const meal = this.mealLog.find(m => m.id === this.currentEditingMealId);
        if (!meal) return;

        // Only modify the temporary copy
        const editingMeal = JSON.parse(JSON.stringify(meal));
        delete editingMeal.items[name];
        
        if (Object.keys(editingMeal.items).length === 0) {
            this.hideModal();
            return;
        }

        // Update total calories
        editingMeal.totalCalories = Object.values(editingMeal.items)
            .reduce((sum, item) => sum + item.calories, 0);

        // Update the current modal
        const mealItemsContainer = document.querySelector('.meal-items');
        if (mealItemsContainer) {
            mealItemsContainer.innerHTML = this.renderEditableFoods(editingMeal.items);
        }

        // Update the total display
        const totalDisplay = document.querySelector('.edit-meal-total');
        if (totalDisplay) {
            totalDisplay.textContent = `Total: ${editingMeal.totalCalories} calories`;
        }
    }

    deleteMeal(id) {
        console.log('Deleting meal with ID:', id); // Debug log
        const index = this.mealLog.findIndex(meal => meal.id === Number(id));
        if (index !== -1) {
            this.mealLog.splice(index, 1);
            this.saveMealLog();

            // Check if we're on mobile
            if (window.innerWidth <= 768) {
                // Get the currently selected date
                const activeDate = document.querySelector('.date-item.active');
                if (activeDate && window.mobileHandler) {
                    window.mobileHandler.handleDateSelection(activeDate.dataset.date);
                }
            } else {
                // Desktop rendering
                this.renderMealLog();
            }
        } else {
            console.error('Meal not found with ID:', id);
        }
    }

    updateCalorieProgress() {
        const budget = parseInt(localStorage.getItem('calorieBudget')) || 2000;
        const today = new Date().toISOString().split('T')[0];
        
        // Get today's entries and sum their stored totalCalories
        const todayEntries = this.mealLog.filter(entry => entry.date === today);
        const todayCalories = todayEntries.reduce((sum, entry) => 
            sum + entry.totalCalories, 0);
        
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
        // Remove any existing modals
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => modal.remove());
        
        // Hide backdrop
        const backdrop = document.getElementById('modalBackdrop');
        if (backdrop) {
            backdrop.style.display = 'none';
        }
    }

    setupEventListeners() {
        // Add event listener for meal log collapse
        document.addEventListener('click', (e) => {
            if (e.target.closest('.meal-log-toggle-btn')) {
                const toggleBtn = e.target.closest('.meal-log-toggle-btn');
                const entries = document.querySelector('.meal-log-entries');
                toggleBtn.classList.toggle('collapsed');
                entries.classList.toggle('collapsed');
                
                localStorage.setItem('mealLogCollapsed', entries.classList.contains('collapsed'));
            }
        });

        // Add event listener for log meal button
        document.addEventListener('click', (e) => {
            if (e.target.closest('.log-meal-btn')) {
                this.showLogMealModal();
            }
        });

        // Load collapsed state
        const isCollapsed = localStorage.getItem('mealLogCollapsed') === 'true';
        if (isCollapsed) {
            document.querySelector('.meal-log-entries')?.classList.add('collapsed');
            document.querySelector('.meal-log-toggle-btn')?.classList.add('collapsed');
        }
    }

    addMeal(meal) {
        console.log('Adding meal:', meal); // Debug log
        const date = new Date();
        meal.timestamp = date.toISOString();
        meal.date = date.toISOString().split('T')[0];

        // Ensure meal.items is an array
        if (meal.items && !Array.isArray(meal.items)) {
            meal.items = Object.entries(meal.items).map(([name, details]) => ({
                name: name,
                grams: details.grams || details.amount,
                calories: details.calories
            }));
        }

        this.mealLog.push(meal);
        console.log('Updated meal log:', this.mealLog); // Debug log
        this.saveMealLog();
    }
}

// Initialize meal logger
window.mealLogger = new MealLogger(); 