import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
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

export default function ProfileForm() {
  const t = useTranslations('profile.form');
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const { user, isLoading: isAuthLoading, refreshSession } = useAuth();
  const [userProfile, setUserProfile] = useState<{
    name: string;
    username?: string | null;
    email: string;
    image: string;
  } | null>(null);

  const profileFormSchema = z.object({
    name: z
      .string()
      .trim()
      .min(3, { message: t('validation.nameMinLength') })
      .max(50, { message: t('validation.nameMaxLength') }),
    username: z
      .string()
      .trim()
      .min(5, { message: t('validation.usernameMinLength') })
      .max(20, { message: t('validation.usernameMaxLength') })
      .regex(/^[a-z0-9_-]+$/, {
        message: t('validation.usernameFormat'),
      })
      .optional()
      .nullable(),
    email: z.string({ required_error: t('validation.emailRequired') }).email({
      message: t('validation.emailInvalid'),
    }),
    image: z
      .string()
      .url({ message: t('validation.imageInvalidUrl') })
      .optional()
      .nullable()
      .or(z.literal('')),
  });

  type ProfileFormValues = z.infer<typeof profileFormSchema>;

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

  const formValues = form.watch();

  const hasFormChanges = useMemo(() => {
    if (!userProfile) return false;

    const changes =
      formValues.name !== userProfile.name ||
      formValues.username !== userProfile.username ||
      formValues.email !== userProfile.email ||
      formValues.image !== userProfile.image;

    console.log('Form change detection:', {
      formValues,
      userProfile,
      hasChanges: changes,
      isValid: form.formState.isValid,
    });

    return changes;
  }, [formValues, userProfile, form.formState.isValid]);

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
                title: t('verificationRequired'),
                description: t('checkEmailConfirm'),
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
                  title: t('emailChangeFailed'),
                  description: t('emailAlreadyRegistered'),
                  variant: 'destructive',
                });
              } else {
                toast({
                  title: t('emailChangeFailed'),
                  description: errorMessage,
                  variant: 'destructive',
                });
              }
            },
          }
        );
      } catch (error) {
        console.error('Error changing email:', error);
        toast({
          title: t('updateFailed'),
          description: t('unexpectedError'),
          variant: 'destructive',
        });
      }
    },
    [form, router, userProfile?.email, t]
  );

  const handleImageChange = useCallback(
    (imageUrl: string) => {
      form.setValue('image', imageUrl);
      form.trigger('image');
    },
    [form]
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
              title: t('profileUpdated'),
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
            title: t('profileUpdated'),
            description: t('profileUpdatedMessage'),
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
              message: t('usernameTaken'),
            });
          } else {
            form.setError('username', {
              type: 'manual',
              message: errorMessage || t('usernameUpdateProblem'),
            });
          }
        } else {
          toast({
            title: t('updateFailed'),
            description: errorMessage || t('problemUpdating'),
            variant: 'destructive',
          });
        }
      } finally {
        setIsUpdating(false);
      }
    },
    [userProfile, handleEmailChange, refreshSession, router, form, t]
  );

  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-muted-foreground">{t('loading')}</div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50">
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
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
              {t('avatarDescription')}
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
                      <FormLabel>{t('fullName')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('fullNamePlaceholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('fullNameDescription')}
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
                        <FormLabel>{t('username')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('usernamePlaceholder')}
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>
                          {t('usernameDescription')}
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
                        <FormLabel>{t('email')}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder={t('emailPlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {t('emailDescription')}
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
                    {isUpdating ? t('updating') : t('updateProfile')}
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
