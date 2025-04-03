interface MainContentProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  buttonOptions?: React.ReactNode;
}

export default function MainContent({
  children,
  title,
  buttonOptions,
  description,
}: MainContentProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {title || 'Sasuai Store'}
          </h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {buttonOptions}
      </div>
      {children}
    </div>
  );
}
