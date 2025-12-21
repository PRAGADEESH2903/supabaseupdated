# Dealer Column Setup Guide

## Step 1: Check if dealer_id column exists

Run this SQL in your Supabase SQL Editor:

```sql
-- Check if dealer_id column exists
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'purchases' 
  AND column_name = 'dealer_id';
```

If this returns no rows, the column doesn't exist. Proceed to Step 2.

## Step 2: Add the dealer_id column

Run the SQL script: `add_dealer_column.sql` in your Supabase SQL Editor.

This will:
- Add the `dealer_id` column to the `purchases` table
- Create a foreign key relationship to `sub_dealers` table
- Create an index for better performance

## Step 3: Verify the setup

Run the verification script: `check_dealer_column.sql` in your Supabase SQL Editor.

This will show:
- If the column exists
- The foreign key constraint details

## Step 4: Test the API

After adding the column, test by:
1. Creating a purchase with a dealer_id
2. Searching for purchases - dealer information should appear

## Troubleshooting

If the dealer column still doesn't show:

1. **Check the foreign key constraint name:**
   ```sql
   SELECT constraint_name 
   FROM information_schema.table_constraints 
   WHERE table_name = 'purchases' 
     AND constraint_type = 'FOREIGN KEY'
     AND constraint_name LIKE '%dealer%';
   ```

2. **The Supabase query syntax might need adjustment:**
   - Current: `dealer_id:sub_dealers(*)`
   - Alternative: `dealer:sub_dealers(*)` (if relationship is named 'dealer')
   - Or: Check your Supabase dashboard for the relationship name

3. **Make sure you have data:**
   - Create at least one sub-dealer first
   - Create a purchase with that dealer_id
   - Then search for purchases

