'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import logo from '../../../public/images/logo.png';
import { Toaster } from '@/components/ui/toaster';

interface Props {
  children?: React.ReactNode;
  illustration?: string;
  title: string;
  subtitle?: string;
  tagline?: string;
}

export default function AuthLayout({
  children,
  illustration,
  title,
  subtitle,
  tagline = 'Modern solutions for modern business',
}: Props) {
  useEffect(() => {
    document.body.classList.add('auth-page-loaded');
    return () => {
      document.body.classList.remove('auth-page-loaded');
    };
  }, []);

  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden">
      <main className="flex flex-col flex-grow w-full h-full">
        <div className="flex flex-col lg:flex-row w-full h-full">
          {/* Illustration section - only visible on lg screens and up */}
          {illustration && (
            <div className="hidden lg:flex lg:w-2/5 xl:w-1/2 relative bg-gradient-to-br from-primary/5 to-primary/20">
              <div className="absolute inset-0 flex flex-col justify-center items-center p-6">
                <div className="absolute w-[450px] h-[450px] bg-primary/15 rounded-full"></div>

                {/* Illustration */}
                <div className="flex-1 flex items-center justify-center w-full">
                  <Image
                    src={illustration}
                    alt={`${title} Illustration`}
                    className="max-h-[calc(100vh-120px)] w-auto object-contain drop-shadow-xl"
                    style={{ maxWidth: '95%' }}
                    width={500}
                    height={500}
                    priority
                  />
                </div>

                {/* Brand tagline */}
                <div className="mb-8 text-center z-10">
                  <h2 className="text-2xl font-medium text-primary">
                    Sasuai Store
                  </h2>
                  <p className="text-muted-foreground mt-1.5 text-base leading-relaxed">
                    {tagline}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Content Section - always visible, adaptable width */}
          <div className="flex flex-col flex-grow lg:w-3/5 xl:w-1/2 h-full overflow-y-auto">
            <div className="flex flex-col min-h-full justify-center items-center px-4 py-10 md:py-0">
              <div className="w-full max-w-[480px] mx-auto">
                {/* Logo and header */}
                <div className="flex flex-col items-center text-center space-y-6 mb-8">
                  <div className="flex items-center justify-center bg-primary/5 p-4 rounded-full">
                    <Image
                      src={logo}
                      alt="Sasuai Store"
                      width={88}
                      height={88}
                      className="h-16 w-16 sm:h-22 sm:w-22 object-contain"
                      priority
                    />
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-2xl sm:text-3xl font-medium text-primary">
                      {title}
                    </h1>
                    {subtitle && (
                      <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Main content - children */}
                <div className="w-full">{children}</div>

                {/* Support link */}
                <div className="text-center text-sm sm:text-base text-muted-foreground mt-10">
                  Need help?{' '}
                  <a
                    href="https://nestorzamili.works/#contact"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-medium hover:underline transition-colors"
                  >
                    Contact support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add the Toaster component to display toast notifications */}
      <Toaster />
    </div>
  );
}
