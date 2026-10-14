-- ==============================================================================
-- ProducerToy Marketplace Product Licensing & Device Activation Migration
-- Migration File: 20261014_product_licensing.sql
-- Description: Adds device_activations, activation_challenges, and product policy fields
-- Reversible: Yes (see rollback script at the bottom)
-- ==============================================================================

-- 1. Extend products table with licensing policy fields if they do not exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'plugin_identifier') THEN
        ALTER TABLE products ADD COLUMN plugin_identifier TEXT UNIQUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'max_activation_seats') THEN
        ALTER TABLE products ADD COLUMN max_activation_seats INTEGER NOT NULL DEFAULT 3;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'offline_grace_days') THEN
        ALTER TABLE products ADD COLUMN offline_grace_days INTEGER NOT NULL DEFAULT 14;
    END IF;
END $$;

-- 2. Configure ProVerb plugin policy
UPDATE products
SET
    plugin_identifier = 'com.producertoy.proverb',
    max_activation_seats = 3,
    offline_grace_days = 14
WHERE id = '92cf2454-2cfc-4db5-b210-2c732457605f' OR slug = 'proverb';

-- 3. Create device_activations table to track active hardware seats per customer & product
CREATE TABLE IF NOT EXISTS device_activations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    purchase_id UUID REFERENCES purchases(id) ON DELETE SET NULL,
    device_id_hash TEXT NOT NULL,
    device_name TEXT NOT NULL DEFAULT 'Audio Workstation',
    os TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT uq_active_user_product_device UNIQUE (user_id, product_id, device_id_hash)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_device_activations_user_product
    ON device_activations (user_id, product_id)
    WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_device_activations_device_hash
    ON device_activations (device_id_hash);

-- Enable Row Level Security (RLS)
ALTER TABLE device_activations ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view their own device activations
CREATE POLICY "Users can view own device activations"
    ON device_activations
    FOR SELECT
    USING (auth.uid() = user_id);

-- RLS: Only service role can insert/update/delete device activations directly
CREATE POLICY "Service role manages device activations"
    ON device_activations
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');


-- 4. Create activation_challenges table for short-lived, single-use pairing codes
CREATE TABLE IF NOT EXISTS activation_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_code_hash TEXT NOT NULL UNIQUE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    device_id_hash TEXT NOT NULL,
    device_name TEXT NOT NULL DEFAULT 'Audio Workstation',
    os TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'expired', 'rejected')),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    entitlement_token TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    claimed_at TIMESTAMPTZ
);

-- Indexes for challenge lookups and cleanup
CREATE INDEX IF NOT EXISTS idx_activation_challenges_hash
    ON activation_challenges (challenge_code_hash)
    WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_activation_challenges_device
    ON activation_challenges (id, device_id_hash);

-- Enable RLS (Service role only - clients interact exclusively via API endpoints)
ALTER TABLE activation_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages activation challenges"
    ON activation_challenges
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- ==============================================================================
-- ROLLBACK SCRIPT (Run only to reverse this migration):
-- ==============================================================================
-- DROP TABLE IF EXISTS activation_challenges CASCADE;
-- DROP TABLE IF EXISTS device_activations CASCADE;
-- ALTER TABLE products DROP COLUMN IF EXISTS plugin_identifier;
-- ALTER TABLE products DROP COLUMN IF EXISTS max_activation_seats;
-- ALTER TABLE products DROP COLUMN IF EXISTS offline_grace_days;
