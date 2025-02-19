// Food selector functionality
class FoodSelector {
    constructor() {
        // Initialize with default data or load from storage
        const savedData = utils.storage.get('foodData');
        this.foodData = savedData || defaultFoodData;
        this.selectedCategory = null;
        // Only store the grams in currentMeal
        window.currentMeal = {}; // Format: { foodKey: grams }
        app.state.selectedFoods = {}; // Initialize selectedFoods state
        this.resetCurrentMeal(); // Add this line
        this.init();
        
        // Load saved current meal
        const savedMeal = localStorage.getItem('currentMeal');
        window.currentMeal = savedMeal ? JSON.parse(savedMeal) : {};
    }

    init() {
        this.setupModals();
        this.loadFoodData();
        this.renderCategories();
        this.setupEventListeners();
    }

    setupModals() {
        // Create modal backdrop if it doesn't exist
        if (!document.getElementById('modalBackdrop')) {
            const backdrop = document.createElement('div');
            backdrop.id = 'modalBackdrop';
            backdrop.className = 'modal-backdrop';
            document.body.appendChild(backdrop);
            
            // Add global backdrop click handler
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) {
                    this.hideModal();
                }
            });
        }
    }

    loadFoodData() {
        const savedData = utils.storage.get('foodData');
        if (savedData) {
            this.foodData = savedData;
        } else {
            this.foodData = JSON.parse(JSON.stringify(defaultFoodData));
            utils.storage.set('foodData', this.foodData);
        }
    }

    renderCategories() {
        const categoryList = document.getElementById('categoryList');
        if (!categoryList) return;

        categoryList.innerHTML = '';
        
        if (!this.foodData) {
            console.error('No food data available');
            return;
        }

        Object.entries(this.foodData).forEach(([key, category]) => {
            const li = document.createElement('li');
            li.className = 'category-item';
            li.dataset.categoryKey = key;
            
            if (key === this.selectedCategory) {
                li.classList.add('active');
            }
            
            li.textContent = category.name;
            li.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectCategory(key);
            });
            
            categoryList.appendChild(li);
        });

        // Select first category if none selected
        if (!this.selectedCategory && Object.keys(this.foodData).length > 0) {
            this.selectedCategory = Object.keys(this.foodData)[0];
            categoryList.querySelector('.category-item')?.classList.add('active');
            this.renderFoodList();
        }
    }

    renderFoodList() {
        const foodList = document.getElementById('foodList');
        if (!foodList) return;

        foodList.innerHTML = '';

        // If no category is selected, don't show any foods
        if (!this.selectedCategory) return;

        if (this.foodData[this.selectedCategory]) {
            const category = this.foodData[this.selectedCategory];
            Object.entries(category.items).forEach(([key, item]) => {
                const li = document.createElement('li');
                li.className = 'food-item';
                li.innerHTML = `
                    <div class="food-item-main">
                        <span class="food-item-name">${key}</span>
                        <span class="food-item-calories">${item.calories} cal/100g</span>
                    </div>
                    <div class="food-item-details" style="display: none;">
                        <div class="nutrition-info">
                            <div>Protein: ${item.protein || 0}g</div>
                            <div>Fat: ${item.fat || 0}g</div>
                            <div>Carbs: ${item.carbs || 0}g</div>
                        </div>
                        <div class="food-item-actions">
                            <div class="button-group">
                                <button class="btn btn-primary btn-sm add-to-selected-btn">Add</button>
                                <button class="btn btn-secondary btn-sm edit-food-btn">Edit</button>
                            </div>
                        </div>
                    </div>
                `;

                // Toggle details on click
                const mainSection = li.querySelector('.food-item-main');
                const details = li.querySelector('.food-item-details');
                mainSection.addEventListener('click', () => {
                    const wasHidden = details.style.display === 'none';
                    foodList.querySelectorAll('.food-item-details').forEach(d => {
                        d.style.display = 'none';
                    });
                    details.style.display = wasHidden ? 'block' : 'none';
                });

                // Add to selected
                li.querySelector('.add-to-selected-btn').addEventListener('click', () => {
                    this.addFoodToSelected(this.selectedCategory, key);
                });

                // Edit food item
                li.querySelector('.edit-food-btn').addEventListener('click', () => {
                    this.showEditFoodModal(this.selectedCategory, key);
                });

                foodList.appendChild(li);
            });
        }
    }

    addFoodToSelected(categoryKey, foodKey) {
        const food = this.foodData[categoryKey].items[foodKey];
        const selectedFoods = document.getElementById('selectedFoods');
        
        // Check if food is already added
        const existingItem = selectedFoods.querySelector(`[data-food-key="${foodKey}"]`);
        if (existingItem) return;

        const foodItem = document.createElement('div');
        foodItem.className = 'selected-food-item';
        foodItem.dataset.foodKey = foodKey;
        foodItem.innerHTML = `
            <div class="selected-food-header">
                <span class="food-item-name">${foodKey}</span>
            </div>
            <div class="amount-control-group">
                <div class="amount-controls">
                    <div class="amount-buttons">
                        <button data-amount="-10">-10</button>
                        <button data-amount="-5">-5</button>
                        <button data-amount="-1">-1</button>
                    </div>
                    <input type="number" value="0" min="0">
                    <div class="amount-buttons">
                        <button data-amount="1">+1</button>
                        <button data-amount="5">+5</button>
                        <button data-amount="10">+10</button>
                    </div>
                </div>
                <button class="remove-food-btn">×</button>
            </div>
        `;

        // Add event listeners
        const removeBtn = foodItem.querySelector('.remove-food-btn');
        removeBtn.addEventListener('click', () => this.removeFood(foodKey));

        const amountInput = foodItem.querySelector('input');
        amountInput.addEventListener('change', (e) => this.updateAmount(foodKey, e.target.value));

        const amountButtons = foodItem.querySelectorAll('.amount-buttons button');
        amountButtons.forEach(button => {
            button.addEventListener('click', () => {
                const amount = parseInt(button.dataset.amount);
                this.adjustAmount(foodKey, amount);
            });
        });

        selectedFoods.appendChild(foodItem);
        
        // Initialize with 0 amount and no calories
        app.state.selectedFoods[foodKey] = {
            name: foodKey,
            amount: 0,
            baseCalories: parseFloat(food.calories) // Store base calories per 100g
        };

        this.saveSelectedFoods();
    }

    adjustAmount(foodKey, delta) {
        const foodItem = document.querySelector(`[data-food-key="${foodKey}"]`);
        if (!foodItem) return;

        const input = foodItem.querySelector('input');
        const currentAmount = parseInt(input.value) || 0;
        const newAmount = Math.max(0, currentAmount + delta);
        
        input.value = newAmount;
        
        // Store the grams and save to localStorage
        if (newAmount > 0) {
            window.currentMeal[foodKey] = newAmount;
        } else {
            delete window.currentMeal[foodKey];
        }

        // Save current meal to localStorage
        localStorage.setItem('currentMeal', JSON.stringify(window.currentMeal));

        this.updateTotalCalories();
        this.renderCurrentMealSummary();
    }

    updateAmount(foodKey, value) {
        const newAmount = Math.max(0, parseInt(value) || 0);
        
        // Update input value
        const foodItem = document.querySelector(`[data-food-key="${foodKey}"]`);
        if (foodItem) {
            const input = foodItem.querySelector('input');
            input.value = newAmount;
        }
        
        // Update state
        if (app.state.selectedFoods[foodKey]) {
            app.state.selectedFoods[foodKey].amount = newAmount;
            this.saveSelectedFoods();
        }

        // Update currentMeal
        const food = this.findFoodByKey(foodKey);
        if (food) {
            if (newAmount > 0) {
                window.currentMeal[foodKey] = newAmount;
            } else {
                delete window.currentMeal[foodKey];
            }
        }

        this.updateTotalCalories();
        this.renderCurrentMealSummary();
    }

    removeFood(foodKey) {
        const foodItem = document.querySelector(`[data-food-key="${foodKey}"]`);
        if (foodItem) {
            foodItem.remove();
            delete app.state.selectedFoods[foodKey];
            delete window.currentMeal[foodKey];
            this.saveSelectedFoods();
            this.updateTotalCalories();
            this.renderCurrentMealSummary();
        }
    }

    saveSelectedFoods() {
        utils.storage.set('selectedFoods', app.state.selectedFoods);
    }

    updateTotalCalories() {
        let total = 0;
        
        Object.entries(window.currentMeal).forEach(([foodKey, grams]) => {
            total += this.calculateCalories(foodKey, grams);
        });

        // Only update the total calories in the footer
        const totalCaloriesSpan = document.querySelector('.common-foods-footer .total-calories #totalCalories');
        if (totalCaloriesSpan) {
            totalCaloriesSpan.textContent = total;
        }
    }

    findFoodByKey(foodKey) {
        for (const category of Object.values(this.foodData)) {
            if (category.items[foodKey]) {
                return category.items[foodKey];
            }
        }
        return null;
    }

    setupEventListeners() {
        // Add Food button handlers (both desktop and mobile)
        const addFoodBtn = document.querySelector('.add-food-btn');
        const addFoodBtnMobile = document.querySelector('.add-food-btn-mobile');

        const showAddFoodModal = () => this.showAddFoodModal();

        if (addFoodBtn) {
            addFoodBtn.addEventListener('click', showAddFoodModal);
        }
        if (addFoodBtnMobile) {
            addFoodBtnMobile.addEventListener('click', showAddFoodModal);
        }

        // Search functionality
        const searchInput = document.getElementById('foodSearch');
        if (searchInput) {
            searchInput.addEventListener('input', utils.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));

            // Hide search results when clicking outside
            document.addEventListener('click', (e) => {
                const searchResults = document.getElementById('searchResults');
                if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                    searchResults.style.display = 'none';
                }
            });
        }

        // Category list
        const categoryList = document.querySelector('.category-list');
        if (categoryList) {
            categoryList.addEventListener('click', (e) => {
                const categoryItem = e.target.closest('.category-item');
                if (categoryItem) {
                    const categoryKey = categoryItem.dataset.category;
                    this.selectCategory(categoryKey);
                }
            });
        }

        // Category select dropdown
        const categorySelect = document.getElementById('categorySelect');
        if (categorySelect) {
            categorySelect.addEventListener('change', (e) => {
                this.selectedCategory = e.target.value;
                this.updateFoodItemSelect();
            });
        }

        // Food item selection
        const foodSelect = document.getElementById('foodItemSelect');
        foodSelect?.addEventListener('change', (e) => {
            if (e.target.value) {
                const [categoryKey, itemKey] = e.target.value.split('|');
                this.addFoodToSelected(categoryKey, itemKey);
            }
        });
    }

    handleSearch(query) {
        const searchResults = document.getElementById('searchResults');
        searchResults.innerHTML = '';

        if (!query.trim()) {
            searchResults.style.display = 'none';
            return;
        }

        const results = [];
        const searchTerm = query.toLowerCase();

        // Search through all categories and their items
        Object.entries(this.foodData).forEach(([categoryKey, category]) => {
            Object.entries(category.items).forEach(([foodKey, food]) => {
                // Search by food key (name) since that's how we store it
                if (foodKey.toLowerCase().includes(searchTerm)) {
                    results.push({
                        categoryKey,
                        foodKey,
                        name: foodKey,
                        calories: food.calories
                    });
                }
            });
        });

        if (results.length > 0) {
            results.forEach(result => {
                const li = document.createElement('li');
                li.className = 'search-result-item';
                li.innerHTML = `
                    <span class="food-name">${result.name}</span>
                    <span class="food-calories">${result.calories} cal/100g</span>
                `;
                li.addEventListener('click', () => {
                    this.selectCategory(result.categoryKey);
                    searchResults.style.display = 'none';
                    // Clear search input
                    document.getElementById('foodSearch').value = '';
                    
                    // Highlight the found item
                    setTimeout(() => {
                        const foodItem = document.querySelector(`[data-food-key="${result.foodKey}"]`);
                        if (foodItem) {
                            foodItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            foodItem.classList.add('highlight');
                            setTimeout(() => foodItem.classList.remove('highlight'), 2000);
                        }
                    }, 100);
                });
                searchResults.appendChild(li);
            });
            searchResults.style.display = 'block';
        } else {
            searchResults.innerHTML = '<li class="no-results">No matching foods found</li>';
            searchResults.style.display = 'block';
        }
    }

    updateFoodItemSelect() {
        const foodSelect = document.getElementById('foodItemSelect');
        foodSelect.innerHTML = '<option value="">Select a food item</option>';

        if (this.selectedCategory && this.foodData[this.selectedCategory]) {
            const category = this.foodData[this.selectedCategory];
            Object.entries(category.items).forEach(([key, item]) => {
                const option = document.createElement('option');
                option.value = `${this.selectedCategory}|${key}`;
                option.textContent = `${item.name} (${item.calories} cal)`;
                foodSelect.appendChild(option);
            });
        }
    }

    showAddFoodModal() {
        // First, clean up any existing modals
        this.hideModal();

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Add New Food Item</h3>
                <div class="form-group">
                    <label for="categorySelect">Category:</label>
                    <select id="categorySelect" required>
                        ${this.renderCategoryOptions()}
                    </select>
                </div>
                <div class="form-group" id="newCategoryGroup" style="display: none;">
                    <label for="newCategoryName">New Category Name:</label>
                    <div class="input-wrapper">
                        <input type="text" id="newCategoryName" placeholder="Enter category name">
                    </div>
                </div>
                <div class="form-group">
                    <label for="foodName">Food Name:</label>
                    <input type="text" id="foodName" required>
                </div>
                <div class="form-group">
                    <label for="calories">Calories (per 100g):</label>
                    <input type="number" id="calories" required min="0">
                </div>
                <div class="form-group">
                    <label for="protein">Protein (g):</label>
                    <input type="number" id="protein" value="0" min="0" step="0.1">
                </div>
                <div class="form-group">
                    <label for="fat">Fat (g):</label>
                    <input type="number" id="fat" value="0" min="0" step="0.1">
                </div>
                <div class="form-group">
                    <label for="carbs">Carbs (g):</label>
                    <input type="number" id="carbs" value="0" min="0" step="0.1">
                </div>
                <div class="modal-buttons">
                    <button class="btn btn-primary" id="saveNewFoodBtn">Save</button>
                    <button class="btn" id="cancelNewFoodBtn">Cancel</button>
                </div>
            </div>
        `;

        // Add event listeners
        const saveBtn = modal.querySelector('#saveNewFoodBtn');
        const cancelBtn = modal.querySelector('#cancelNewFoodBtn');
        const categorySelect = modal.querySelector('#categorySelect');
        const newCategoryGroup = modal.querySelector('#newCategoryGroup');

        // Show/hide new category input based on selection
        categorySelect.addEventListener('change', () => {
            newCategoryGroup.style.display = 
                categorySelect.value === 'new' ? 'block' : 'none';
        });

        const handleSave = () => {
            let categoryKey = categorySelect.value;
            const newCategoryName = document.getElementById('newCategoryName')?.value.trim();
            const foodName = document.getElementById('foodName').value.trim();
            const calories = parseFloat(document.getElementById('calories').value);
            const protein = parseFloat(document.getElementById('protein').value);
            const fat = parseFloat(document.getElementById('fat').value);
            const carbs = parseFloat(document.getElementById('carbs').value);

            if (!foodName || !calories) {
                alert('Please fill in all required fields');
                return;
            }

            if (categoryKey === 'new') {
                if (!newCategoryName) {
                    alert('Please enter a category name');
                    return;
                }
                categoryKey = newCategoryName.toLowerCase().replace(/\s+/g, '_');
                // Create new category
                this.foodData[categoryKey] = {
                    name: newCategoryName,
                    items: {}
                };
            }

            this.saveNewFood(categoryKey, foodName, calories, protein, fat, carbs);
            this.hideModal();
        };

        saveBtn.addEventListener('click', handleSave);
        cancelBtn.addEventListener('click', () => this.hideModal());

        // Show the modal
        document.body.appendChild(modal);
        modal.classList.add('show');
        
        // Show backdrop
        const backdrop = document.getElementById('modalBackdrop');
        if (backdrop) {
            backdrop.style.display = 'block';
        }
    }

    renderCategoryOptions() {
        let options = '';
        Object.entries(this.foodData).forEach(([key, category]) => {
            options += `<option value="${key}">${category.name}</option>`;
        });
        // Add the "New Category" option at the bottom
        options += `<option value="new">+ New Category</option>`;
        return options;
    }

    saveNewFood(categoryKey, foodName, calories, protein, fat, carbs) {
        if (!foodName || !calories || isNaN(calories)) {
            alert('Please fill in all fields correctly');
            return;
        }

        // Add new food to category
        const foodKey = foodName.toLowerCase().replace(/\s+/g, '_');
        this.foodData[categoryKey].items[foodKey] = {
            name: foodName,
            calories: parseFloat(calories),
            protein: parseFloat(protein),
            fat: parseFloat(fat),
            carbs: parseFloat(carbs)
        };

        // Save to localStorage
        utils.storage.set('foodData', this.foodData);

        // Update display
        this.renderCategories();
        this.selectedCategory = categoryKey;
        this.renderFoodList();

        // Close modal properly
        this.hideModal();
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

    selectCategory(key) {
        const categoryList = document.getElementById('categoryList');
        const selectedItem = categoryList.querySelector(`[data-category-key="${key}"]`);
        
        // If clicking the already selected category, deselect it
        if (key === this.selectedCategory) {
            this.selectedCategory = null;
            categoryList.querySelectorAll('.category-item').forEach(item => {
                item.classList.remove('active');
            });
            this.renderFoodList(); // This will clear the food list
            return;
        }

        // Otherwise, select the new category
        categoryList.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
        });
        
        if (selectedItem) {
            selectedItem.classList.add('active');
        }
        
        this.selectedCategory = key;
        this.renderFoodList();
    }

    showEditFoodModal(categoryKey, foodKey) {
        const food = this.foodData[categoryKey].items[foodKey];
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Edit Food Item</h3>
                <div class="form-group">
                    <label for="editFoodName">Food Name:</label>
                    <input type="text" id="editFoodName" value="${food.name}" required>
                </div>
                <div class="form-group">
                    <label for="editCalories">Calories (per 100g):</label>
                    <input type="number" id="editCalories" value="${food.calories}" required min="0">
                </div>
                <div class="form-group">
                    <label for="editProtein">Protein (g):</label>
                    <input type="number" id="editProtein" value="${food.protein || 0}" min="0" step="0.1">
                </div>
                <div class="form-group">
                    <label for="editFat">Fat (g):</label>
                    <input type="number" id="editFat" value="${food.fat || 0}" min="0" step="0.1">
                </div>
                <div class="form-group">
                    <label for="editCarbs">Carbs (g):</label>
                    <input type="number" id="editCarbs" value="${food.carbs || 0}" min="0" step="0.1">
                </div>
                <div class="modal-buttons">
                    <button class="btn btn-primary" id="saveEditFoodBtn">Save Changes</button>
                    <button class="btn" id="cancelEditFoodBtn">Cancel</button>
                    <button class="btn btn-danger" id="deleteFoodBtn">Delete</button>
                    <button class="btn btn-danger" id="confirmDeleteBtn" style="display: none;">Confirm Delete</button>
                </div>
            </div>
        `;

        const saveBtn = modal.querySelector('#saveEditFoodBtn');
        const deleteBtn = modal.querySelector('#deleteFoodBtn');
        const cancelBtn = modal.querySelector('#cancelEditFoodBtn');
        const confirmDeleteBtn = modal.querySelector('#confirmDeleteBtn');

        saveBtn.addEventListener('click', () => {
            const newName = document.getElementById('editFoodName').value.trim();
            const newCalories = parseFloat(document.getElementById('editCalories').value);
            const newProtein = parseFloat(document.getElementById('editProtein').value);
            const newFat = parseFloat(document.getElementById('editFat').value);
            const newCarbs = parseFloat(document.getElementById('editCarbs').value);

            if (!newName || !newCalories) {
                alert('Please fill in all required fields');
                return;
            }

            this.foodData[categoryKey].items[foodKey] = {
                name: newName,
                calories: newCalories,
                protein: newProtein,
                fat: newFat,
                carbs: newCarbs
            };

            utils.storage.set('foodData', this.foodData);
            this.renderFoodList();
            this.hideModal();
        });

        deleteBtn.addEventListener('click', () => {
            deleteBtn.style.display = 'none';
            confirmDeleteBtn.style.display = 'inline-block';
            
            // Hide confirm button after 3 seconds if not clicked
            setTimeout(() => {
                deleteBtn.style.display = 'inline-block';
                confirmDeleteBtn.style.display = 'none';
            }, 3000);
        });

        confirmDeleteBtn.addEventListener('click', () => {
            delete this.foodData[categoryKey].items[foodKey];
            utils.storage.set('foodData', this.foodData);
            
            // Check if category is empty and delete if it is
            if (Object.keys(this.foodData[categoryKey].items).length === 0) {
                delete this.foodData[categoryKey];
                this.selectedCategory = Object.keys(this.foodData)[0] || null;
                this.renderCategories();
            }
            
            this.renderFoodList();
            this.hideModal();
        });

        cancelBtn.addEventListener('click', () => this.hideModal());

        document.body.appendChild(modal);
        modal.classList.add('show');
        
        const backdrop = document.getElementById('modalBackdrop');
        if (backdrop) {
            backdrop.style.display = 'block';
        }
    }

    deleteCategory(categoryKey) {
        delete this.foodData[categoryKey];
        
        // Save to localStorage using utils storage
        utils.storage.set('foodData', this.foodData);
        
        // Update selected category if needed
        if (this.selectedCategory === categoryKey) {
            this.selectedCategory = Object.keys(this.foodData)[0] || null;
        }
        
        // Update display
        this.renderCategories();
        this.renderFoodList();
        this.hideModal();
    }

    handleFoodSelection(foodItem, amount) {
        const name = foodItem.name;
        const calories = foodItem.calories;
        
        // Fix calculation here
        if (amount > 0) {
            window.currentMeal[name] = {
                grams: amount,
                // Calculate calories based on amount per 100g
                calories: (amount * calories / 100),
                caloriesPer100g: calories
            };
        } else {
            delete window.currentMeal[name];
        }
        
        this.renderCurrentMealSummary();
    }

    renderCurrentMealSummary() {
        const currentMealItems = document.getElementById('currentMealItems');
        const currentMealTotal = document.getElementById('currentMealTotal');
        if (!currentMealItems || !currentMealTotal) return;

        currentMealItems.innerHTML = '';
        let totalCalories = 0;

        Object.entries(window.currentMeal).forEach(([foodKey, grams]) => {
            const food = this.findFoodByKey(foodKey);
            if (food && grams > 0) {
                // Calculate calories: (calories per 100g * amount in grams) / 100
                const itemCalories = Math.round((parseFloat(food.calories) * grams) / 100);
                currentMealItems.innerHTML += `<div>${foodKey}: ${grams}g (${itemCalories} cal)</div>`;
                totalCalories += itemCalories;
            }
        });

        currentMealTotal.textContent = Math.round(totalCalories);
    }

    resetCurrentMeal() {
        window.currentMeal = {};
        localStorage.removeItem('currentMeal'); // Clear from storage
        app.state.selectedFoods = {};
        this.updateTotalCalories();
        this.renderCurrentMealSummary();
    }

    logCurrentMeal() {
        const mealItems = [];
        let totalCalories = 0;

        for (const [foodKey, grams] of Object.entries(window.currentMeal)) {
            const calories = this.calculateCalories(foodKey, grams);
            mealItems.push({
                name: foodKey,
                grams: grams,
                calories: calories
            });
            totalCalories += calories;
        }

        if (mealItems.length > 0) {
            const meal = {
                items: mealItems,
                totalCalories: totalCalories,
                timestamp: new Date().toISOString()
            };

            mealLogger.addMeal(meal);

            // Clear UI
            const selectedFoods = document.getElementById('selectedFoods');
            if (selectedFoods) {
                const items = selectedFoods.querySelectorAll('.selected-food-item');
                items.forEach(item => item.remove());
            }

            // Reset state
            window.currentMeal = {};
            this.updateTotalCalories();
        }
    }

    // Single source of truth for calorie calculation
    calculateCalories(foodKey, grams) {
        const food = this.findFoodByKey(foodKey);
        if (!food || !grams) return 0;
        return Math.round((food.calories * grams) / 100);
    }
}

// Initialize food selector after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.foodSelector = new FoodSelector();
}); 