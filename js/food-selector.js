// Food selector functionality
class FoodSelector {
    constructor() {
        this.foodData = defaultFoodData;
        this.selectedCategory = null;
        this.init();
    }

    init() {
        console.log('Initializing FoodSelector...'); // Debug
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
        console.log('Loading food data...'); // Debug
        // Start with default food data
        this.foodData = defaultFoodData;
        
        // Merge with any saved custom food data
        const savedFoodData = utils.storage.get('foodData');
        if (savedFoodData && savedFoodData.categories) {
            this.foodData = {
                categories: {
                    ...defaultFoodData.categories,
                    ...savedFoodData.categories
                }
            };
        }
        console.log('Loaded food data:', this.foodData); // Debug
    }

    renderCategories() {
        console.log('Rendering categories...'); // Debug
        const categoryList = document.getElementById('categoryList');
        if (!categoryList) return;

        categoryList.innerHTML = '';

        Object.entries(this.foodData.categories).forEach(([key, category]) => {
            const li = document.createElement('li');
            li.className = 'category-item';
            li.dataset.categoryKey = key;
            
            // Only add active class to the currently selected category
            if (key === this.selectedCategory) {
                li.classList.add('active');
            }
            
            li.textContent = category.name;
            
            // Simplified click handler
            li.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event bubbling
                this.selectCategory(key);
            });
            
            categoryList.appendChild(li);
        });

        // If no category is selected, select the first one
        if (!this.selectedCategory && Object.keys(this.foodData.categories).length > 0) {
            this.selectedCategory = Object.keys(this.foodData.categories)[0];
            categoryList.querySelector('.category-item')?.classList.add('active');
            this.renderFoodList();
        }
    }

    renderFoodList() {
        const foodList = document.getElementById('foodList');
        if (!foodList) return;

        foodList.innerHTML = '';

        if (this.selectedCategory && this.foodData.categories[this.selectedCategory]) {
            const category = this.foodData.categories[this.selectedCategory];
            Object.entries(category.items).forEach(([key, item]) => {
                const li = document.createElement('li');
                li.className = 'food-item';
                li.innerHTML = `
                    <div class="food-item-main">
                        <span class="food-item-name">${item.name}</span>
                        <span class="food-item-calories">${item.calories} cal/100g</span>
                    </div>
                    <div class="food-item-details" style="display: none;">
                        <div class="nutrition-info">
                            <div>Protein: ${item.protein}g</div>
                            <div>Fat: ${item.fat}g</div>
                            <div>Carbs: ${item.carbs}g</div>
                        </div>
                        <button class="add-to-selected-btn">Add to Selected</button>
                    </div>
                `;

                // Toggle details on click
                const mainSection = li.querySelector('.food-item-main');
                const details = li.querySelector('.food-item-details');
                mainSection.addEventListener('click', () => {
                    const wasHidden = details.style.display === 'none';
                    // Hide all other details
                    foodList.querySelectorAll('.food-item-details').forEach(d => {
                        d.style.display = 'none';
                    });
                    details.style.display = wasHidden ? 'block' : 'none';
                });

                // Add to selected when button is clicked
                li.querySelector('.add-to-selected-btn').addEventListener('click', () => {
                    this.addFoodToSelected(this.selectedCategory, key);
                    details.style.display = 'none';
                });

                foodList.appendChild(li);
            });
        }
    }

    addFoodToSelected(categoryKey, foodKey) {
        const food = this.foodData.categories[categoryKey].items[foodKey];
        const selectedFoods = document.getElementById('selectedFoods');
        
        // Check if food is already added
        const existingItem = selectedFoods.querySelector(`[data-food-key="${foodKey}"]`);
        if (existingItem) {
            return;
        }

        const foodItem = document.createElement('div');
        foodItem.className = 'selected-food-item';
        foodItem.dataset.foodKey = foodKey;
        foodItem.innerHTML = `
            <div class="selected-food-header">
                <span class="food-item-name">${food.name}</span>
                <button class="remove-food-btn">×</button>
            </div>
            <div class="amount-control-group">
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
        
        // Save to state
        app.state.selectedFoods[foodKey] = {
            name: food.name,
            calories: food.calories,
            amount: 0
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
        
        // Update state
        if (app.state.selectedFoods[foodKey]) {
            app.state.selectedFoods[foodKey].amount = newAmount;
            this.saveSelectedFoods();
            this.updateTotalCalories();
        }
    }

    updateAmount(foodKey, value) {
        const amount = Math.max(0, parseInt(value) || 0);
        
        // Update input value
        const foodItem = document.querySelector(`[data-food-key="${foodKey}"]`);
        if (foodItem) {
            const input = foodItem.querySelector('input');
            input.value = amount;
        }
        
        // Update state
        if (app.state.selectedFoods[foodKey]) {
            app.state.selectedFoods[foodKey].amount = amount;
            this.saveSelectedFoods();
            this.updateTotalCalories();
        }
    }

    removeFood(foodKey) {
        const foodItem = document.querySelector(`[data-food-key="${foodKey}"]`);
        if (foodItem) {
            // Add fade-out animation
            utils.animate(foodItem, [
                { opacity: 1, transform: 'translateX(0)' },
                { opacity: 0, transform: 'translateX(-20px)' }
            ], { duration: 200 }).onfinish = () => {
                foodItem.remove();
                // Remove from state
                delete app.state.selectedFoods[foodKey];
                this.saveSelectedFoods();
                // Update total calories
                this.updateTotalCalories();
            };
        }
    }

    saveSelectedFoods() {
        utils.storage.set('selectedFoods', app.state.selectedFoods);
    }

    updateTotalCalories() {
        const total = Object.entries(app.state.selectedFoods).reduce((sum, [_, food]) => {
            return sum + (food.calories * food.amount / 100);
        }, 0);
        
        const totalElement = document.getElementById('totalCalories');
        if (totalElement) {
            totalElement.textContent = Math.round(total);
        }
    }

    findFoodByKey(foodKey) {
        for (const category of Object.values(this.foodData.categories)) {
            if (category.items[foodKey]) {
                return category.items[foodKey];
            }
        }
        return null;
    }

    setupEventListeners() {
        console.log('Setting up event listeners...'); // Debug
        
        // Add Food button
        const addFoodBtn = document.querySelector('.add-food-btn');
        console.log('Looking for add-food-btn:', addFoodBtn); // Debug
        
        if (addFoodBtn) {
            addFoodBtn.addEventListener('click', () => {
                console.log('Add Food button clicked!'); // Debug
                this.showAddFoodModal();
            });
        } else {
            console.error('Add Food button not found in the DOM'); // Debug
        }

        // Search functionality
        const searchInput = document.getElementById('foodSearch');
        if (searchInput) {
            searchInput.addEventListener('input', utils.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
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
        console.log('Handling search:', searchTerm); // Debug
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;

        searchResults.innerHTML = '';
        
        if (!searchTerm.trim()) {
            searchResults.style.display = 'none';
            return;
        }

        const results = [];
        Object.entries(this.foodData.categories).forEach(([categoryKey, category]) => {
            Object.entries(category.items).forEach(([itemKey, item]) => {
                if (item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                    results.push({
                        categoryKey,
                        itemKey,
                        ...item,
                        categoryName: category.name
                    });
                }
            });
        });

        console.log('Search results:', results); // Debug

        if (results.length > 0) {
            searchResults.style.display = 'block';
            results.forEach(result => {
                const li = document.createElement('li');
                li.className = 'search-result-item';
                li.innerHTML = `
                    <div class="food-item-header">
                        <span class="food-name">${result.name}</span>
                        <span class="food-category">${result.categoryName}</span>
                    </div>
                    <div class="food-item-details">
                        <span>${result.calories} cal</span>
                        <span>${result.protein}g protein</span>
                    </div>
                `;
                li.addEventListener('click', () => {
                    this.addFoodToSelected(result.categoryKey, result.itemKey);
                    searchResults.style.display = 'none';
                    document.getElementById('foodSearch').value = '';
                });
                searchResults.appendChild(li);
            });
        } else {
            searchResults.style.display = 'none';
        }
    }

    updateFoodItemSelect() {
        const foodSelect = document.getElementById('foodItemSelect');
        foodSelect.innerHTML = '<option value="">Select a food item</option>';

        if (this.selectedCategory && this.foodData.categories[this.selectedCategory]) {
            const category = this.foodData.categories[this.selectedCategory];
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
                    <input type="text" id="newCategoryName" placeholder="Enter category name">
                </div>
                <div class="form-group">
                    <label for="foodName">Food Name:</label>
                    <input type="text" id="foodName" required>
                </div>
                <div class="form-group">
                    <label for="calories">Calories (per 100g):</label>
                    <input type="number" id="calories" required min="0">
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
                this.foodData.categories[categoryKey] = {
                    name: newCategoryName,
                    items: {}
                };
            }

            this.saveNewFood(categoryKey, foodName, calories);
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
        Object.entries(this.foodData.categories).forEach(([key, category]) => {
            options += `<option value="${key}">${category.name}</option>`;
        });
        // Add the "New Category" option at the bottom
        options += `<option value="new">+ New Category</option>`;
        return options;
    }

    saveNewFood(categoryKey, foodName, calories) {
        if (!foodName || !calories || isNaN(calories)) {
            alert('Please fill in all fields correctly');
            return;
        }

        // Add new food to category
        const foodKey = foodName.toLowerCase().replace(/\s+/g, '_');
        this.foodData.categories[categoryKey].items[foodKey] = {
            name: foodName,
            calories: parseFloat(calories)
        };

        // Save to localStorage
        localStorage.setItem('foodData', JSON.stringify(this.foodData));

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
        // Remove active class from all categories
        const categoryList = document.getElementById('categoryList');
        categoryList.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to selected category
        const selectedItem = categoryList.querySelector(`[data-category-key="${key}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }
        
        this.selectedCategory = key;
        this.renderFoodList();
    }
}

// Initialize food selector after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.foodSelector = new FoodSelector();
}); 