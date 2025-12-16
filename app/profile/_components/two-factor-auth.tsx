'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { LoadingSwap } from '@/components/ui/loading-swap';
import { authClient } from '@/lib/auth/auth-client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { PasswordInput } from '@/components/ui/password-input';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import QRCode from 'react-qr-code';

const twoFactorAuthSchema = z.object({
  password: z.string().min(8),
});

type TwoFactorAuthForm = z.infer<typeof twoFactorAuthSchema>;
type TwoFactorData = {
  totpURI: string;
  backupCodes: string[];
};

export function TwoFactorAuth({ isEnabled }: { isEnabled: boolean }) {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(twoFactorAuthSchema),
    defaultValues: {
      password: '',
    },
  });

  const [twoFactorData, setTwoFactorData] = useState<TwoFactorData | null>(
    null,
  );

  const handleDisableTwoFactorAuth = async (data: TwoFactorAuthForm) => {
    await authClient.twoFactor.disable(
      {
        password: data.password,
      },
      {
        onError: (error) => {
          toast.error(error.error.message || 'Failed to disable 2FA');
        },
        onSuccess: () => {
          form.reset();
          router.refresh();
        },
      },
    );
  };

  const handleEnableTwoFactorAuth = async (data: TwoFactorAuthForm) => {
    const result = await authClient.twoFactor.enable({
      password: data.password,
    });

    if (result.error) {
      toast.error(result.error.message || 'Failed to enable 2FA');
    } else {
      setTwoFactorData(result.data);
      form.reset();
    }
  };

  if (twoFactorData !== null) {
    return (
      <QRCodeVerify
        {...twoFactorData}
        onDone={() => {
          setTwoFactorData(null);
        }}
      />
    );
  }

  return (
    <Form {...form}>
      <form
        className='space-y-4'
        onSubmit={form.handleSubmit(
          isEnabled ? handleDisableTwoFactorAuth : handleEnableTwoFactorAuth,
        )}
      >
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type='submit'
          variant={isEnabled ? 'destructive' : 'default'}
          disabled={form.formState.isSubmitting}
          className='w-full'
        >
          <LoadingSwap isLoading={form.formState.isSubmitting}>
            {isEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </LoadingSwap>
        </Button>
      </form>
    </Form>
  );
}

const qrSchema = z.object({
  token: z.string().length(6),
});

type QrForm = z.infer<typeof qrSchema>;

function QRCodeVerify({
  totpURI,
  backupCodes,
  onDone,
}: TwoFactorData & { onDone: () => void }) {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(qrSchema),
    defaultValues: {
      token: '',
    },
  });

  const [successfullyEnabled, setSuccessfullyEnabled] = useState(false);

  const handleQrCode = async (data: QrForm) => {
    await authClient.twoFactor.verifyTotp(
      {
        code: data.token,
      },
      {
        onError: (error) => {
          toast.error(error.error.message || 'Failed to verify code');
        },
        onSuccess: () => {
          setSuccessfullyEnabled(true);
          router.refresh();
        },
      },
    );
  };

  if (successfullyEnabled) {
    return (
      <>
        <p className='text-sm text-muted-foreground mb-2'>
          Save these backup codes in a safe place. You can use them to access
          your account.
        </p>
        <div className='grid grid-cols-2 gap-2 mb-4'>
          {backupCodes.map((code, index) => (
            <div key={index} className='font-mono text-sm'>
              {code}
            </div>
          ))}
        </div>
        <Button variant='outline' onClick={onDone}>
          Done
        </Button>
      </>
    );
  }

  return (
    <div className='space-y-4'>
      <p className='text-muted-foreground'>
        Scan this QR code with your authenticator app and enter the code below.
      </p>

      <Form {...form}>
        <form className='space-y-4' onSubmit={form.handleSubmit(handleQrCode)}>
          <FormField
            control={form.control}
            name='token'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type='submit'
            disabled={form.formState.isSubmitting}
            className='w-full'
          >
            <LoadingSwap isLoading={form.formState.isSubmitting}>
              Submit Code
            </LoadingSwap>
          </Button>
        </form>
      </Form>

      <div className='p-4 bg-white w-fit'>
        <QRCode size={256} value={totpURI} />
      </div>
    </div>
  );
}
