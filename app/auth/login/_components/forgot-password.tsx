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
import { Button } from '@/components/ui/button';
import { LoadingSwap } from '@/components/ui/loading-swap';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

const forgotPasswordSchema = z.object({
  email: z.email(),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export function ForgotPassword({
  openSignInTab,
}: {
  openSignInTab: () => void;
}) {
  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleForgotPassword = async (data: ForgotPasswordForm) => {
    await authClient.requestPasswordReset(
      {
        ...data,
        redirectTo: '/auth/reset-password',
      },
      {
        onError: (error) => {
          console.log('error =>', error);
          toast.error(
            error.error.message || 'Failed to send password reset email',
          );
        },
        onSuccess: () => {
          toast.success('Password reset email sent');
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form
        className='space-y-4'
        onSubmit={form.handleSubmit(handleForgotPassword)}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex gap-2'>
          <Button
            type='button'
            variant='outline'
            disabled={form.formState.isSubmitting}
            onClick={openSignInTab}
          >
            Back
          </Button>
          <Button
            type='submit'
            disabled={form.formState.isSubmitting}
            className='flex-1'
          >
            <LoadingSwap isLoading={form.formState.isSubmitting}>
              Send Reset Email
            </LoadingSwap>
          </Button>
        </div>
      </form>
    </Form>
  );
}
