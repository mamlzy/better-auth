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
import { authClient } from '@/lib/auth/auth-client';
import { toast } from 'sonner';
import { NumberInput } from '@/components/ui/number-input';
import { useRouter } from 'next/navigation';

const profileUpdateSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  favoriteNumber: z.number().int(),
});

type ProfileUpdateForm = z.infer<typeof profileUpdateSchema>;

export function ProfileUpdateForm({
  user,
}: {
  user: { name: string; email: string; favoriteNumber: number };
}) {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: user,
  });

  const handleProfileUpdate = async (data: ProfileUpdateForm) => {
    const promises = [
      authClient.updateUser({
        name: data.name,
        favoriteNumber: data.favoriteNumber,
      }),
    ];

    if (data.email !== user.email) {
      console.log('data.email =>', data.email);
      promises.push(
        authClient.changeEmail({
          newEmail: data.email,
          callbackURL: '/profile',
        }),
      );
    }

    const res = await Promise.all(promises);

    const updateUserResult = res[0];
    const emailChangeResult = res[1] ?? { error: false };

    if (updateUserResult.error) {
      toast.error(updateUserResult.error.message || 'Failed to update profile');
    } else if (emailChangeResult.error) {
      toast.error(emailChangeResult.error.message || 'Failed to change email');
    } else {
      if (data.email !== user.email) {
        toast.success('Verify your new email to complete the change.');
      } else {
        toast.success('Profile updated successfully');
      }
    }

    router.refresh();
  };

  return (
    <Form {...form}>
      <form
        className='space-y-4'
        onSubmit={form.handleSubmit(handleProfileUpdate)}
      >
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <FormField
          control={form.control}
          name='favoriteNumber'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Favorite Number</FormLabel>
              <FormControl>
                <NumberInput {...field} />
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
            Update Profile
          </LoadingSwap>
        </Button>
      </form>
    </Form>
  );
}
