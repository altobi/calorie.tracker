// Food selector functionality
class FoodSelector {
    constructor() {
        this.selectedCategory = null;
        this.foodData = {};
        
        // Bind methods once
        this.boundShowAddFoodModal = this.showAddFoodModal.bind(this);
        
        // Initialize
        this.loadFoodData();
        this.setupEventListeners();
        
        // Load saved current meal
        const savedMeal = localStorage.getItem('currentMeal');
        window.currentMeal = savedMeal ? JSON.parse(savedMeal) : {};
        
        app.state.selectedFoods = {}; // Initialize selectedFoods state
        
        // Render any saved meal items
        if (Object.keys(window.currentMeal).length > 0) {
            this.renderSelectedFoods();
        }
    }

    loadFoodData() {
        // Load food data from localStorage or use default
        const savedData = utils.storage.get('foodData');
        if (savedData) {
            this.foodData = savedData;
            // Clean up empty categories on load
            this.removeEmptyCategories();
        } else {
            // Load default data
            this.foodData = defaultFoodData;
        }
        
        // Save cleaned data back to storage
        utils.storage.set('foodData', this.foodData);
        
        // Render initial state
        this.renderCategories();
        this.renderFoodList();
    }

    removeEmptyCategories() {
        let hasChanges = false;
        Object.keys(this.foodData).forEach(categoryKey => {
            // Skip default categories
            if (categoryKey === 'fruits' || categoryKey === 'vegetables' || categoryKey === 'meats') {
                return;
            }
            
            // Check if category is empty
            if (Object.keys(this.foodData[categoryKey].items).length === 0) {
                delete this.foodData[categoryKey];
                hasChanges = true;
            }
        });
        
        // Only save if changes were made
        if (hasChanges) {
            utils.storage.set('foodData', this.foodData);
        }
    }

    init() {
        this.setupModals();
        this.loadFoodData();
        this.renderCategories();
        this.setupEventListeners();
        
        // Render any saved meal items
        if (Object.keys(window.currentMeal).length > 0) {
            Object.entries(window.currentMeal).forEach(([foodKey, amount]) => {
                this.addFoodToSelected(this.findCategoryForFood(foodKey), foodKey);
                const foodItem = document.querySelector(`[data-food-key="${foodKey}"]`);
                if (foodItem) {
                    const input = foodItem.querySelector('input');
                    if (input) {
                        input.value = amount;
                        this.updateTotalCalories();
                    }
                }
            });
        }
    }

    setupModals() {
        // Create modal backdrop if it doesn't exist
        if (!document.getElementById('modalBackdrop')) {
            const backdrop = document.createElement('div');
            backdrop.id = 'modalBackdrop';
            backdrop.className = 'modal-backdrop';
            document.body.appendChild(backdrop);
        }

        // Create the add food modal if it doesn't exist
        if (!document.getElementById('addFoodModal')) {
            const modal = document.createElement('div');
            modal.id = 'addFoodModal';
            modal.className = 'modal';
            document.body.appendChild(modal);
        }

        // Add global backdrop click handler
        document.getElementById('modalBackdrop').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideModal();
            }
        });
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

        // Refresh event listeners after updating the DOM
        this.refreshEventListeners();
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
        const total = this.calculateTotalCalories();
        const totalGrams = Object.values(window.currentMeal).reduce((sum, amount) => sum + Number(amount), 0);
        document.getElementById('totalCalories').textContent = `${total} cal (${totalGrams}g)`;
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
        // Add Food button handlers
        const addFoodBtn = document.querySelector('.add-food-btn');
        const addFoodBtnMobile = document.querySelector('.add-food-btn-mobile');

        // Remove any existing listeners first
        addFoodBtn?.removeEventListener('click', this.boundShowAddFoodModal);
        addFoodBtnMobile?.removeEventListener('click', this.boundShowAddFoodModal);

        // Add new listeners
        addFoodBtn?.addEventListener('click', this.boundShowAddFoodModal);
        addFoodBtnMobile?.addEventListener('click', this.boundShowAddFoodModal);

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

    handleSearch(searchTerm) {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;

        if (!searchTerm) {
            searchResults.style.display = 'none';
            searchResults.innerHTML = '';
            return;
        }

        const results = this.searchFoods(searchTerm);
        if (results.length > 0) {
            searchResults.innerHTML = results.map(food => `
                <li onclick="foodSelector.addFoodFromSearch('${food.category}', '${food.key}')">
                    ${food.name} (${food.calories} cal/100g)
                </li>
            `).join('');
            searchResults.style.display = 'block';
        } else {
            searchResults.innerHTML = '<li class="no-results">No matching foods found</li>';
            searchResults.style.display = 'block';
        }
    }

    addFoodFromSearch(categoryKey, foodKey) {
        this.addFoodToSelected(categoryKey, foodKey);
        // Clear search
        const searchInput = document.getElementById('foodSearch');
        const searchResults = document.getElementById('searchResults');
        if (searchInput) searchInput.value = '';
        if (searchResults) searchResults.innerHTML = '';
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
        // Create modal if it doesn't exist
        let modal = document.getElementById('addFoodModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'addFoodModal';
            modal.className = 'modal';
            document.body.appendChild(modal);
        }

        // Create backdrop if it doesn't exist
        let backdrop = document.getElementById('modalBackdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.id = 'modalBackdrop';
            backdrop.className = 'modal-backdrop';
            document.body.appendChild(backdrop);
        }

        // Set modal content
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
                    <button class="btn btn-primary" id="saveFoodBtn">Save</button>
                    <button class="btn" id="cancelFoodBtn">Cancel</button>
                </div>
            </div>
        `;

        // Show modal and backdrop
        modal.classList.add('show');
        backdrop.style.display = 'block';

        // Add event listeners
        const saveBtn = modal.querySelector('#saveFoodBtn');
        const cancelBtn = modal.querySelector('#cancelFoodBtn');
        const categorySelect = modal.querySelector('#categorySelect');
        const newCategoryGroup = modal.querySelector('#newCategoryGroup');

        // Show/hide new category input based on selection
        categorySelect.addEventListener('change', () => {
            newCategoryGroup.style.display = 
                categorySelect.value === 'new' ? 'block' : 'none';
        });

        saveBtn.addEventListener('click', () => {
            let categoryKey = categorySelect.value;
            const newCategoryName = document.getElementById('newCategoryName')?.value.trim();
            const foodName = document.getElementById('foodName').value.trim();
            const calories = parseFloat(document.getElementById('calories').value);
            const protein = parseFloat(document.getElementById('protein').value) || 0;
            const fat = parseFloat(document.getElementById('fat').value) || 0;
            const carbs = parseFloat(document.getElementById('carbs').value) || 0;

            if (!foodName || !calories) {
                alert('Please fill in all required fields');
                return;
            }

            // Format the food name properly
            const formattedName = foodName
                .split(/[\s_]+/)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');

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

            this.addNewFood(formattedName, calories, protein, fat, carbs, categoryKey);
            this.hideModal();
        });

        cancelBtn.addEventListener('click', () => this.hideModal());
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

    addNewFood(foodName, calories, protein, fat, carbs, categoryKey) {
        if (!foodName || !calories || isNaN(calories)) {
            alert('Please fill in all fields correctly');
            return;
        }

        // Format the food name properly
        const formattedName = foodName
            .split(/[\s_]+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');

        // Create the storage key using the formatted name
        const foodKey = formattedName;

        try {
            // Add new food to category
            this.foodData[categoryKey].items[foodKey] = {
                name: formattedName,
                calories: parseFloat(calories),
                protein: parseFloat(protein),
                fat: parseFloat(fat),
                carbs: parseFloat(carbs)
            };

            // Check and remove empty categories
            this.removeEmptyCategories();

            // Save to localStorage
            utils.storage.set('foodData', this.foodData);

            // Update display
            this.renderCategories();
            this.selectedCategory = categoryKey;
            this.renderFoodList();

            // Close modal properly
            this.hideModal();
        } catch (error) {
            console.error('Error adding new food:', error);
            alert('Error adding new food. Please try again.');
        }
    }

    hideModal() {
        // Hide all modals
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.remove('show');
            modal.innerHTML = '';
        });
        
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
        // Create edit modal if it doesn't exist
        let modal = document.getElementById('editFoodModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'editFoodModal';
            modal.className = 'modal';
            document.body.appendChild(modal);
        }

        const food = this.foodData[categoryKey].items[foodKey];
        
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

        // Add event listeners
        const saveBtn = modal.querySelector('#saveEditFoodBtn');
        const deleteBtn = modal.querySelector('#deleteFoodBtn');
        const confirmDeleteBtn = modal.querySelector('#confirmDeleteBtn');
        const cancelBtn = modal.querySelector('#cancelEditFoodBtn');

        saveBtn.addEventListener('click', () => {
            const newName = document.getElementById('editFoodName').value.trim();
            const newCalories = parseFloat(document.getElementById('editCalories').value);
            const newProtein = parseFloat(document.getElementById('editProtein').value) || 0;
            const newFat = parseFloat(document.getElementById('editFat').value) || 0;
            const newCarbs = parseFloat(document.getElementById('editCarbs').value) || 0;

            if (!newName || !newCalories) {
                alert('Please fill in all required fields');
                return;
            }

            // Format the new name
            const formattedName = newName
                .split(/[\s_]+/)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');

            // If name changed, we need to create a new key and delete the old one
            if (formattedName !== foodKey) {
                // Create new entry with the new name
                this.foodData[categoryKey].items[formattedName] = {
                    name: formattedName,
                    calories: newCalories,
                    protein: newProtein,
                    fat: newFat,
                    carbs: newCarbs
                };
                
                // Delete the old entry
                delete this.foodData[categoryKey].items[foodKey];

                // Update any current meal references
                if (window.currentMeal[foodKey]) {
                    const amount = window.currentMeal[foodKey];
                    window.currentMeal[formattedName] = amount;
                    delete window.currentMeal[foodKey];
                    localStorage.setItem('currentMeal', JSON.stringify(window.currentMeal));
                }

                // Update any selected foods references
                if (app.state.selectedFoods && app.state.selectedFoods[foodKey]) {
                    app.state.selectedFoods[formattedName] = app.state.selectedFoods[foodKey];
                    delete app.state.selectedFoods[foodKey];
                    this.saveSelectedFoods();
                }
            } else {
                // Just update the existing entry
                this.foodData[categoryKey].items[foodKey] = {
                    name: formattedName,
                    calories: newCalories,
                    protein: newProtein,
                    fat: newFat,
                    carbs: newCarbs
                };
            }

            // Save to localStorage
            utils.storage.set('foodData', this.foodData);
            
            // Update all displays
            this.renderCategories();
            this.renderFoodList();
            this.renderSelectedFoods();
            this.updateTotalCalories();
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
            this.deleteFood(categoryKey, foodKey);
        });

        cancelBtn.addEventListener('click', () => this.hideModal());

        // Show modal
        modal.classList.add('show');
        
        // Show backdrop
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
        if (Object.keys(window.currentMeal).length === 0) return;

        const mealItems = [];
        let totalCalories = 0;

        console.log('Current meal before logging:', window.currentMeal); // Debug log

        // Convert current meal format to meal log format
        for (const [foodKey, grams] of Object.entries(window.currentMeal)) {
            const calories = this.calculateCalories(foodKey, grams);
            mealItems.push({
                name: foodKey,
                grams: Number(grams),
                calories: calories
            });
            totalCalories += calories;
        }

        const meal = {
            items: mealItems,
            totalCalories: totalCalories,
            timestamp: new Date().toISOString(),
            date: new Date().toISOString().split('T')[0]
        };

        console.log('Meal being logged:', meal); // Debug log

        if (window.mealLogger) {
            window.mealLogger.addMeal(meal);
        }

        // Clear current meal
        window.currentMeal = {};
        localStorage.removeItem('currentMeal');
        this.updateTotalCalories();
        this.renderSelectedFoods();
    }

    // Single source of truth for calorie calculation
    calculateCalories(foodKey, grams) {
        const food = this.findFoodByKey(foodKey);
        if (!food || !grams) return 0;
        return Math.round((food.calories * grams) / 100);
    }

    // Add this helper method
    findCategoryForFood(foodKey) {
        for (const [categoryKey, category] of Object.entries(this.foodData)) {
            if (Object.keys(category.items).includes(foodKey)) {
                return categoryKey;
            }
        }
        return null;
    }

    renderSelectedFoods() {
        const container = document.getElementById('selectedFoods');
        if (!container) return;

        container.innerHTML = '';
        Object.entries(window.currentMeal).forEach(([foodKey, amount]) => {
            const food = this.findFoodByKey(foodKey);
            if (food) {
                const calories = this.calculateCalories(foodKey, amount);
                container.innerHTML += `
                    <div class="selected-food-item" data-food-key="${foodKey}">
                        <div class="food-info">
                            <span class="food-name">${foodKey} (grams) - ${food.calories} cal/100g</span>
                            <span class="food-amount">${amount}g (${calories} cal)</span>
                        </div>
                        <div class="food-controls">
                            <button class="btn btn-icon" onclick="foodSelector.removeFoodFromSelected('${foodKey}')">
                                <span class="material-icons">remove</span>
                            </button>
                            <input type="number" value="${amount}" min="0" step="10"
                                onchange="foodSelector.updateFoodAmount('${foodKey}', this.value)">
                            <button class="btn btn-icon" onclick="foodSelector.editFoodItem('${foodKey}')">
                                <span class="material-icons">edit</span>
                            </button>
                        </div>
                    </div>
                `;
            }
        });

        // Update total calories with unit
        const total = this.calculateTotalCalories();
        const totalGrams = Object.values(window.currentMeal).reduce((sum, amount) => sum + Number(amount), 0);
        document.getElementById('totalCalories').textContent = `${total} cal (${totalGrams} g)`;
    }

    // Add this method for calculating total calories
    calculateTotalCalories() {
        return Object.entries(window.currentMeal).reduce((total, [foodKey, amount]) => {
            return total + this.calculateCalories(foodKey, amount);
        }, 0);
    }

    // Add this method for searching foods
    searchFoods(searchTerm) {
        const results = [];
        const term = searchTerm.toLowerCase();

        // Search through all categories and their items
        Object.entries(this.foodData).forEach(([categoryKey, category]) => {
            Object.entries(category.items).forEach(([foodKey, food]) => {
                if (foodKey.toLowerCase().includes(term)) {
                    results.push({
                        category: categoryKey,
                        key: foodKey,
                        name: foodKey,
                        calories: food.calories
                    });
                }
            });
        });

        return results;
    }

    // Update refreshEventListeners to use the bound method
    refreshEventListeners() {
        // Add Food button handlers
        const addFoodBtn = document.querySelector('.add-food-btn');
        const addFoodBtnMobile = document.querySelector('.add-food-btn-mobile');

        // Remove any existing listeners first
        addFoodBtn?.removeEventListener('click', this.boundShowAddFoodModal);
        addFoodBtnMobile?.removeEventListener('click', this.boundShowAddFoodModal);

        // Add new listeners
        addFoodBtn?.addEventListener('click', this.boundShowAddFoodModal);
        addFoodBtnMobile?.addEventListener('click', this.boundShowAddFoodModal);
    }

    deleteFood(categoryKey, foodKey) {
        if (this.foodData[categoryKey] && this.foodData[categoryKey].items[foodKey]) {
            // Delete the food item
            delete this.foodData[categoryKey].items[foodKey];
            
            // Check and remove empty categories
            this.removeEmptyCategories();
            
            // Save to localStorage
            utils.storage.set('foodData', this.foodData);
            
            // Hide any open modals first
            this.hideModal();
            
            // Update display
            this.renderCategories();
            this.renderFoodList();
        }
    }
}

// Initialize food selector after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.foodSelector = new FoodSelector();
}); 