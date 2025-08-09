# Product Structure Analysis & Optimization Plan

## Current Product Fields Analysis

### Core Product Fields (products table)
```
Basic Info:
- id (uuid)
- name (text) 
- name_thai (text, optional)
- active (boolean)
- product_type ('zelfgemaakt', 'extern', 'ingredient', 'drink')

Production/Packaging:
- unit_size (numeric) - Size of individual unit
- unit_type (text) - Type of unit (liter, kg, piece, etc.)
- packages_per_batch (integer) - How many packages from one batch
- shelf_life_days (integer) - Only for self-made products

Supplier/Purchase Info:
- supplier_id (uuid, optional)
- supplier_name (text)
- supplier_package_unit (text) - What the supplier sells (CASE, BOX, TRAY, etc.)
- units_per_package (integer) - How many units in supplier's package
- inner_unit_type (text) - Type of inner unit
- price_per_package (numeric) - Cost per supplier package
- price_per_unit (numeric) - Calculated cost per individual unit

Pricing/Margin:
- cost (numeric)
- markup_percent (numeric)
- sales_price (numeric)
- minimal_margin_threshold_percent (numeric, default 25)

Other:
- pickable (boolean)
- product_fiche_url (text)
- allergens (text[])
```

## Current Issues Identified

### 1. Cost Calculation Confusion
- **Problem**: Multiple overlapping price fields (`cost`, `price_per_unit`, `price_per_package`)
- **Issue**: Unclear which is the "true cost" for margin calculations
- **Example**: For eggs - supplier sells 1 TRAY (30 eggs) for €5. Is cost per egg €0.167, or is the batch cost what matters?

### 2. Unit/Packaging Hierarchy Unclear
- **Problem**: Mixing purchase units, production units, and final package units
- **Issue**: Hard to trace from "I buy 1 TRAY of 30 eggs" → "I use 2 eggs in recipe" → "I produce 12L curry in 3 bags"

### 3. Label Calculation Incomplete
- **Problem**: `packages_per_batch` exists but relationship to actual packaging unclear
- **Issue**: No clear path from batch size to individual package size

## Business Target Analysis

### Target 1: Cost & Margin Calculation
**Current Flow Issues:**
```
Supplier Package → Individual Unit → Recipe Usage → Product Cost → Margin
   TRAY €5    →   30 eggs €0.167  →  2 eggs used  →  €0.33 cost  →  Calculate margin
```

**Missing Links:**
- Clear conversion factors
- Waste/loss calculations
- Labor costs integration

### Target 2: Label Printing
**Current Flow Issues:**
```
Batch Production → Individual Packages → Labels Needed
   12L curry    →    3 bags of 4L    →    3 labels
```

**Missing Links:**
- Clear package size definition
- Automatic label calculation

## Proposed Optimized Structure

### 1. Clearer Unit Hierarchy
```
LEVEL 1: PURCHASE UNIT (from supplier)
- supplier_package_unit: "TRAY" 
- supplier_package_size: 30
- supplier_package_cost: €5.00
- inner_unit_type: "PIECE" (what's inside the package)

LEVEL 2: RECIPE UNIT (what goes into recipes)  
- recipe_unit_type: "PIECE"
- recipe_unit_cost: €0.167 (calculated: €5.00 / 30)

LEVEL 3: PRODUCTION UNIT (what we produce)
- batch_size: 12 (total amount produced)
- batch_unit: "LITER" 
- final_package_size: 4 (size of each final package)
- final_package_unit: "LITER"
- packages_per_batch: 3 (calculated: 12L / 4L = 3 packages = 3 labels)
```

### 2. Cost Calculation Chain
```
TRUE COST CALCULATION:
1. Supplier Cost: €5.00 per TRAY (30 pieces)
2. Unit Cost: €5.00 / 30 = €0.167 per piece
3. Recipe Usage: 2 pieces × €0.167 = €0.33 ingredient cost
4. + Labor Cost + Other Ingredients = Total Product Cost
5. Apply markup → Sales Price
6. Calculate margin
```

### 3. Label Calculation
```
LABEL CALCULATION:
1. Batch Size: 12 LITER total produced
2. Package Size: 4 LITER per package  
3. Labels Needed: 12 / 4 = 3 labels
```

## Implementation Plan

### Phase 1: Database Schema Optimization
1. **Rename/clarify existing fields:**
   - `cost` → `total_cost_per_unit` (final calculated cost per unit for recipes)
   - `price_per_unit` → `supplier_cost_per_unit` (cost from supplier per inner unit)
   - Add `final_package_size` and `final_package_unit`

2. **Add missing fields:**
   - `supplier_package_size` (how many inner units in supplier package)
   - `final_package_size` (size of final consumer package)
   - `final_package_unit` (unit of final package)
   - `waste_factor` (percentage loss in production)

### Phase 2: Form Restructuring
1. **Group fields logically:**
   - Supplier/Purchase section
   - Production/Batch section  
   - Final Packaging section
   - Pricing/Margin section

2. **Add calculated fields:**
   - Auto-calculate `packages_per_batch` from batch_size / final_package_size
   - Auto-calculate `supplier_cost_per_unit` from price_per_package / units_per_package
   - Auto-calculate margins and show warnings

### Phase 3: Business Logic Enhancement
1. **Cost calculation improvements:**
   - Clear cost inheritance chain
   - Labor cost integration
   - Waste factor calculations

2. **Label calculation:**
   - Auto-suggest label count based on batch/package sizes
   - Production form integration

### Phase 4: UI/UX Improvements
1. **Visual hierarchy:**
   - Clear sections with explanations
   - Visual flow from purchase → production → final packaging
   - Cost breakdown display

2. **Validation:**
   - Ensure logical relationships
   - Warn about unusual margins
   - Suggest optimizations

## Would you like me to proceed with Phase 1 (database schema optimization) first?

This would involve:
1. Creating migration to add/rename fields
2. Updating TypeScript interfaces
3. Testing with existing data

Or would you prefer to start with a different phase or modify this plan?