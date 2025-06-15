
// Two-language allergen list: display "English / Dutch", but store 'english'
export const ALLERGENS = [
  { english: "Gluten", dutch: "Gluten" },
  { english: "Crustaceans", dutch: "Schaaldieren" },
  { english: "Eggs", dutch: "Eieren" },
  { english: "Fish", dutch: "Vis" },
  { english: "Peanuts", dutch: "Pinda" },
  { english: "Soybeans", dutch: "Soja" },
  { english: "Milk", dutch: "Melk" },
  { english: "Tree Nuts", dutch: "Noten" },
  { english: "Celery", dutch: "Selderij" },
  { english: "Mustard", dutch: "Mosterd" },
  { english: "Sesame", dutch: "Sesam" },
  { english: "Sulphites", dutch: "Sulfiet" },
  { english: "Lupin", dutch: "Lupine" },
  { english: "Molluscs", dutch: "Weekdieren" },
];

// For select and form storage, always use only the English name:
export const ALLERGENS_ENGLISH = ALLERGENS.map(a => a.english);
