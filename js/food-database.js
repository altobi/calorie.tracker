const defaultFoodData = {
    categories: {
        proteins: {
            name: "Proteins",
            items: {
                chicken_breast: {
                    name: "Chicken Breast",
                    calories: 165,
                    protein: 31,
                    fat: 3.6,
                    carbs: 0
                },
                salmon: {
                    name: "Salmon (Raw)",
                    calories: 208,
                    protein: 22,
                    fat: 13,
                    carbs: 0
                },
                egg: {
                    name: "Egg (Whole)",
                    calories: 155,
                    protein: 13,
                    fat: 11,
                    carbs: 1.1
                },
                tuna: {
                    name: "Tuna (Canned in Water)",
                    calories: 116,
                    protein: 26,
                    fat: 1,
                    carbs: 0
                },
                beef_steak: {
                    name: "Beef Steak (Lean)",
                    calories: 250,
                    protein: 26,
                    fat: 17,
                    carbs: 0
                },
                tofu: {
                    name: "Tofu (Firm)",
                    calories: 144,
                    protein: 17,
                    fat: 8.7,
                    carbs: 2.8
                },
                shrimp: {
                    name: "Shrimp (Cooked)",
                    calories: 99,
                    protein: 24,
                    fat: 0.3,
                    carbs: 0
                },
                turkey_breast: {
                    name: "Turkey Breast",
                    calories: 157,
                    protein: 34,
                    fat: 1.8,
                    carbs: 0
                },
                pork_chop: {
                    name: "Pork Chop (Lean)",
                    calories: 143,
                    protein: 23,
                    fat: 5.2,
                    carbs: 0
                },
                ground_beef: {
                    name: "Ground Beef (80/20)",
                    calories: 254,
                    protein: 17,
                    fat: 20,
                    carbs: 0
                },
                cod: {
                    name: "Cod Fillet",
                    calories: 82,
                    protein: 18,
                    fat: 0.7,
                    carbs: 0
                }
            }
        },
        dairy: {
            name: "Dairy",
            items: {
                whole_milk: {
                    name: "Whole Milk",
                    calories: 61,
                    protein: 3.2,
                    fat: 3.3,
                    carbs: 4.8
                },
                greek_yogurt: {
                    name: "Greek Yogurt (Plain)",
                    calories: 59,
                    protein: 10,
                    fat: 0.4,
                    carbs: 3.6
                },
                cheddar_cheese: {
                    name: "Cheddar Cheese",
                    calories: 402,
                    protein: 25,
                    fat: 33,
                    carbs: 1.3
                }
            }
        },
        grains: {
            name: "Grains",
            items: {
                white_rice: {
                    name: "White Rice (Cooked)",
                    calories: 130,
                    protein: 2.7,
                    fat: 0.3,
                    carbs: 28
                },
                bread_wheat: {
                    name: "Whole Wheat Bread",
                    calories: 247,
                    protein: 13,
                    fat: 3.4,
                    carbs: 41
                },
                oatmeal: {
                    name: "Oatmeal",
                    calories: 307,
                    protein: 13,
                    fat: 5.3,
                    carbs: 56
                },
                quinoa: {
                    name: "Quinoa (Cooked)",
                    calories: 120,
                    protein: 4.4,
                    fat: 1.9,
                    carbs: 21.3
                },
                brown_rice: {
                    name: "Brown Rice (Cooked)",
                    calories: 112,
                    protein: 2.6,
                    fat: 0.9,
                    carbs: 23.5
                }
            }
        },
        vegetables: {
            name: "Vegetables",
            items: {
                broccoli: {
                    name: "Broccoli (Raw)",
                    calories: 34,
                    protein: 2.8,
                    fat: 0.4,
                    carbs: 7
                },
                spinach: {
                    name: "Spinach (Raw)",
                    calories: 23,
                    protein: 2.9,
                    fat: 0.4,
                    carbs: 3.6
                },
                carrot: {
                    name: "Carrot (Raw)",
                    calories: 41,
                    protein: 0.9,
                    fat: 0.2,
                    carbs: 10
                },
                sweet_potato: {
                    name: "Sweet Potato",
                    calories: 86,
                    protein: 1.6,
                    fat: 0.1,
                    carbs: 20
                },
                bell_pepper: {
                    name: "Bell Pepper",
                    calories: 31,
                    protein: 1,
                    fat: 0.3,
                    carbs: 6
                },
                mushrooms: {
                    name: "Mushrooms",
                    calories: 22,
                    protein: 3.1,
                    fat: 0.3,
                    carbs: 3.3
                },
                asparagus: {
                    name: "Asparagus",
                    calories: 20,
                    protein: 2.2,
                    fat: 0.2,
                    carbs: 3.9
                }
            }
        },
        fruits: {
            name: "Fruits",
            items: {
                apple: {
                    name: "Apple",
                    calories: 52,
                    protein: 0.3,
                    fat: 0.2,
                    carbs: 14
                },
                banana: {
                    name: "Banana",
                    calories: 89,
                    protein: 1.1,
                    fat: 0.3,
                    carbs: 23
                },
                orange: {
                    name: "Orange",
                    calories: 47,
                    protein: 0.9,
                    fat: 0.1,
                    carbs: 12
                }
            }
        },
        snacks: {
            name: "Snacks",
            items: {
                almonds: {
                    name: "Almonds",
                    calories: 579,
                    protein: 21,
                    fat: 50,
                    carbs: 22
                },
                dark_chocolate: {
                    name: "Dark Chocolate (70%)",
                    calories: 598,
                    protein: 7.9,
                    fat: 43,
                    carbs: 45
                }
            }
        },
        beverages: {
            name: "Beverages",
            items: {
                orange_juice: {
                    name: "Orange Juice",
                    calories: 45,
                    protein: 0.7,
                    fat: 0.2,
                    carbs: 10
                },
                coffee_black: {
                    name: "Black Coffee",
                    calories: 2,
                    protein: 0.3,
                    fat: 0,
                    carbs: 0
                }
            }
        }
    }
};

// Export for use in food-selector.js
window.defaultFoodData = defaultFoodData; 