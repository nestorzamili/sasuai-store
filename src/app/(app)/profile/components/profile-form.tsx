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
    .min(3, { message: 'Name must be at least 3 characters.' })
    .max(50, { message: 'Name must not be longer than 50 characters.' }),
  displayUsername: z
    .string()
    .trim()
    .min(3, { message: 'Display Name must be at least 3 characters.' })
    .max(20, {
      message: 'Display Name must not be longer than 20 characters.',
    }),
  username: z
    .string()
    .trim()
    .min(5, { message: 'Username must be at least 5 characters.' })
    .max(20, { message: 'Username must not be longer than 20 characters.' })
    .regex(/^[a-z0-9_-]+$/, {
      message:
        'Username can only contain lowercase letters, numbers, underscores, and hyphens.',
    })
    .optional()
    .nullable(),
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
    displayUsername?: string | null;
    username?: string | null;
    email: string;
    image: string;
  } | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      displayUsername: '',
      username: '',
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
      formValues.displayUsername !== userProfile.displayUsername ||
      formValues.username !== userProfile.username ||
      formValues.email !== userProfile.email ||
      formValues.image !== userProfile.image
    );
  }, [form.watch(), userProfile]);

  useEffect(() => {
    if (user) {
      const userValues = {
        name: user.name || '',
        displayUsername: user.displayUsername || '',
        username: user.username || '',
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
      // Update user profile with username
      await authClient.updateUser({
        name: data.name,
        displayUsername: data.displayUsername,
        username: data.username,
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
          displayUsername: data.displayUsername,
          username: data.username,
          email: data.email,
          image: data.image || '',
        });

        await refreshSession();
        router.refresh();
      }
    } catch (error: any) {
      if (error?.message?.includes('username')) {
        if (
          error?.message?.includes('taken') ||
          error?.message?.includes('exists')
        ) {
          form.setError('username', {
            type: 'manual',
            message: 'This username is already taken. Please try another one.',
          });
        } else {
          form.setError('username', {
            type: 'manual',
            message:
              error?.message || 'There was a problem updating your username.',
          });
        }
      } else {
        toast({
          title: 'Update Failed',
          description:
            error?.message || 'There was a problem updating your profile.',
          variant: 'destructive',
        });
      }
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
                  <FormLabel>Full Name</FormLabel>
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
              name="displayUsername"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Your display name for your profile
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="johndoe"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Your unique username for signing in
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
