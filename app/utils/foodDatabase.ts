// Food database with nutrition information per 100g
export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  servingSize: number; // in grams
  servingUnit: string;
}

export const foodDatabase: { [key: string]: FoodItem } = {
  'Adobo': {
    name: 'Adobo',
    calories: 182,
    protein: 7.2,
    fat: 5.4,
    carbs: 0.4,
    servingSize: 100,
    servingUnit: 'gram'
  },
  'White Rice': {
    name: 'White Rice',
    calories: 130,
    protein: 2.7,
    fat: 0.3,
    carbs: 28.2,
    servingSize: 100,
    servingUnit: 'gram'
  },
  'Boiled Eggs': {
    name: 'Boiled Eggs',
    calories: 155,
    protein: 12.6,
    fat: 11.3,
    carbs: 1.1,
    servingSize: 100,
    servingUnit: 'gram'
  },
  'Roasted Chicken': {
    name: 'Roasted Chicken',
    calories: 167,
    protein: 31.0,
    fat: 3.6,
    carbs: 0,
    servingSize: 100,
    servingUnit: 'gram'
  }
};

// Calculate nutrition values based on serving size and number of servings
export function calculateNutrition(
  foodName: string,
  servingSize: number,
  numServings: number
): {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  carbsPercent: number;
  fatPercent: number;
  proteinPercent: number;
} {
  const food = foodDatabase[foodName];
  if (!food) {
    throw new Error(`Food "${foodName}" not found in database`);
  }

  // Calculate the multiplier based on serving size and number of servings
  const multiplier = (servingSize / food.servingSize) * numServings;

  // Calculate nutrition values
  const calories = Math.round(food.calories * multiplier);
  const protein = Number((food.protein * multiplier).toFixed(1));
  const fat = Number((food.fat * multiplier).toFixed(1));
  const carbs = Number((food.carbs * multiplier).toFixed(1));

  // Calculate percentages
  const totalMacros = protein + fat + carbs;
  const carbsPercent = Math.round((carbs / totalMacros) * 100) || 0;
  const fatPercent = Math.round((fat / totalMacros) * 100) || 0;
  const proteinPercent = Math.round((protein / totalMacros) * 100) || 0;

  return {
    calories,
    protein,
    fat,
    carbs,
    carbsPercent,
    fatPercent,
    proteinPercent
  };
}

// Get serving size options for a food
export function getServingSizeOptions(foodName: string): { value: number; label: string }[] {
  const food = foodDatabase[foodName];
  if (!food) {
    throw new Error(`Food "${foodName}" not found in database`);
  }

  return [
    { value: 50, label: '50 grams' },
    { value: 100, label: '100 grams' },
    { value: 150, label: '150 grams' },
    { value: 200, label: '200 grams' }
  ];
} 