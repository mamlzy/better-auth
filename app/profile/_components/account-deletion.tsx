'use client';

import { BetterAuthActionButton } from '@/components/auth/better-auth-action-button';
import { authClient } from '@/lib/auth/auth-client';

export function AccountDeletion() {
  return (
    <BetterAuthActionButton
      variant='destructive'
      requireAreYouSure
      successMessage='Account deletion initiated. Please check your email to confirm.'
      action={() => authClient.deleteUser({ callbackURL: '/' })}
      className='w-full'
    >
      Delete Account Permanently
    </BetterAuthActionButton>
  );
}
