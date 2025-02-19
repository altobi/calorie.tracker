const defaultFoodData = {
    proteins: {
        name: "Proteins",
        items: {
            "Egg (boiled/scrambled)": {
                calories: 155,
                protein: 13,
                carbs: 1.1,
                fat: 11,
                key: "egg_boiled"
            },
            "Chicken Breast": {
                calories: 165,
                protein: 31,
                carbs: 0,
                fat: 3.6,
                key: "chicken_breast"
            },
            "Beyond Meat": {
                calories: 250,
                protein: 20,
                carbs: 9,
                fat: 18,
                key: "beyond_meat"
            },
            "Salmon": {
                calories: 208,
                protein: 22,
                carbs: 0,
                fat: 13,
                key: "salmon"
            },
            "Mortadella": {
                calories: 176,
                protein: 11.2,
                carbs: 2.1,
                fat: 14.3,
                key: "mortadella"
            },
            "Tuna (canned in water)": {
                calories: 116,
                protein: 26,
                carbs: 0,
                fat: 1,
                key: "tuna_canned"
            },
            "Turkey Breast": {
                calories: 135,
                protein: 30,
                carbs: 0,
                fat: 1,
                key: "turkey_breast"
            },
            "Lean Beef": {
                calories: 250,
                protein: 26,
                carbs: 0,
                fat: 15,
                key: "lean_beef"
            },
            "Tofu": {
                calories: 76,
                protein: 8,
                carbs: 2,
                fat: 4,
                key: "tofu"
            },
            "Shrimp": {
                calories: 85,
                protein: 20,
                carbs: 0,
                fat: 1,
                key: "shrimp"
            },
            "Cod Fish": {
                calories: 82,
                protein: 18,
                carbs: 0,
                fat: 0.7,
                key: "cod_fish"
            },
            "Pork Chop (lean)": {
                calories: 143,
                protein: 23,
                carbs: 0,
                fat: 5.2,
                key: "pork_chop"
            },
            "Ground Beef (80/20)": {
                calories: 254,
                protein: 17,
                carbs: 0,
                fat: 20,
                key: "ground_beef"
            },
            "Lamb Chop": {
                calories: 294,
                protein: 25,
                carbs: 0,
                fat: 21,
                key: "lamb_chop"
            },
            "Sardines": {
                calories: 208,
                protein: 24,
                carbs: 0,
                fat: 11,
                key: "sardines"
            },
            "Tempeh": {
                calories: 192,
                protein: 20,
                carbs: 7.6,
                fat: 11,
                key: "tempeh"
            },
            "Seitan": {
                calories: 370,
                protein: 75,
                carbs: 14,
                fat: 2,
                key: "seitan"
            },
            "Duck Breast": {
                calories: 337,
                protein: 19,
                carbs: 0,
                fat: 28,
                key: "duck_breast"
            },
            "Tilapia": {
                calories: 96,
                protein: 20,
                carbs: 0,
                fat: 2,
                key: "tilapia"
            },
            "Protein Powder (Whey)": {
                calories: 120,
                protein: 24,
                carbs: 3,
                fat: 2,
                key: "whey_protein"
            }
        }
    },
    dairy: {
        name: "Dairy",
        items: {
            "Jarlsberg Cheese": {
                calories: 351,
                protein: 27,
                carbs: 0,
                fat: 27,
                key: "jarlsberg"
            },
            "Boxed Cheese": {
                calories: 301,
                protein: 18,
                carbs: 3.5,
                fat: 24,
                key: "boxed_cheese"
            },
            "Triangle Cheese": {
                calories: 228,
                protein: 14,
                carbs: 2,
                fat: 18,
                key: "triangle_cheese"
            },
            "Greek Yogurt": {
                calories: 59,
                protein: 10,
                carbs: 3.6,
                fat: 0.4,
                key: "greek_yogurt"
            },
            "Cottage Cheese": {
                calories: 98,
                protein: 11,
                carbs: 3.4,
                fat: 4.3,
                key: "cottage_cheese"
            },
            "Mozzarella": {
                calories: 280,
                protein: 28,
                carbs: 2.2,
                fat: 17,
                key: "mozzarella"
            },
            "Feta Cheese": {
                calories: 264,
                protein: 14,
                carbs: 4.1,
                fat: 21,
                key: "feta"
            },
            "Whole Milk": {
                calories: 61,
                protein: 3.2,
                carbs: 4.8,
                fat: 3.3,
                key: "whole_milk"
            },
            "Skim Milk": {
                calories: 34,
                protein: 3.4,
                carbs: 5,
                fat: 0.2,
                key: "skim_milk"
            },
            "Heavy Cream": {
                calories: 340,
                protein: 2.8,
                carbs: 2.7,
                fat: 36,
                key: "heavy_cream"
            },
            "Sour Cream": {
                calories: 193,
                protein: 2.1,
                carbs: 4.6,
                fat: 18,
                key: "sour_cream"
            },
            "Butter": {
                calories: 717,
                protein: 0.9,
                carbs: 0.1,
                fat: 81,
                key: "butter"
            },
            "Cream Cheese": {
                calories: 342,
                protein: 6,
                carbs: 4.1,
                fat: 34,
                key: "cream_cheese"
            },
            "Parmesan": {
                calories: 431,
                protein: 38,
                carbs: 4.1,
                fat: 29,
                key: "parmesan"
            },
            "Ricotta": {
                calories: 174,
                protein: 11,
                carbs: 4,
                fat: 13,
                key: "ricotta"
            },
            "Gouda": {
                calories: 356,
                protein: 25,
                carbs: 2.2,
                fat: 27,
                key: "gouda"
            },
            "Blue Cheese": {
                calories: 353,
                protein: 21,
                carbs: 2.3,
                fat: 28,
                key: "blue_cheese"
            },
            "String Cheese": {
                calories: 86,
                protein: 7,
                carbs: 1,
                fat: 6,
                key: "string_cheese"
            },
            "Provolone": {
                calories: 351,
                protein: 26,
                carbs: 2,
                fat: 27,
                key: "provolone"
            },
            "Mascarpone": {
                calories: 417,
                protein: 4,
                carbs: 4,
                fat: 42,
                key: "mascarpone"
            }
        }
    },
    grains: {
        name: "Grains & Breads",
        items: {
            "Rice Cakes": {
                calories: 381,
                protein: 7,
                carbs: 81,
                fat: 3,
                key: "rice_cakes"
            },
            "Boiled Rice": {
                calories: 130,
                protein: 2.7,
                carbs: 28,
                fat: 0.3,
                key: "boiled_rice"
            },
            "Pasta": {
                calories: 131,
                protein: 5,
                carbs: 25,
                fat: 1.1,
                key: "pasta"
            },
            "Bread": {
                calories: 265,
                protein: 9,
                carbs: 49,
                fat: 3.2,
                key: "bread"
            },
            "Tortilla Bread": {
                calories: 315,
                protein: 8,
                carbs: 54,
                fat: 7,
                key: "tortilla"
            },
            "Quinoa": {
                calories: 120,
                protein: 4.4,
                carbs: 21,
                fat: 1.9,
                key: "quinoa"
            },
            "Oatmeal": {
                calories: 389,
                protein: 16.9,
                carbs: 66,
                fat: 6.9,
                key: "oatmeal"
            },
            "Bagel": {
                calories: 245,
                protein: 10,
                carbs: 48,
                fat: 1.5,
                key: "bagel"
            },
            "Brown Rice": {
                calories: 111,
                protein: 2.6,
                carbs: 23,
                fat: 0.9,
                key: "brown_rice"
            },
            "Couscous": {
                calories: 176,
                protein: 6,
                carbs: 37,
                fat: 0.3,
                key: "couscous"
            },
            "Rye Bread": {
                calories: 259,
                protein: 8.5,
                carbs: 48,
                fat: 3.3,
                key: "rye_bread"
            },
            "Pita Bread": {
                calories: 275,
                protein: 9,
                carbs: 55,
                fat: 1.7,
                key: "pita_bread"
            },
            "Granola": {
                calories: 471,
                protein: 10,
                carbs: 64,
                fat: 20,
                key: "granola"
            },
            "Muesli": {
                calories: 340,
                protein: 8,
                carbs: 66,
                fat: 6,
                key: "muesli"
            },
            "Cornflakes": {
                calories: 357,
                protein: 8,
                carbs: 84,
                fat: 0.4,
                key: "cornflakes"
            },
            "Barley": {
                calories: 123,
                protein: 2.3,
                carbs: 28,
                fat: 0.4,
                key: "barley"
            },
            "Buckwheat": {
                calories: 343,
                protein: 13,
                carbs: 71,
                fat: 3.4,
                key: "buckwheat"
            },
            "Naan Bread": {
                calories: 310,
                protein: 9,
                carbs: 57,
                fat: 5,
                key: "naan"
            },
            "Sourdough Bread": {
                calories: 289,
                protein: 9.5,
                carbs: 53,
                fat: 3.8,
                key: "sourdough"
            },
            "Crackers": {
                calories: 421,
                protein: 9,
                carbs: 67,
                fat: 13,
                key: "crackers"
            }
        }
    },
    vegetables: {
        name: "Vegetables",
        items: {
            "Tomato": {
                calories: 18,
                protein: 0.9,
                carbs: 3.9,
                fat: 0.2,
                key: "tomato"
            },
            "Sweet Pepper": {
                calories: 20,
                protein: 0.9,
                carbs: 4.6,
                fat: 0.2,
                key: "sweet_pepper"
            },
            "Cucumber": {
                calories: 15,
                protein: 0.7,
                carbs: 3.6,
                fat: 0.1,
                key: "cucumber"
            },
            "Carrot": {
                calories: 41,
                protein: 0.9,
                carbs: 10,
                fat: 0.2,
                key: "carrot"
            },
            "Broccoli": {
                calories: 34,
                protein: 2.8,
                carbs: 7,
                fat: 0.4,
                key: "broccoli"
            },
            "Spinach": {
                calories: 23,
                protein: 2.9,
                carbs: 3.6,
                fat: 0.4,
                key: "spinach"
            },
            "Cauliflower": {
                calories: 25,
                protein: 1.9,
                carbs: 5,
                fat: 0.3,
                key: "cauliflower"
            },
            "Green Beans": {
                calories: 31,
                protein: 1.8,
                carbs: 7,
                fat: 0.2,
                key: "green_beans"
            },
            "Zucchini": {
                calories: 17,
                protein: 1.2,
                carbs: 3.1,
                fat: 0.3,
                key: "zucchini"
            },
            "Eggplant": {
                calories: 25,
                protein: 1,
                carbs: 6,
                fat: 0.2,
                key: "eggplant"
            },
            "Asparagus": {
                calories: 20,
                protein: 2.2,
                carbs: 3.9,
                fat: 0.2,
                key: "asparagus"
            },
            "Brussels Sprouts": {
                calories: 43,
                protein: 3.4,
                carbs: 9,
                fat: 0.3,
                key: "brussels_sprouts"
            },
            "Kale": {
                calories: 49,
                protein: 4.3,
                carbs: 9,
                fat: 0.9,
                key: "kale"
            },
            "Potato": {
                calories: 93,
                protein: 2.5,
                carbs: 21,
                fat: 0.1,
                key: "potato"
            },
            "Sweet Potato": {
                calories: 86,
                protein: 1.6,
                carbs: 20,
                fat: 0.1,
                key: "sweet_potato"
            },
            "Mushrooms": {
                calories: 22,
                protein: 3.1,
                carbs: 3.3,
                fat: 0.3,
                key: "mushrooms"
            },
            "Corn": {
                calories: 86,
                protein: 3.3,
                carbs: 19,
                fat: 1.2,
                key: "corn"
            },
            "Peas": {
                calories: 81,
                protein: 5.4,
                carbs: 14,
                fat: 0.4,
                key: "peas"
            },
            "Beetroot": {
                calories: 43,
                protein: 1.6,
                carbs: 10,
                fat: 0.2,
                key: "beetroot"
            },
            "Cabbage": {
                calories: 25,
                protein: 1.3,
                carbs: 6,
                fat: 0.1,
                key: "cabbage"
            },
            "Lettuce": {
                calories: 15,
                protein: 1.4,
                carbs: 2.9,
                fat: 0.2,
                key: "lettuce"
            }
        }
    },
    fruits: {
        name: "Fruits",
        items: {
            "Majdool Dates": {
                calories: 277, protein: 1.8, carbs: 75, fat: 0.2, key: "dates_majdool"
            },
            "Pineapple": {
                calories: 50, protein: 0.5, carbs: 13, fat: 0.1, key: "pineapple"
            },
            "Orange": {
                calories: 47, protein: 0.9, carbs: 12, fat: 0.1, key: "orange"
            },
            "Banana": {
                calories: 89, protein: 1.1, carbs: 23, fat: 0.3, key: "banana"
            },
            "Watermelon": {
                calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, key: "watermelon"
            },
            "Honey Melon": {
                calories: 34, protein: 0.8, carbs: 8.2, fat: 0.2, key: "honey_melon"
            },
            "Apple": {
                calories: 52, protein: 0.3, carbs: 14, fat: 0.2, key: "apple"
            },
            "Grapes": {
                calories: 69, protein: 0.7, carbs: 18, fat: 0.2, key: "grapes"
            },
            "Strawberries": {
                calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, key: "strawberries"
            },
            "Blueberries": {
                calories: 57, protein: 0.7, carbs: 14, fat: 0.3, key: "blueberries"
            },
            "Mango": {
                calories: 60, protein: 0.8, carbs: 15, fat: 0.4, key: "mango"
            },
            "Peach": {
                calories: 39, protein: 0.9, carbs: 9.5, fat: 0.3, key: "peach"
            },
            "Pear": {
                calories: 57, protein: 0.4, carbs: 15, fat: 0.1, key: "pear"
            },
            "Kiwi": {
                calories: 61, protein: 1.1, carbs: 15, fat: 0.5, key: "kiwi"
            },
            "Pomegranate": {
                calories: 83, protein: 1.7, carbs: 19, fat: 1.2, key: "pomegranate"
            },
            "Avocado": {
                calories: 160, protein: 2, carbs: 8.5, fat: 14.7, key: "avocado"
            },
            "Grapefruit": {
                calories: 42, protein: 0.8, carbs: 10.7, fat: 0.1, key: "grapefruit"
            },
            "Cherries": {
                calories: 50, protein: 1, carbs: 12, fat: 0.3, key: "cherries"
            },
            "Plum": {
                calories: 46, protein: 0.7, carbs: 11.4, fat: 0.3, key: "plum"
            },
            "Raspberries": {
                calories: 52, protein: 1.2, carbs: 11.9, fat: 0.7, key: "raspberries"
            }
        }
    },
    nuts: {
        name: "Nuts & Seeds",
        items: {
            "Almonds": {
                calories: 579, protein: 21, carbs: 22, fat: 50, key: "almonds"
            },
            "Walnuts": {
                calories: 654, protein: 15, carbs: 14, fat: 65, key: "walnuts"
            },
            "Pecans": {
                calories: 691, protein: 9, carbs: 14, fat: 72, key: "pecans"
            },
            "Cashews": {
                calories: 553, protein: 18, carbs: 30, fat: 44, key: "cashews"
            },
            "Peanuts": {
                calories: 567, protein: 26, carbs: 16, fat: 49, key: "peanuts"
            },
            "Pistachios": {
                calories: 562, protein: 20, carbs: 28, fat: 45, key: "pistachios"
            },
            "Chia Seeds": {
                calories: 486, protein: 17, carbs: 42, fat: 31, key: "chia_seeds"
            },
            "Flax Seeds": {
                calories: 534, protein: 18, carbs: 29, fat: 42, key: "flax_seeds"
            },
            "Sunflower Seeds": {
                calories: 584, protein: 21, carbs: 20, fat: 51, key: "sunflower_seeds"
            },
            "Pumpkin Seeds": {
                calories: 559, protein: 30, carbs: 11, fat: 49, key: "pumpkin_seeds"
            }
        }
    },
    snacks: {
        name: "Snacks & Sweets",
        items: {
            "Dark Chocolate": {
                calories: 598, protein: 7.9, carbs: 45, fat: 43, key: "dark_chocolate"
            },
            "Milk Chocolate": {
                calories: 545, protein: 7.4, carbs: 59, fat: 31, key: "milk_chocolate"
            },
            "Potato Chips": {
                calories: 536, protein: 7, carbs: 53, fat: 35, key: "potato_chips"
            },
            "Popcorn": {
                calories: 375, protein: 11, carbs: 74, fat: 4, key: "popcorn"
            },
            "Trail Mix": {
                calories: 462, protein: 15, carbs: 42, fat: 29, key: "trail_mix"
            }
        }
    },
    beverages: {
        name: "Beverages",
        items: {
            "Orange Juice": {
                calories: 45, protein: 0.7, carbs: 10, fat: 0.2, key: "orange_juice"
            },
            "Apple Juice": {
                calories: 46, protein: 0.1, carbs: 11.3, fat: 0.1, key: "apple_juice"
            },
            "Coffee (black)": {
                calories: 2, protein: 0.3, carbs: 0, fat: 0, key: "coffee_black"
            },
            "Green Tea": {
                calories: 0, protein: 0, carbs: 0, fat: 0, key: "green_tea"
            },
            "Coca Cola": {
                calories: 42, protein: 0, carbs: 10.6, fat: 0, key: "coca_cola"
            }
        }
    }
};

// Export for use in food-selector.js
window.defaultFoodData = defaultFoodData; 