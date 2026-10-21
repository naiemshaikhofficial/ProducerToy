-- ==============================================================================
-- ProducerToy Marketplace Customer Privacy & Seller Data Sharing Consent Migration
-- Migration File: 20261021_customer_data_sharing_consent.sql
-- Description: Adds product-level data sharing controls and customer_data_consents audit table
-- Reversible: Yes (see rollback script at the bottom)
-- ==============================================================================

-- 1. Extend products table with product-level data sharing and custom EULA fields
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'seller_data_sharing_enabled') THEN
        ALTER TABLE products ADD COLUMN seller_data_sharing_enabled BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'data_sharing_purpose') THEN
        ALTER TABLE products ADD COLUMN data_sharing_purpose TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'data_sharing_fields') THEN
        ALTER TABLE products ADD COLUMN data_sharing_fields JSONB DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'data_sharing_disclosure_version') THEN
        ALTER TABLE products ADD COLUMN data_sharing_disclosure_version TEXT DEFAULT 'v1.0';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'requires_explicit_consent') THEN
        ALTER TABLE products ADD COLUMN requires_explicit_consent BOOLEAN NOT NULL DEFAULT TRUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'product_eula_url') THEN
        ALTER TABLE products ADD COLUMN product_eula_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'product_eula_text') THEN
        ALTER TABLE products ADD COLUMN product_eula_text TEXT;
    END IF;
END $$;

-- 2. Extend purchases table with data sharing consent tracking flag
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'seller_data_sharing_consented') THEN
        ALTER TABLE purchases ADD COLUMN seller_data_sharing_consented BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'consent_record_id') THEN
        ALTER TABLE purchases ADD COLUMN consent_record_id UUID;
    END IF;
END $$;

-- 3. Create customer_data_consents table for immutable audit records
CREATE TABLE IF NOT EXISTS customer_data_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_id TEXT NOT NULL,
    purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    seller_name TEXT NOT NULL,
    consent_given BOOLEAN NOT NULL DEFAULT FALSE,
    consented_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    stated_purpose TEXT NOT NULL,
    disclosure_version TEXT NOT NULL DEFAULT 'v1.0',
    product_license_version TEXT DEFAULT 'v1.0',
    consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_hash TEXT,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for fast lookups and audit verification
CREATE INDEX IF NOT EXISTS idx_customer_consents_user_product
    ON customer_data_consents (user_id, product_id);

CREATE INDEX IF NOT EXISTS idx_customer_consents_purchase
    ON customer_data_consents (purchase_id);

CREATE INDEX IF NOT EXISTS idx_customer_consents_order
    ON customer_data_consents (order_id);

CREATE INDEX IF NOT EXISTS idx_customer_consents_brand_product
    ON customer_data_consents (brand_id, product_id);

-- Enable Row Level Security (RLS)
ALTER TABLE customer_data_consents ENABLE ROW LEVEL SECURITY;

-- Policy 1: Authenticated users can view their own consent records
CREATE POLICY "Users can view own data sharing consents"
    ON customer_data_consents
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy 2: Service role can manage all consent audit records
CREATE POLICY "Service role manages customer data consents"
    ON customer_data_consents
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- ==============================================================================
-- ROLLBACK SCRIPT (Run only to reverse this migration):
-- ==============================================================================
-- DROP TABLE IF EXISTS customer_data_consents CASCADE;
-- ALTER TABLE purchases DROP COLUMN IF EXISTS seller_data_sharing_consented;
-- ALTER TABLE purchases DROP COLUMN IF EXISTS consent_record_id;
-- ALTER TABLE products DROP COLUMN IF EXISTS seller_data_sharing_enabled;
-- ALTER TABLE products DROP COLUMN IF EXISTS data_sharing_purpose;
-- ALTER TABLE products DROP COLUMN IF EXISTS data_sharing_fields;
-- ALTER TABLE products DROP COLUMN IF EXISTS data_sharing_disclosure_version;
-- ALTER TABLE products DROP COLUMN IF EXISTS requires_explicit_consent;
-- ALTER TABLE products DROP COLUMN IF EXISTS product_eula_url;
-- ALTER TABLE products DROP COLUMN IF EXISTS product_eula_text;
