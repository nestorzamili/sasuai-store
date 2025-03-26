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
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Profile form schema
const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: 'Name must be at least 2 characters.',
    })
    .max(50, {
      message: 'Name must not be longer than 50 characters.',
    }),
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email(),
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
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Profile update form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      email: '',
      image: '',
    },
    mode: 'onChange',
  });

  // Fetch user data from session
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: session } = await authClient.getSession();

        if (session?.user) {
          const { name, email, image } = session.user;

          // Update form with user data
          form.reset({
            name: name || '',
            email: email || '',
            image: image || '',
          });

          // Store original email for comparison during submission
          setUserEmail(email || '');
        }
      } catch (error) {
        console.error('Error fetching user session:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [form]);

  // Handle profile update
  async function onSubmit(data: ProfileFormValues) {
    setIsUpdating(true);
    setAuthError(null);

    try {
      // Update user info first
      await authClient.updateUser({
        name: data.name,
        image: data.image,
      });

      // If email changed, handle it separately
      if (data.email !== userEmail) {
        try {
          await authClient.changeEmail({
            newEmail: data.email,
            callbackURL: '/profile',
          });

          toast({
            title: 'Email change initiated',
            description:
              'Please check your current email to verify this change.',
          });
        } catch (error: any) {
          console.error('Email change error:', error);

          // Handle any email-related error
          const errorMessage = error?.message || '';

          if (errorMessage.toLowerCase().includes('email already exists')) {
            setAuthError(
              'This email address is already registered with another account.',
            );
            // Reset email field to the original value
            form.setValue('email', userEmail);
            setIsUpdating(false);
            return;
          } else {
            toast({
              title: 'Email change failed',
              description:
                errorMessage || 'There was a problem changing your email.',
              variant: 'destructive',
            });
            setIsUpdating(false);
            return;
          }
        }
      } else {
        toast({
          title: 'Profile updated successfully',
          description: 'Your profile information has been updated.',
        });
      }

      // Only refresh if everything succeeded
      router.refresh();
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: 'Update failed',
        description:
          error?.message || 'There was a problem updating your profile.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  }

  if (isLoading) {
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
        {authError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
