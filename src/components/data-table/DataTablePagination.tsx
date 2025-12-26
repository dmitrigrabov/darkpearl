import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface DataTablePaginationProps {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  onPaginationChange: (pageIndex: number, pageSize: number) => void;
}

export function DataTablePagination({
  pageIndex,
  pageSize,
  totalCount,
  onPaginationChange,
}: DataTablePaginationProps) {
  const pageCount = Math.ceil(totalCount / pageSize);
  const canPreviousPage = pageIndex > 0;
  const canNextPage = pageIndex < pageCount - 1;

  return (
    <div className="flex items-center justify-between px-2">
      <div className="text-sm text-muted-foreground">
        Showing {pageIndex * pageSize + 1} to {Math.min((pageIndex + 1) * pageSize, totalCount)} of{' '}
        {totalCount} results
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPaginationChange(0, pageSize)}
          disabled={!canPreviousPage}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPaginationChange(pageIndex - 1, pageSize)}
          disabled={!canPreviousPage}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm">
          Page {pageIndex + 1} of {pageCount}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPaginationChange(pageIndex + 1, pageSize)}
          disabled={!canNextPage}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPaginationChange(pageCount - 1, pageSize)}
          disabled={!canNextPage}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
