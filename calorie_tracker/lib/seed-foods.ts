import type { Food } from "./types";

/**
 * Starter food list, inserted on first run (INSERT OR IGNORE by name, so adding
 * a food here later also adds it to existing databases).
 * Values are per serving, rounded from USDA FoodData Central reference entries.
 */
export const SEED_FOODS: Omit<Food, "id">[] = [
  // Protein
  { name: "Chicken breast, grilled", category: "Protein", servingSize: "100 g", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: "Egg, large", category: "Protein", servingSize: "1 egg (50 g)", calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8 },
  { name: "Salmon, baked", category: "Protein", servingSize: "100 g", calories: 206, protein: 22, carbs: 0, fat: 12 },
  { name: "Ground beef 85% lean, cooked", category: "Protein", servingSize: "100 g", calories: 250, protein: 26, carbs: 0, fat: 15 },
  { name: "Tuna, canned in water", category: "Protein", servingSize: "100 g drained", calories: 116, protein: 25.5, carbs: 0, fat: 0.8 },
  { name: "Turkey breast, sliced", category: "Protein", servingSize: "2 oz (56 g)", calories: 60, protein: 12, carbs: 2, fat: 0.5 },
  { name: "Tofu, firm", category: "Protein", servingSize: "100 g", calories: 144, protein: 17.3, carbs: 2.8, fat: 8.7 },

  // Grains
  { name: "White rice, cooked", category: "Grains", servingSize: "1 cup (158 g)", calories: 205, protein: 4.3, carbs: 44.5, fat: 0.4 },
  { name: "Brown rice, cooked", category: "Grains", servingSize: "1 cup (195 g)", calories: 218, protein: 4.5, carbs: 45.8, fat: 1.6 },
  { name: "Rolled oats, dry", category: "Grains", servingSize: "½ cup (40 g)", calories: 150, protein: 5, carbs: 27, fat: 3 },
  { name: "Whole wheat bread", category: "Grains", servingSize: "1 slice (32 g)", calories: 81, protein: 4, carbs: 13.8, fat: 1.1 },
  { name: "Pasta, cooked", category: "Grains", servingSize: "1 cup (140 g)", calories: 220, protein: 8.1, carbs: 43.2, fat: 1.3 },

  // Fruit
  { name: "Banana", category: "Fruit", servingSize: "1 medium (118 g)", calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { name: "Apple", category: "Fruit", servingSize: "1 medium (182 g)", calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { name: "Orange", category: "Fruit", servingSize: "1 medium (131 g)", calories: 62, protein: 1.2, carbs: 15.4, fat: 0.2 },
  { name: "Strawberries", category: "Fruit", servingSize: "1 cup (152 g)", calories: 49, protein: 1, carbs: 11.7, fat: 0.5 },
  { name: "Blueberries", category: "Fruit", servingSize: "1 cup (148 g)", calories: 84, protein: 1.1, carbs: 21.4, fat: 0.5 },

  // Vegetables
  { name: "Broccoli, steamed", category: "Vegetables", servingSize: "1 cup (156 g)", calories: 55, protein: 3.7, carbs: 11.2, fat: 0.6 },
  { name: "Spinach, raw", category: "Vegetables", servingSize: "1 cup (30 g)", calories: 7, protein: 0.9, carbs: 1.1, fat: 0.1 },
  { name: "Sweet potato, baked", category: "Vegetables", servingSize: "1 medium (114 g)", calories: 103, protein: 2.3, carbs: 23.6, fat: 0.2 },
  { name: "Potato, baked", category: "Vegetables", servingSize: "1 medium (173 g)", calories: 161, protein: 4.3, carbs: 36.6, fat: 0.2 },

  // Dairy
  { name: "Whole milk", category: "Dairy", servingSize: "1 cup (244 g)", calories: 149, protein: 7.7, carbs: 11.7, fat: 7.9 },
  { name: "Greek yogurt, plain nonfat", category: "Dairy", servingSize: "170 g", calories: 100, protein: 17, carbs: 6, fat: 0.7 },
  { name: "Cheddar cheese", category: "Dairy", servingSize: "1 oz (28 g)", calories: 113, protein: 7, carbs: 0.4, fat: 9.3 },
  { name: "Cottage cheese, 2%", category: "Dairy", servingSize: "½ cup (113 g)", calories: 92, protein: 12, carbs: 5, fat: 2.6 },

  // Nuts & fats
  { name: "Peanut butter", category: "Nuts & fats", servingSize: "2 tbsp (32 g)", calories: 190, protein: 7, carbs: 7, fat: 16 },
  { name: "Almonds", category: "Nuts & fats", servingSize: "1 oz (28 g)", calories: 164, protein: 6, carbs: 6.1, fat: 14.2 },
  { name: "Avocado", category: "Nuts & fats", servingSize: "½ fruit (100 g)", calories: 160, protein: 2, carbs: 8.5, fat: 14.7 },
  { name: "Olive oil", category: "Nuts & fats", servingSize: "1 tbsp (14 g)", calories: 119, protein: 0, carbs: 0, fat: 13.5 },

  // Legumes
  { name: "Black beans, cooked", category: "Legumes", servingSize: "½ cup (86 g)", calories: 114, protein: 7.6, carbs: 20.4, fat: 0.5 },
];
