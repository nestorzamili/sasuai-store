'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { IconClock } from '@tabler/icons-react';

interface CountdownTimerProps {
  expiryDate: Date;
  className?: string;
  showIcon?: boolean;
}

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
};

export function CountdownTimer({
  expiryDate,
  className = '',
  showIcon = true,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  // Calculate time left between now and target date
  const calculateTimeLeft = (): TimeLeft | null => {
    const difference = new Date(expiryDate).getTime() - new Date().getTime();

    if (difference <= 0) {
      setIsExpired(true);
      return null;
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      ),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
      total: difference,
    };
  };

  useEffect(() => {
    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Set up interval for countdown
    const timer = setInterval(() => {
      const updatedTimeLeft = calculateTimeLeft();
      setTimeLeft(updatedTimeLeft);

      if (!updatedTimeLeft) {
        clearInterval(timer);
      }
    }, 1000);

    // Clean up interval
    return () => clearInterval(timer);
  }, [expiryDate]);

  if (isExpired) {
    return <Badge variant="destructive">Expired</Badge>;
  }

  if (!timeLeft) {
    return null;
  }

  // Format display based on time remaining
  const formatDisplay = () => {
    if (timeLeft.days > 0) {
      return (
        <Badge
          variant="outline"
          className={`bg-yellow-100 text-yellow-800 border-yellow-300 ${className}`}
        >
          {showIcon && <IconClock className="mr-1 h-4 w-4" />}
          {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
        </Badge>
      );
    } else if (timeLeft.hours > 0) {
      return (
        <Badge
          variant="outline"
          className={`bg-orange-100 text-orange-800 border-orange-300 ${className}`}
        >
          {showIcon && <IconClock className="mr-1 h-4 w-4" />}
          {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive" className={className}>
          {showIcon && <IconClock className="mr-1 h-4 w-4" />}
          {timeLeft.minutes}m {timeLeft.seconds}s
        </Badge>
      );
    }
  };

  return formatDisplay();
}
