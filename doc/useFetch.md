# useFetch Hook Documentation

## Overview

The `useFetch` hook is a powerful utility for handling data fetching operations in React applications with support for pagination, sorting, filtering, and searching capabilities. It's designed to simplify API integration while providing a flexible interface for common data fetching patterns.

## Installation

No additional installation required - the hook is already available in your project at:

```tsx
import { useFetch } from '@/hooks/use-fetch';
```

## API Reference

### Parameters

The hook accepts a configuration object with the following properties:

| Property               | Type                | Required | Description                                             |
| ---------------------- | ------------------- | -------- | ------------------------------------------------------- |
| `fetchData`            | `Function`          | Yes      | The function that performs the actual API call          |
| `options`              | `TableFetchOptions` | No       | Initial options for pagination, sorting, filtering      |
| `initialPageIndex`     | `number`            | No       | Starting page index (defaults to 0)                     |
| `initialPageSize`      | `number`            | No       | Number of items per page (defaults to 10)               |
| `initialSortField`     | `string`            | No       | Field to sort by initially                              |
| `initialSortDirection` | `boolean`           | No       | Initial sort direction (true for descending)            |
| `debounceTime`         | `number`            | No       | Search debounce delay in milliseconds (defaults to 500) |
| `onSuccess`            | `Function`          | No       | Callback when data fetch succeeds                       |
| `onError`              | `Function`          | No       | Callback when data fetch fails                          |

### Return Values

The hook returns an object with the following properties:

| Property          | Type             | Description                       |
| ----------------- | ---------------- | --------------------------------- |
| `data`            | `T \| undefined` | The fetched data                  |
| `isLoading`       | `boolean`        | Whether a fetch is in progress    |
| `error`           | `any`            | Error details if the fetch failed |
| `options`         | `HookOptions`    | Current option values             |
| `totalRows`       | `number`         | Total number of available rows    |
| `fetchData`       | `Function`       | Manual fetch function             |
| `refresh`         | `Function`       | Refresh data with current options |
| `setPage`         | `Function`       | Set current page                  |
| `setLimit`        | `Function`       | Set items per page                |
| `setSortBy`       | `Function`       | Set sorting criteria              |
| `setSearch`       | `Function`       | Set search term (debounced)       |
| `setColumnFilter` | `Function`       | Set column filtering              |
| `setCustomOption` | `Function`       | Set any custom option             |
| `resetPagination` | `Function`       | Reset to first page               |

## Basic Usage Example

```tsx
import { useFetch } from '@/hooks/use-fetch';

function ProductList() {
  const {
    data,
    isLoading,
    error,
    totalRows,
    setPage,
    setLimit,
    setSearch,
    setSortBy,
  } = useFetch({
    fetchData: async (options) => {
      const response = await fetch(
        `/api/products?page=${options.page}&limit=${options.limit}&search=${options.search}`
      );
      const json = await response.json();

      return {
        data: json.products,
        totalRows: json.total,
      };
    },
    initialPageSize: 20,
    initialSortField: 'name',
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <input
        type="text"
        placeholder="Search products..."
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Product listing */}
      <table>
        <thead>
          <tr>
            <th onClick={() => setSortBy([{ id: 'name', desc: false }])}>
              Name
            </th>
            <th onClick={() => setSortBy([{ id: 'price', desc: false }])}>
              Price
            </th>
          </tr>
        </thead>
        <tbody>
          {data?.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>${product.price}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div>
        <button onClick={() => setPage(0)}>First</button>
        <span>
          Page {options.pagination.pageIndex + 1} of{' '}
          {Math.ceil(totalRows / options.pagination.pageSize)}
        </span>
        <select
          value={options.pagination.pageSize}
          onChange={(e) => setLimit(Number(e.target.value))}
        >
          <option value="10">10 per page</option>
          <option value="20">20 per page</option>
          <option value="50">50 per page</option>
        </select>
      </div>
    </div>
  );
}
```

## Advanced Features

### Custom Filtering

You can add custom filter options beyond the standard ones provided:

```tsx
// Add a status filter
setCustomOption('status', 'active');

// Filter by category
setCustomOption('category', 'electronics');

// Remove a filter
setCustomOption('category', undefined);
```

### Column Filtering

Control which columns are returned from the API:

```tsx
// Only show specific fields
setColumnFilter(['id', 'name', 'price', 'thumbnail']);
```

### Multiple Sort Fields

The `setSortBy` function accepts an array of sort criteria:

```tsx
// Sort by category first, then by name
setSortBy([
  { id: 'category', desc: false },
  { id: 'name', desc: false },
]);
```

### Manual Refresh

Force a refresh with current options or perform a fetch with custom parameters:

```tsx
// Refresh with current options
refresh();

// Or manually fetch with specific options
fetchData({
  page: 0,
  limit: 100,
  search: 'special query',
});
```

## Implementation Notes

- Search functionality uses debouncing to prevent excessive API calls during typing
- Setting search or column filters automatically resets pagination to the first page
- All state updates will trigger a data refresh through the effect dependency
- Custom options can be used for any additional parameters your API supports
- The hook is optimized with `useCallback` and `useMemo` to minimize re-renders
