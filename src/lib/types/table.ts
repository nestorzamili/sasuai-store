export interface options {
  limit: number;
  page: number;
  search?: string;
  sortBy?: {
    id: string;
    desc: boolean;
  };
  sortOrder?: string;
  columnFilter?: string[];
  setLimit?: (limit: number) => void;
  setPage?: (page: number) => void;
  setSearch?: (search: string) => void;
  setSortBy?: (sortBy: string) => void;
  setSortOrder?: (sortOrder: string) => void;
}
export interface OptionReturn {}
export interface tableData<T> {
  data: T[];
  total: number;
}
