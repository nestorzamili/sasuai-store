'use client';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { usePathname } from 'next/navigation';

export function BreadCrumb() {
  const pathname = usePathname();
  const segments = pathname
    .split('/')
    .filter(Boolean)
    .filter((segment) => {
      // Skip segments that are likely IDs (numeric or UUIDs)
      return !(
        /^\d+$/.test(segment) ||
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          segment
        )
      );
    })
    .map((segment) => ({
      title:
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      href: `/${segment}`,
      segment,
    }));

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>

        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;

          // Build proper href that includes the full path up to this segment
          const href =
            '/' +
            segments
              .slice(0, index + 1)
              .map((s) => s.segment)
              .join('/');

          return (
            <>
              <BreadcrumbSeparator key={`separator-${index}`} />
              <BreadcrumbItem key={segment.href}>
                {isLast ? (
                  <BreadcrumbPage>{segment.title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href}>{segment.title}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
