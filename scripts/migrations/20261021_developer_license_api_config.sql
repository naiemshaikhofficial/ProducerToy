-- ==============================================================================
-- ProducerToy Marketplace Developer External License API Configuration Migration
-- Migration File: 20261021_developer_license_api_config.sql
-- Description: Adds external developer license generation webhook & API fields to products table
-- Reversible: Yes (see rollback script at bottom)
-- ==============================================================================

DO $$
BEGIN
    -- 1. License Delivery Type ('pool', 'external_api', 'dedicated_licensing_server', 'direct_download')
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'license_delivery_type'
    ) THEN
        ALTER TABLE products ADD COLUMN license_delivery_type TEXT NOT NULL DEFAULT 'pool';
    END IF;

    -- 2. Developer Webhook / API Endpoint URL
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'license_api_url'
    ) THEN
        ALTER TABLE products ADD COLUMN license_api_url TEXT;
    END IF;

    -- 3. Developer Webhook Secret / Bearer Token
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'license_api_secret'
    ) THEN
        ALTER TABLE products ADD COLUMN license_api_secret TEXT;
    END IF;

    -- 4. Timeout in milliseconds (default 3000ms)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'license_api_timeout_ms'
    ) THEN
        ALTER TABLE products ADD COLUMN license_api_timeout_ms INTEGER NOT NULL DEFAULT 3000;
    END IF;

    -- 5. Fallback to pre-loaded serial keys pool if external API times out or fails
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'license_api_fallback_to_pool'
    ) THEN
        ALTER TABLE products ADD COLUMN license_api_fallback_to_pool BOOLEAN NOT NULL DEFAULT TRUE;
    END IF;
END $$;

-- Update existing products with delivery_method consistency
UPDATE products
SET license_delivery_type = 'dedicated_licensing_server'
WHERE delivery_method IN ('dedicated_licensing_server', 'dedicated_licensing', 'machine_bound', 'licensing_server')
  AND (license_delivery_type IS NULL OR license_delivery_type = 'pool');

UPDATE products
SET license_delivery_type = 'direct_download'
WHERE (delivery_method IN ('direct_download', 'keyless', 'no_serial', 'direct_cloud_zip')
   OR product_type IN ('sample_pack', 'preset'))
  AND (license_delivery_type IS NULL OR license_delivery_type = 'pool');

-- ==============================================================================
-- ROLLBACK SCRIPT (Execute only to undo changes):
-- ALTER TABLE products DROP COLUMN IF EXISTS license_delivery_type;
-- ALTER TABLE products DROP COLUMN IF EXISTS license_api_url;
-- ALTER TABLE products DROP COLUMN IF EXISTS license_api_secret;
-- ALTER TABLE products DROP COLUMN IF EXISTS license_api_timeout_ms;
-- ALTER TABLE products DROP COLUMN IF EXISTS license_api_fallback_to_pool;
-- ==============================================================================
