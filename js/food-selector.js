// Food selector functionality
class FoodSelector {
    constructor() {
        this.foodData = defaultFoodData;
        this.selectedCategory = null;
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log('Initializing FoodSelector...'); // Debug
        this.loadFoodData();
        this.renderCategories();
        this.setupEventListeners();
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
            if (key === this.selectedCategory) {
                li.classList.add('active');
            }
            li.textContent = category.name;
            li.addEventListener('click', () => {
                // Remove active class from all categories
                categoryList.querySelectorAll('.category-item').forEach(item => {
                    item.classList.remove('active');
                });
                // Add active class to selected category
                li.classList.add('active');
                this.selectedCategory = key;
                this.renderFoodList();
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
                <button class="remove-food-btn" onclick="foodSelector.removeFood('${foodKey}')">×</button>
            </div>
            <div class="amount-control-group">
                <div class="amount-buttons">
                    <button onclick="foodSelector.adjustAmount('${foodKey}', -10)">-10</button>
                    <button onclick="foodSelector.adjustAmount('${foodKey}', -5)">-5</button>
                    <button onclick="foodSelector.adjustAmount('${foodKey}', -1)">-1</button>
                </div>
                <input type="number" value="0" min="0" 
                       onchange="foodSelector.updateAmount('${foodKey}', this.value)">
                <div class="amount-buttons">
                    <button onclick="foodSelector.adjustAmount('${foodKey}', 1)">+1</button>
                    <button onclick="foodSelector.adjustAmount('${foodKey}', 5)">+5</button>
                    <button onclick="foodSelector.adjustAmount('${foodKey}', 10)">+10</button>
                </div>
            </div>
        `;
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
        const input = foodItem.querySelector('input');
        const newValue = Math.max(0, parseInt(input.value) + delta);
        input.value = newValue;
        this.updateAmount(foodKey, newValue);
    }

    updateAmount(foodKey, amount) {
        const value = Math.max(0, parseInt(amount) || 0);
        app.state.selectedFoods[foodKey].amount = value;
        this.saveSelectedFoods();
        this.updateTotalCalories();
    }

    removeFood(foodKey) {
        const foodItem = document.querySelector(`[data-food-key="${foodKey}"]`);
        if (foodItem) {
            foodItem.remove();
        }
        delete app.state.selectedFoods[foodKey];
        this.saveSelectedFoods();
        this.updateTotalCalories();
    }

    saveSelectedFoods() {
        localStorage.setItem('selectedFoods', JSON.stringify(app.state.selectedFoods));
    }

    updateTotalCalories() {
        let total = 0;
        Object.values(app.state.selectedFoods).forEach(food => {
            total += (food.calories * food.amount) / 100;
        });
        document.getElementById('totalCalories').textContent = Math.round(total);
    }

    setupEventListeners() {
        console.log('Setting up event listeners...'); // Debug
        
        // Search functionality
        const searchInput = document.getElementById('foodSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                console.log('Search input:', e.target.value); // Debug
                this.handleSearch(e.target.value);
            });
        }

        // Category list clicks
        const categoryList = document.getElementById('categoryList');
        if (categoryList) {
            categoryList.addEventListener('click', (e) => {
                const li = e.target.closest('li');
                if (li) {
                    this.selectedCategory = li.dataset.categoryKey;
                    this.renderCategories();
                    this.renderFoodList();
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

        // Add new food button
        document.querySelector('.add-food-btn').addEventListener('click', () => {
            this.showAddFoodModal();
        });

        // Add new category button
        document.querySelector('.add-category-btn').addEventListener('click', () => {
            this.showAddCategoryModal();
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
        const modal = document.getElementById('addFoodModal');
        modal.innerHTML = `
            <h3>Add New Food</h3>
            <div class="modal-content">
                <div class="form-group">
                    <label for="foodCategory">Category:</label>
                    <select id="foodCategory">
                        ${this.renderCategoryOptions()}
                    </select>
                    <button class="btn-link" onclick="foodSelector.showNewCategoryInput()">
                        + Add New Category
                    </button>
                </div>
                <div id="newCategoryInput" class="form-group hidden">
                    <label for="newCategory">New Category Name:</label>
                    <input type="text" id="newCategory" placeholder="Enter category name">
                </div>
                <div class="form-group">
                    <label for="foodName">Food Name:</label>
                    <input type="text" id="foodName" placeholder="Enter food name">
                </div>
                <div class="form-group">
                    <label for="calories">Calories (per 100g):</label>
                    <input type="number" id="calories" min="0" step="1">
                </div>
                <!-- Add more nutritional fields as needed -->
            </div>
            <div class="modal-buttons">
                <button class="btn btn-primary" onclick="foodSelector.saveNewFood()">Add Food</button>
                <button class="btn" onclick="foodSelector.hideModal()">Cancel</button>
            </div>
        `;
        
        this.showModal(modal);
    }

    showNewCategoryInput() {
        const categorySelect = document.getElementById('foodCategory');
        const newCategoryInput = document.getElementById('newCategoryInput');
        
        categorySelect.style.display = 'none';
        newCategoryInput.classList.remove('hidden');
    }

    renderCategoryOptions() {
        return Object.entries(this.foodData.categories)
            .map(([key, category]) => `
                <option value="${key}">${category.name}</option>
            `).join('');
    }

    saveNewFood() {
        const categorySelect = document.getElementById('foodCategory');
        const newCategoryInput = document.getElementById('newCategory');
        const foodName = document.getElementById('foodName').value.trim();
        const calories = parseInt(document.getElementById('calories').value);

        if (!foodName || !calories) {
            alert('Please fill in all required fields');
            return;
        }

        let categoryKey;
        let categoryName;

        if (newCategoryInput.style.display !== 'none') {
            categoryName = newCategoryInput.value.trim();
            if (!categoryName) {
                alert('Please enter a category name');
                return;
            }
            categoryKey = categoryName.toLowerCase().replace(/\s+/g, '_');
            
            // Create new category if it doesn't exist
            if (!this.foodData.categories[categoryKey]) {
                this.foodData.categories[categoryKey] = {
                    name: categoryName,
                    items: {}
                };
            }
        } else {
            categoryKey = categorySelect.value;
            categoryName = this.foodData.categories[categoryKey].name;
        }

        const foodKey = foodName.toLowerCase().replace(/\s+/g, '_');
        
        // Add new food to category
        this.foodData.categories[categoryKey].items[foodKey] = {
            name: foodName,
            calories: calories
        };

        // Save to localStorage
        localStorage.setItem('foodData', JSON.stringify(this.foodData));

        // Update display
        this.renderCategories();
        this.selectedCategory = categoryKey;
        this.renderFoodList();
        this.hideModal();
    }

    showModal(modal) {
        document.getElementById('modalBackdrop').style.display = 'block';
        modal.style.display = 'block';
        
        // Add animation
        utils.animate(modal, [
            { opacity: 0, transform: 'translate(-50%, -50%) scale(0.8)' },
            { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' }
        ]);
    }

    hideModal() {
        const backdrop = document.getElementById('modalBackdrop');
        const modals = document.querySelectorAll('.modal');
        
        backdrop.style.display = 'none';
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }
}

// Initialize food selector after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.foodSelector = new FoodSelector();
}); 