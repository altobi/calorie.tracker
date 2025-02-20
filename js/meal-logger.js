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
        if (savedLog) {
            try {
                this.mealLog = JSON.parse(savedLog);
                
                // Validate and clean up each meal entry
                this.mealLog = this.mealLog.filter(meal => {
                    if (!meal || !meal.items) return false;
                    
                    // Convert items to consistent format
                    const formattedItems = {};
                    Object.entries(meal.items).forEach(([name, item]) => {
                        if (item) {
                            formattedItems[name] = {
                                amount: item.amount || item.grams || 0,
                                calories: item.calories || 0
                            };
                        }
                    });
                    
                    meal.items = formattedItems;
                    return true;
                });
            } catch (e) {
                this.mealLog = [];
            }
        } else {
            this.mealLog = [];
        }
    }

    saveMealLog() {
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
        // Validate entry and items exist
        if (!entry || !entry.items) {
            return '';
        }

        const itemsList = Object.entries(entry.items)
            .map(([name, item]) => {
                // Skip invalid items
                if (!item) {
                    return '';
                }

                try {
                    // Handle both old and new item formats
                    const itemName = item.name || name;
                    const amount = item.amount || item.grams || 0;
                    const calories = item.calories || 0;
                    return `${itemName}: ${amount}g (${calories} cal)`;
                } catch (error) {
                    return '';
                }
            })
            .filter(item => item) // Remove empty strings
            .join(', ');

        return `
            <div class="meal-entry" data-meal-id="${entry.id || ''}">
                <div class="meal-entry-type">${entry.type || 'meal'}</div>
                <div class="meal-entry-items">${itemsList}</div>
                <div class="meal-entry-total">
                    Total: ${entry.totalCalories || 0} calories
                </div>
                <div class="meal-entry-controls">
                    <button class="btn btn-primary" onclick="mealLogger.editMeal(${entry.id || 0})">
                        Edit
                    </button>
                    <button class="btn btn-danger" onclick="mealLogger.confirmDelete(${entry.id || 0}, this)">
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

        this.currentEditingMealId = id;
        
        // Create a temporary copy for editing
        this.editingMealCopy = JSON.parse(JSON.stringify(meal));
        
        // Store original calories per gram for each item
        this.originalCaloriesPerGram = {};
        Object.entries(meal.items).forEach(([name, item]) => {
            this.originalCaloriesPerGram[name] = item.calories / item.amount;
        });

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
            const index = this.mealLog.findIndex(m => m.id === id);
            if (index !== -1) {
                this.editingMealCopy.type = document.getElementById('editMealType').value;
                this.editingMealCopy.date = document.getElementById('editMealDate').value;
                this.mealLog[index] = this.editingMealCopy;
                this.saveMealLog();
            }
            
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
            this.editingMealCopy = null;
        });

        cancelBtn.addEventListener('click', () => {
            this.hideModal();
            this.currentEditingMealId = null;
            this.editingMealCopy = null;
        });
    }

    renderEditableFoods(items) {
        return Object.entries(items).map(([name, item]) => `
            <div class="meal-item-edit">
                <span class="item-name">${name}</span>
                <div class="item-controls">
                    <input type="number" 
                        value="${item.amount || item.grams}" 
                        min="0" 
                        onchange="mealLogger.updateItemAmount('${name}', this.value)"
                        class="amount-input">
                    <span class="unit">g</span>
                    <span class="item-calories">${item.calories} cal</span>
                    <button class="btn btn-icon" onclick="mealLogger.removeMealItem('${name}')">
                        <span class="material-icons">remove</span>
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateItemAmount(name, amount) {
        if (!this.editingMealCopy || !this.editingMealCopy.items[name]) return;

        const newAmount = parseInt(amount) || 0;
        const item = this.editingMealCopy.items[name];
        
        // Use stored calories per gram for calculation
        const caloriesPerGram = this.originalCaloriesPerGram[name];
        
        // Update the temporary copy
        item.amount = newAmount;
        item.calories = Math.round(caloriesPerGram * newAmount);

        // Update total calories for the temporary meal
        this.editingMealCopy.totalCalories = Object.values(this.editingMealCopy.items)
            .reduce((sum, item) => sum + item.calories, 0);

        // Update displays in the modal only
        const itemElement = document.querySelector(`.meal-item-edit:has([value="${amount}"])`);
        if (itemElement) {
            const caloriesDisplay = itemElement.querySelector('.item-calories');
            if (caloriesDisplay) {
                caloriesDisplay.textContent = `${item.calories} cal`;
            }
        }

        const totalDisplay = document.querySelector('.edit-meal-total');
        if (totalDisplay) {
            totalDisplay.textContent = `Total: ${this.editingMealCopy.totalCalories} calories`;
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
        const index = this.mealLog.findIndex(meal => meal.id === Number(id));
        if (index !== -1) {
            this.mealLog.splice(index, 1);
            this.saveMealLog();

            if (window.innerWidth <= 768) {
                const activeDate = document.querySelector('.date-item.active');
                if (activeDate && window.mobileHandler) {
                    window.mobileHandler.handleDateSelection(activeDate.dataset.date);
                }
            } else {
                this.renderMealLog();
            }
        }
    }

    updateCalorieProgress() {
        const budget = parseInt(localStorage.getItem('calorieBudget')) || 2000;
        const today = new Date().toISOString().split('T')[0];
        
        // Get today's entries and sum their stored totalCalories
        const todayEntries = this.mealLog.filter(entry => entry.date === today);
        const todayCalories = todayEntries.reduce((sum, entry) => 
            sum + entry.totalCalories, 0);
        
        // Calculate actual percentage for display
        const actualPercentage = (todayCalories / budget) * 100;
        
        // Cap the visual fill at 100% but keep actual percentage for text
        const visualPercentage = Math.min(actualPercentage, 100);
        
        // Update progress ring
        const circle = document.querySelector('.progress-ring-value');
        if (circle) {
            const radius = circle.r.baseVal.value;
            const circumference = radius * 2 * Math.PI;
            
            // Use capped percentage for visual fill
            const offset = circumference - (visualPercentage / 100 * circumference);
            
            circle.style.strokeDasharray = `${circumference} ${circumference}`;
            circle.style.strokeDashoffset = offset;
            
            // Use actual percentage for color
            circle.style.stroke = this.getColorForPercentage(actualPercentage);
        }
        
        // Show actual percentage in text
        const percentageText = document.getElementById('caloriePercentage');
        if (percentageText) {
            percentageText.textContent = `${Math.round(actualPercentage)}%`;
        }
    }

    getColorForPercentage(percentage) {
        if (percentage <= 50) return '#4CAF50';  // Green
        if (percentage <= 75) return '#FFC107';  // Yellow
        if (percentage <= 100) return '#FF9800'; // Orange
        return '#F44336';  // Red for over 100%
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
        const date = new Date();
        meal.timestamp = date.toISOString();
        meal.date = date.toISOString().split('T')[0];
        meal.id = Date.now();

        if (meal.items) {
            const formattedItems = {};
            if (Array.isArray(meal.items)) {
                meal.items.forEach(item => {
                    formattedItems[item.name] = {
                        amount: item.grams || item.amount,
                        calories: item.calories
                    };
                });
            } else {
                Object.entries(meal.items).forEach(([name, details]) => {
                    formattedItems[name] = {
                        amount: details.grams || details.amount,
                        calories: details.calories
                    };
                });
            }
            meal.items = formattedItems;
        }

        this.mealLog.push(meal);
        this.saveMealLog();
    }

    confirmDelete(mealId, button) {
        // If already in confirmation state, ignore
        if (button.classList.contains('confirm-delete')) {
            return;
        }

        // Change button text to confirm
        const originalText = button.textContent;
        button.textContent = 'Confirm Delete';
        button.classList.add('confirm-delete');
        
        // Set timeout to revert button
        const timeoutId = setTimeout(() => {
            resetButton();
        }, 3000); // Increased to 3 seconds

        const resetButton = () => {
            button.textContent = originalText;
            button.classList.remove('confirm-delete');
            // Remove the click handler when resetting
            button.removeEventListener('click', confirmHandler);
        };

        // Add one-time click event for confirmation
        const confirmHandler = (e) => {
            e.stopPropagation();
            clearTimeout(timeoutId); // Clear the timeout
            this.deleteMeal(mealId);
        };

        button.addEventListener('click', confirmHandler, { once: true });

        // Cancel confirmation if clicked elsewhere
        document.addEventListener('click', (e) => {
            if (!button.contains(e.target) && button.classList.contains('confirm-delete')) {
                clearTimeout(timeoutId); // Clear the timeout
                resetButton();
            }
        }, { once: true });
    }
}

// Initialize meal logger
window.mealLogger = new MealLogger(); 