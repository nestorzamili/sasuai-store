import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

const profileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Name must be at least 2 characters.' })
    .max(50, { message: 'Name must not be longer than 50 characters.' }),
  email: z.string({ required_error: 'Email is required' }).email(),
  image: z
    .string()
    .url({ message: 'Please enter a valid image URL.' })
    .optional()
    .nullable()
    .or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileForm() {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const { user, isLoading: isAuthLoading, refreshSession } = useAuth();
  const [userProfile, setUserProfile] = useState<{
    name: string;
    email: string;
    image: string;
  } | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      email: '',
      image: '',
    },
    mode: 'onChange',
  });

  const hasFormChanges = useMemo(() => {
    if (!userProfile) return false;
    const formValues = form.getValues();
    return (
      formValues.name !== userProfile.name ||
      formValues.email !== userProfile.email ||
      formValues.image !== userProfile.image
    );
  }, [form.watch(), userProfile]);

  useEffect(() => {
    if (user) {
      const userValues = {
        name: user.name || '',
        email: user.email || '',
        image: user.image || '',
      };

      form.reset(userValues);
      setUserProfile(userValues);
    }
  }, [user, form]);

  const handleProfileUpdate = async (data: ProfileFormValues) => {
    setIsUpdating(true);

    try {
      await authClient.updateUser({
        name: data.name,
        image: data.image,
      });

      if (data.email !== userProfile?.email) {
        await handleEmailChange(data.email);
      } else {
        toast({
          title: 'Profile Updated',
          description: 'Your profile information has been updated.',
        });
        setUserProfile({
          name: data.name,
          email: data.email,
          image: data.image || '',
        });

        await refreshSession();
        router.refresh();
      }
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description:
          error?.message || 'There was a problem updating your profile.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEmailChange = async (newEmail: string) => {
    try {
      await authClient.changeEmail(
        {
          newEmail,
          callbackURL: '/',
        },
        {
          onSuccess: () => {
            toast({
              title: 'Verification Required',
              description:
                'Please check your email to confirm the email change.',
            });
            router.refresh();
          },
          onError: (ctx) => {
            const errorMessage = ctx.error?.message || '';
            if (
              errorMessage.includes('Email already exists') ||
              errorMessage.includes("Couldn't update your email")
            ) {
              form.setValue('email', userProfile?.email || '');
              toast({
                title: 'Email Change Failed',
                description:
                  'This email address is already registered with another account.',
                variant: 'destructive',
              });
            } else {
              toast({
                title: 'Email Change Failed',
                description: errorMessage,
                variant: 'destructive',
              });
            }
          },
        },
      );
    } catch (error) {
      toast({
        title: 'Unexpected Error',
        description: 'An unexpected error occurred while changing email.',
        variant: 'destructive',
      });
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleProfileUpdate)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your full name as displayed on your profile
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="your-email@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This is your verified email address
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Photo URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/avatar.jpg"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    URL for your profile photo or avatar
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={
                isUpdating || !hasFormChanges || !form.formState.isValid
              }
            >
              {isUpdating ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
