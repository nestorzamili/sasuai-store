import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { Container } from '@/components/layout/container';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileLoading() {
  return (
    <>
      <Header fixed>
        <Skeleton className="h-9 w-[250px]" />
        <div className="ml-auto flex items-center space-x-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </Header>

      <Main>
        <Container>
          <div className="mx-auto max-w-2xl space-y-8 py-8">
            {/* Page Header */}
            <div className="mb-8">
              <Skeleton className="h-8 w-52 mb-2" />
              <Skeleton className="h-4 w-72" />
            </div>

            {/* Profile Form Card */}
            <Card>
              <CardHeader className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {/* Form Fields */}
                  {Array(3)
                    .fill(null)
                    .map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-3 w-36" />
                      </div>
                    ))}

                  {/* Button */}
                  <Skeleton className="h-10 w-32 mt-6" />
                </div>
              </CardContent>
            </Card>

            {/* Password Form Card */}
            <Card>
              <CardHeader className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-56" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {/* Password Fields */}
                  {Array(3)
                    .fill(null)
                    .map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                        {i === 1 && <Skeleton className="h-3 w-48" />}
                      </div>
                    ))}

                  {/* Button */}
                  <Skeleton className="h-10 w-40 mt-6" />
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </Main>
    </>
  );
}
