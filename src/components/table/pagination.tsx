import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { PaginationState } from "@/hooks/use-pagination";

interface DataTablePaginationProps<TData> {
  table: TData[];
  pagination: PaginationState;
  onPageChange: (page: number) => void;
}

export function DataTablePagination<TData>({
  table,
  pagination,
  onPageChange,
}: DataTablePaginationProps<TData>) {
  const { currentPage, totalPages, hasNextPage, hasPrevPage, totalItems } =
    pagination;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1); // Always show first page

    if (currentPage > 4) {
      pages.push("...");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 3) {
      pages.push("...");
    }

    pages.push(totalPages); // Always show last page

    return pages;
  };

  return (
    <div className="flex items-center justify-between px-2 mt-4">
      <div className="flex-1 text-sm text-muted-foreground">
        {table?.length} of {totalItems} row(s) shown.
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevPage}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>

          {getPageNumbers().map((pageNumber, idx) =>
            typeof pageNumber === "number" ? (
              <Button
                key={idx}
                variant={pageNumber === currentPage ? "default" : "outline"}
                className={`h-8 w-8 p-0 ${
                  pageNumber === currentPage
                    ? "bg-primaryColor text-white hover:bg-primaryColor/90"
                    : ""
                }`}
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </Button>
            ) : (
              <span key={idx} className="px-2 text-sm text-muted-foreground">
                {pageNumber}
              </span>
            )
          )}

          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNextPage}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
