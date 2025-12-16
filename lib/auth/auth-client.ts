import { createAuthClient } from 'better-auth/react';
import { auth } from './auth';
import {
  inferAdditionalFields,
  twoFactorClient,
} from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    twoFactorClient({
      onTwoFactorRedirect: () => {
        window.location.href = '/auth/2fa';
      },
    }),
  ],
});
