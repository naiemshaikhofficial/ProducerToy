'use client'

import React, { memo } from 'react'
import { Turnstile } from '@marsidev/react-turnstile'

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void
  onError?: () => void
  onExpire?: () => void
  className?: string
}

const TURNSTILE_DEFAULT_OPTIONS = {
  theme: 'dark' as const,
  size: 'normal' as const,
}

export const TurnstileWidget = memo(function TurnstileWidget({
  onSuccess,
  onError,
  onExpire,
  className = '',
}: TurnstileWidgetProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAAEke7vi0G2cAoQ9j'

  return (
    <div className={`flex justify-center my-3 ${className}`}>
      <Turnstile
        siteKey={siteKey}
        onSuccess={onSuccess}
        onError={onError}
        onExpire={onExpire}
        options={TURNSTILE_DEFAULT_OPTIONS}
      />
    </div>
  )
})

