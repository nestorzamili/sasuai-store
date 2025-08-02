import { Card } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

interface TransactionPointsCardProps {
  pointsEarned: number;
}

export function TransactionPointsCard({
  pointsEarned,
}: TransactionPointsCardProps) {
  const t = useTranslations('transaction.detailDialog');

  if (pointsEarned <= 0) return null;

  return (
    <Card className="bg-primary/5 border-primary/20 p-4">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <path d="M12 2v4" />
            <path d="m16.2 7.8 2.9-2.9" />
            <path d="M18 12h4" />
            <path d="m16.2 16.2 2.9 2.9" />
            <path d="M12 18v4" />
            <path d="m4.9 19.1 2.9-2.9" />
            <path d="M2 12h4" />
            <path d="m4.9 4.9 2.9 2.9" />
          </svg>
        </div>
        <div>
          <p className="font-medium">{t('pointsEarned')}</p>
          <p className="text-sm text-muted-foreground">
            {t('pointsEarnedMessage', { points: pointsEarned })}
          </p>
        </div>
      </div>
    </Card>
  );
}
