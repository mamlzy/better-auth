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
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Button } from '@/components/ui/button';
import { LoadingSwap } from '@/components/ui/loading-swap';
import { authClient } from '@/lib/auth/auth-client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { PasskeyButton } from './passkey-button';

const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

type SignInForm = z.infer<typeof signInSchema>;

export function SignInTab({
  openEmailVerificaitonTab,
  openForgotPasswordTab,
}: {
  openEmailVerificaitonTab: (email: string) => void;
  openForgotPasswordTab: () => void;
}) {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSignIn = async (data: SignInForm) => {
    await authClient.signIn.email(
      {
        ...data,
        callbackURL: '/',
      },
      {
        onError: (error) => {
          console.log('error =>', error);

          if (error.error.code === 'EMAIL_NOT_VERIFIED') {
            openEmailVerificaitonTab(data.email);
          }
          toast.error(error.error.message || 'Failed to sign in');
        },
        onSuccess: () => {
          router.push('/');
        },
      },
    );
  };

  return (
    <div className='space-y-4'>
      <Form {...form}>
        <form className='space-y-4' onSubmit={form.handleSubmit(handleSignIn)}>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input autoComplete='email webauthn' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <div className='flex justify-between items-center'>
                  <FormLabel>Password</FormLabel>
                  <Button
                    type='button'
                    variant='link'
                    size='sm'
                    onClick={openForgotPasswordTab}
                    className='text-sm font-normal underline'
                  >
                    Forgot Password?
                  </Button>
                </div>
                <FormControl>
                  <PasswordInput
                    autoComplete='current-password webauthn'
                    {...field}
                  />
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
              Sign In
            </LoadingSwap>
          </Button>
        </form>
      </Form>
      <PasskeyButton />
    </div>
  );
}
