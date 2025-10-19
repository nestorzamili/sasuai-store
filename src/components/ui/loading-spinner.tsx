interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({
  message = 'Loading...',
}: LoadingSpinnerProps) {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative"></div>
        <div className="flex space-x-1">
          <div
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          ></div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
          {message}
        </p>
      </div>
    </div>
  );
}
