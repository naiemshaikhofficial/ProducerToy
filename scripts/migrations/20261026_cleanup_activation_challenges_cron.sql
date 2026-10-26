-- ==============================================================================
-- ProducerToy Database Pruning & Activation Challenge Cleanup Migration
-- Migration File: 20261026_cleanup_activation_challenges_cron.sql
-- Description: Enables pg_cron extension, creates cleanup function and schedules
--              a recurring cron job to prune claimed/expired pairing challenges
--              to prevent table bloat and conserve database space.
-- ==============================================================================

-- 1. Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Create cleanup stored function
CREATE OR REPLACE FUNCTION clean_expired_activation_challenges()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete claimed challenges older than 10 minutes (DAW plugin has retrieved token)
    -- Delete pending/expired challenges whose TTL is in the past
    DELETE FROM activation_challenges
    WHERE (status = 'claimed' AND (claimed_at IS NULL OR claimed_at < NOW() - INTERVAL '10 minutes'))
       OR (expires_at < NOW() - INTERVAL '5 minutes')
       OR (status = 'expired');

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Unschedule existing job if already registered to avoid duplicates
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-activation-challenges') THEN
        PERFORM cron.unschedule('cleanup-activation-challenges');
    END IF;
END $$;

-- 4. Schedule cron job to run every 10 minutes
SELECT cron.schedule(
    'cleanup-activation-challenges',
    '*/10 * * * *',
    'SELECT clean_expired_activation_challenges();'
);
