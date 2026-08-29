-- =========================================================================
-- PRODUCER TOY: CLEAN ALL TESTING DATA SQL SCRIPT
-- Safe: Products, Categories, Subcategories, Brands are 100% PRESERVED
-- =========================================================================

-- Step 1: Clean all order, purchase, and reward transactions
DELETE FROM public.purchases;
DELETE FROM public.orders;
DELETE FROM public.gifts;
DELETE FROM public.reward_transactions;
DELETE FROM public.wishlists;
DELETE FROM public.product_reviews;

-- Step 2: Clean test profiles
DELETE FROM public.profiles;

-- Step 3: (Optional) Delete all registered Auth users from Supabase Auth
-- Uncomment the line below if you also want to delete user login accounts
-- DELETE FROM auth.users;

-- =========================================================================
-- VERIFICATION QUERY: Check row counts after cleanup
-- =========================================================================
SELECT 'products (SAFE)' AS "Table", COUNT(*) AS "Total Rows" FROM public.products
UNION ALL
SELECT 'categories (SAFE)', COUNT(*) FROM public.categories
UNION ALL
SELECT 'subcategories (SAFE)', COUNT(*) FROM public.subcategories
UNION ALL
SELECT 'brands (SAFE)', COUNT(*) FROM public.brands
UNION ALL
SELECT 'purchases (CLEANED)', COUNT(*) FROM public.purchases
UNION ALL
SELECT 'orders (CLEANED)', COUNT(*) FROM public.orders
UNION ALL
SELECT 'gifts (CLEANED)', COUNT(*) FROM public.gifts
UNION ALL
SELECT 'reward_transactions (CLEANED)', COUNT(*) FROM public.reward_transactions
UNION ALL
SELECT 'wishlists (CLEANED)', COUNT(*) FROM public.wishlists
UNION ALL
SELECT 'product_reviews (CLEANED)', COUNT(*) FROM public.product_reviews
UNION ALL
SELECT 'profiles (CLEANED)', COUNT(*) FROM public.profiles;
