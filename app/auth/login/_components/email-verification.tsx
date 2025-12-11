'use client';

import { BetterAuthActionButton } from '@/components/auth/better-auth-action-button';
import { authClient } from '@/lib/auth-client';
import { useEffect, useRef, useState } from 'react';

export function EmailVerification({ email }: { email: string }) {
  const [timeToNextResend, setTimeToNextResend] = useState(30);
  const interval = useRef<NodeJS.Timeout>(undefined);

  const startEmailVerificationCountdown = (time = 30) => {
    setTimeToNextResend(time);
    interval.current = setInterval(() => {
      setTimeToNextResend((t) => {
        const newT = t - 1;

        if (t <= 0) {
          clearInterval(interval.current);
          return 0;
        }
        return newT;
      });
    }, 1000);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    startEmailVerificationCountdown();
  }, []);

  return (
    <div className='space-y-4'>
      <p className='text-sm text-muted-foreground mt-2'>
        We sent you a verification link. Please check your email ({email}) and
        click the link to verify your account.
      </p>

      <BetterAuthActionButton
        variant='outline'
        successMessage='Verification email sent!'
        action={() => {
          return authClient.sendVerificationEmail({ email, callbackURL: '/' });
        }}
        disabled={timeToNextResend > 0}
        className='w-full'
      >
        {timeToNextResend > 0
          ? `Resend Email ${timeToNextResend}`
          : 'Resend Email'}
      </BetterAuthActionButton>
    </div>
  );
}
