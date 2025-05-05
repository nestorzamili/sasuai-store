import { CircleArrowDown, CircleArrowUp } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function ValuesMetric({ value }: { value: number }) {
  const isNegative = value < 0;
  return (
    <div
      className={`text-${
        isNegative ? 'red' : 'green'
      }-500 flex items-center gap-2`}
    >
      {isNegative ? <TrendingDown /> : <TrendingUp />}
      {Math.abs(value).toFixed(2)}%
    </div>
  );
}
