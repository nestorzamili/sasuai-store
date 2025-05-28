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
import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { AvatarUpload } from './avatar-upload';
import { UserUpdateData } from '@/lib/types/user';

const profileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: 'Name must be at least 3 characters.' })
    .max(50, { message: 'Name must not be longer than 50 characters.' }),
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
    username?: string | null;
    email: string;
    image: string;
  } | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
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
      formValues.username !== userProfile.username ||
      formValues.email !== userProfile.email ||
      formValues.image !== userProfile.image
    );
  }, [form, userProfile]);

  useEffect(() => {
    if (user) {
      const userValues = {
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        image: user.image || '',
      };

      form.reset(userValues);
      setUserProfile(userValues);
    }
  }, [user, form]);

  const handleEmailChange = useCallback(
    async (newEmail: string) => {
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
        console.error('Error changing email:', error);
        toast({
          title: 'Unexpected Error',
          description: 'An unexpected error occurred while changing email.',
          variant: 'destructive',
        });
      }
    },
    [form, router, userProfile?.email],
  );

  const handleImageChange = useCallback(
    (imageUrl: string) => {
      form.setValue('image', imageUrl);
      form.trigger('image');
    },
    [form],
  );

  const handleProfileUpdate = useCallback(
    async (data: ProfileFormValues) => {
      setIsUpdating(true);

      try {
        const hasImageChanged = data.image !== userProfile?.image;
        const hasNameChanged = data.name !== userProfile?.name;
        const hasUsernameChanged = data.username !== userProfile?.username;

        const updateData: UserUpdateData = {};

        // Add fields that have changed
        if (hasNameChanged) updateData.name = data.name;
        if (hasUsernameChanged && data.username !== '')
          updateData.username = data.username;

        // Update name and username only if they've changed
        if (Object.keys(updateData).length > 0) {
          await authClient.updateUser(updateData);
        }

        // Handle image separately to avoid username conflicts
        if (hasImageChanged) {
          try {
            await authClient.updateUser({
              image: data.image || null, // Send null explicitly when removing image
            });
          } catch (imageError) {
            console.error('Error updating image:', imageError);
            toast({
              title: 'Profile Updated',
              description:
                'Profile updated but there was an issue with the profile picture.',
              variant: 'default',
            });
          }
        }

        // Handle email change
        if (data.email !== userProfile?.email) {
          await handleEmailChange(data.email);
        } else {
          toast({
            title: 'Profile Updated',
            description: 'Your profile information has been updated.',
          });
          setUserProfile({
            name: data.name,
            username: data.username,
            email: data.email,
            image: data.image || '',
          });

          await refreshSession();
          router.refresh();
        }
      } catch (error: unknown) {
        // Type narrowing for safer error handling
        const errorMessage =
          error instanceof Error
            ? error.message
            : typeof error === 'object' && error !== null && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'An unknown error occurred';

        if (errorMessage.includes('username')) {
          if (
            errorMessage.includes('taken') ||
            errorMessage.includes('exists')
          ) {
            form.setError('username', {
              type: 'manual',
              message:
                'This username is already taken. Please try another one.',
            });
          } else {
            form.setError('username', {
              type: 'manual',
              message:
                errorMessage || 'There was a problem updating your username.',
            });
          }
        } else {
          toast({
            title: 'Update Failed',
            description:
              errorMessage || 'There was a problem updating your profile.',
            variant: 'destructive',
          });
        }
      } finally {
        setIsUpdating(false);
      }
    },
    [userProfile, handleEmailChange, refreshSession, router, form],
  );

  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50">
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-[1fr_3fr] gap-8 pt-6">
          {/* Avatar upload section */}
          <div className="flex flex-col items-center space-y-4">
            <AvatarUpload
              currentImage={userProfile?.image || ''}
              name={userProfile?.name || ''}
              onImageChange={handleImageChange}
            />
            <p className="text-sm text-muted-foreground text-center px-2">
              Upload a profile picture to personalize your account
            </p>
          </div>

          {/* Profile form section */}
          <div>
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
                        Your name as displayed on your profile
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="username"
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
                </div>

                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <Input
                        type="hidden"
                        {...field}
                        value={field.value || ''}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    disabled={
                      isUpdating || !hasFormChanges || !form.formState.isValid
                    }
                  >
                    {isUpdating ? 'Updating...' : 'Update Profile'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
