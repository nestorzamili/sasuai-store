'use client';

import { Button } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';

interface RewardPrimaryButtonProps {
  onClick: () => void;
}

export default function RewardPrimaryButton({
  onClick,
}: RewardPrimaryButtonProps) {
  return (
    <Button variant="default" className="space-x-1" onClick={onClick}>
      <span>Create</span> <IconPlus size={18} />
    </Button>
  );
}
