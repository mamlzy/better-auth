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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';

const createOrganizationSchema = z.object({
  name: z.string().min(1),
});

type CreateOrganizationForm = z.infer<typeof createOrganizationSchema>;

export function CreateOrganizationButton({}) {
  const form = useForm({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: '',
    },
  });

  const [open, setOpen] = useState(false);

  const handleCreateOrganization = async (data: CreateOrganizationForm) => {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const res = await authClient.organization.create({
      name: data.name,
      slug,
    });

    if (res.error) {
      toast.error(res.error.message || 'Failed to create organization');
    } else {
      form.reset();
      setOpen(false);
      await authClient.organization.setActive({ organizationId: res.data.id });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Organization</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Organization</DialogTitle>
          <DialogDescription>
            Create a new organization to collaborate with your team.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className='space-y-4'
            onSubmit={form.handleSubmit(handleCreateOrganization)}
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

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={form.formState.isSubmitting}
                className='w-full sm:w-auto'
              >
                <LoadingSwap isLoading={form.formState.isSubmitting}>
                  Create
                </LoadingSwap>
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
