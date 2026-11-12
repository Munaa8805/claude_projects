/** Nutrition values for one serving. Shared by foods and log entries. */
export interface Nutrients {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
}

export type FoodCategory =
  | "Protein"
  | "Grains"
  | "Fruit"
  | "Vegetables"
  | "Dairy"
  | "Nuts & fats"
  | "Legumes";

export interface Food extends Nutrients {
  id: number;
  name: string;
  category: FoodCategory;
  /** Human-readable serving, e.g. "1 cup (158 g)". */
  servingSize: string;
}

/**
 * One line in the daily log. Nutrition values are a per-serving snapshot
 * taken when the food was logged, so editing a food later never rewrites history.
 */
export interface LogEntry extends Nutrients {
  id: number;
  date: string; // YYYY-MM-DD, in the user's local calendar
  foodId: number | null;
  name: string;
  servingSize: string;
  servings: number;
  createdAt: string;
}

export interface Settings {
  calorieGoal: number;
}
