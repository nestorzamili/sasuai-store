'use client';

import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { IconPlus } from '@tabler/icons-react';

interface RewardPrimaryButtonProps {
  onClick: () => void;
}

export default function RewardPrimaryButton({
  onClick,
}: RewardPrimaryButtonProps) {
  const t = useTranslations('reward.buttons');

  return (
    <Button variant="default" className="space-x-1" onClick={onClick}>
      <span>{t('createReward')}</span> <IconPlus size={18} />
    </Button>
  );
}
