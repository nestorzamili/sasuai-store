'use client';
import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { usePathname } from 'next/navigation';

// Simple type for custom labels mapping (path segment to display name)
type CustomLabels = Record<string, string | null | undefined>;

export function BreadCrumb({
  customLabels = {},
}: {
  customLabels?: CustomLabels;
}) {
  const pathname = usePathname();

  // Split the pathname into segments
  const pathSegments = pathname.split('/').filter(Boolean);

  // Process segments to create breadcrumb items
  const segments = pathSegments
    .map((segment, index) => {
      // Check if this segment is an ID (numeric or UUID)
      const isId =
        /^\d+$/.test(segment) ||
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          segment,
        );

      const fullPath = '/' + pathSegments.slice(0, index + 1).join('/');

      const customLabel = customLabels[segment];

      if (isId && !customLabel) {
        return null;
      }

      const displayTitle =
        customLabel ||
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

      return {
        title: displayTitle,
        href: fullPath,
        segment,
        isId,
      };
    })
    .filter(Boolean);

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>

        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;

          return (
            <React.Fragment key={`breadcrumb-segment-${index}`}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{segment!.title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={segment!.href}>
                    {segment!.title}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
