'use client';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import maintenance_image from '../../../../public/images/page-misc-under-maintenance.png';
import { Clock, RefreshCw, MessageSquare } from 'lucide-react';

export default function MaintenanceError() {
  return (
    <div className="min-h-svh flex flex-col md:flex-row">
      {/* Content section - moved to the left for better flow with the illustration */}
      <div className="w-full md:w-1/2 p-6 md:p-16 flex flex-col justify-center bg-background order-2 md:order-1">
        <div className="max-w-md mx-auto">
          <div className="inline-flex gap-2 items-center px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium mb-6">
            <Clock className="h-4 w-4" />
            Maintenance in Progress
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-primary">
            We're taking a short break
          </h1>
          <p className="text-muted-foreground mb-6 text-lg">
            We'll be back online shortly with a better experience for you.
          </p>
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-primary/10 p-1.5 rounded-full">
                <RefreshCw className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-primary">
                  Enhancing performance
                </h3>
                <p className="text-sm text-muted-foreground">
                  Making everything run smoother and faster
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-primary/10 p-1.5 rounded-full">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-primary">
                  Improving your experience
                </h3>
                <p className="text-sm text-muted-foreground">
                  Adding new features you'll love
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="bg-primary hover:bg-primary/90 flex items-center gap-2"
              onClick={() => window.location.reload()}
              size="lg"
            >
              <RefreshCw className="h-4 w-4" /> Refresh Page
            </Button>
            <Button
              variant="outline"
              className="border-primary/20 text-primary hover:bg-primary/10"
              size="lg"
            >
              <a
                href="https://nestorzamili.works/#contact"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium hover:underline transition-colors flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" /> Contact support
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Image section - moved to the right to match natural reading flow */}
      <div className="w-full md:w-1/2 h-[40vh] md:h-svh relative bg-muted/5 order-1 md:order-2 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/5"></div>
        <Image
          src={maintenance_image}
          alt="Person working comfortably with laptop on sofa"
          fill
          className="object-contain p-4 md:p-12"
          priority
        />
      </div>
    </div>
  );
}
