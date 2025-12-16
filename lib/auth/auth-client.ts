import { createAuthClient } from 'better-auth/react';
import { auth } from './auth';
import {
  inferAdditionalFields,
  twoFactorClient,
  adminClient,
} from 'better-auth/client/plugins';
import { passkeyClient } from '@better-auth/passkey/client';
import { ac, admin, user } from '@/components/auth/permissisons';

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    twoFactorClient({
      onTwoFactorRedirect: () => {
        window.location.href = '/auth/2fa';
      },
    }),
    passkeyClient(),
    adminClient({
      ac,
      roles: {
        admin,
        user,
      },
    }),
  ],
});
