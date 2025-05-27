import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { ChevronLeft, ChevronRight, Search, Settings, Filter, ArrowDown, ArrowUp, X } from 'lucide-react';

export interface Column<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  accessorFn?: (row: T) => any;
  cell?: (value: any) => React.ReactNode;
  enableSorting?: boolean;
  enableHiding?: boolean;
  enableFiltering?: boolean;
  isVisible?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: readonly Column<T>[] | any;
  searchable?: boolean;
  title?: string;
}

export function DataTable<T>({ 
  data, 
  columns, 
  searchable = true,
  title 
}: DataTableProps<T>) {
  

  const getCellValue = (row: T, column: Column<T>) => {
    if (column.accessorFn) return column.accessorFn(row);
    if (column.accessorKey) return row[column.accessorKey];
    return undefined;
  };

  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns
      .filter(column => column.isVisible !== false) // Only add columns that don't have isVisible set to false
      .map(column => column.id))
  );
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, Set<string>>>({});
  const rowsPerPage = 10;

  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      // Cycle through: asc -> desc -> null (unsorted)
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  const toggleColumnVisibility = (columnId: string) => {
    const newVisibleColumns = new Set(visibleColumns);
    if (newVisibleColumns.has(columnId)) {
      newVisibleColumns.delete(columnId);
    } else {
      newVisibleColumns.add(columnId);
    }
    setVisibleColumns(newVisibleColumns);
  };

  const setFilter = (columnId: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [columnId]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilter = (columnId: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[columnId];
      return newFilters;
    });
    
    setSelectedFilters(prev => {
      const newSelectedFilters = { ...prev };
      delete newSelectedFilters[columnId];
      return newSelectedFilters;
    });
  };

  const clearAllFilters = () => {
    setFilters({});
    setSearchTerm('');
    setSelectedFilters({});
    setCurrentPage(1);
  };

  // Clear sorting
  const clearSorting = () => {
    setSortColumn(null);
    setSortDirection(null);
  };

  // Gets unique values for a column to use in filter options
  const getUniqueValues = (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (!column) return [];
  
    const values = new Set<string>();
  
    data.forEach(item => {
      const value = getCellValue(item, column);
      if (value === undefined || value === null) return;
  
      if (Array.isArray(value)) {
        value.forEach(v => values.add(String(v)));
      } else if (typeof value !== 'object') {
        values.add(String(value));
      }
    });
  
    return Array.from(values).sort();
  };

  // Toggle a checkbox filter
  const toggleFilterValue = (columnId: string, value: string) => {
    setSelectedFilters(prev => {
      const currentSet = prev[columnId] || new Set<string>();
      const newSet = new Set(currentSet);
      
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      
      // If empty, remove this filter altogether
      if (newSet.size === 0) {
        const newFilters = { ...prev };
        delete newFilters[columnId];
        return newFilters;
      }
      
      return {
        ...prev,
        [columnId]: newSet
      };
    });
    setCurrentPage(1);
  };

  const filterData = (data: T[]) => {
    let filteredData = data;
    
    // Apply search term filter
    if (searchTerm) {
      filteredData = filteredData.filter(row => {
        return columns.some(column => {
          const value = getCellValue(row, column);
          if (value === undefined || value === null) return false;
          
          const stringValue = String(value);
          return stringValue.toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }
    
    // Apply column-specific filter input
    Object.entries(filters).forEach(([columnId, filterValue]) => {
      if (filterValue) {
        const column = columns.find(col => col.id === columnId);
        if (column) {
          filteredData = filteredData.filter(row => {
            const value = getCellValue(row, column);
            if (value === undefined || value === null) return false;
            
            if (Array.isArray(value)) {
              return value.some(v => 
                String(v).toLowerCase().includes(filterValue.toLowerCase())
              );
            }
            
            const stringValue = String(value);
            return stringValue.toLowerCase().includes(filterValue.toLowerCase());
          });
        }
      }
    });
    
    // Apply checkbox filters
    Object.entries(selectedFilters).forEach(([columnId, selectedValues]) => {
      if (selectedValues.size > 0) {
        const column = columns.find(col => col.id === columnId);
        if (column) {
          filteredData = filteredData.filter(row => {
            const value = getCellValue(row, column);
            if (value === undefined || value === null) return false;
            
            if (Array.isArray(value)) {
              return value.some(v => selectedValues.has(String(v)));
            }
            
            const stringValue = String(value);
            return selectedValues.has(stringValue);
          });
        }
      }
    });
    
    return filteredData;
  };

  const sortData = (data: T[]) => {
    if (!sortColumn || sortDirection === null) return data;
    
    const column = columns.find(col => col.id === sortColumn);
    if (!column) return data;
    
    return [...data].sort((a, b) => {
      const valueA = getCellValue(a, column);
      const valueB = getCellValue(b, column);
      
      if (valueA === valueB) return 0;
      
      // Handle null/undefined values
      if (valueA === null || valueA === undefined) return sortDirection === 'asc' ? -1 : 1;
      if (valueB === null || valueB === undefined) return sortDirection === 'asc' ? 1 : -1;
      
      // Perform comparison based on type
      let compareResult;
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        compareResult = valueA.localeCompare(valueB);
      } else if (typeof valueA === 'number' && typeof valueB === 'number') {
        compareResult = valueA - valueB;
      } else if (valueA instanceof Date && valueB instanceof Date) {
        compareResult = valueA.getTime() - valueB.getTime();
      } else {
        compareResult = String(valueA).localeCompare(String(valueB));
      }
      
      return sortDirection === 'asc' ? compareResult : -compareResult;
    });
  };

  // Apply filters and sorting
  const filteredData = filterData(data);
  const sortedData = sortData(filteredData);
  
  // Apply pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / rowsPerPage));
  // Make sure currentPage is valid
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);
  
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + rowsPerPage);
  
  const visibleColumnsArray = columns.filter(col => visibleColumns.has(col.id));
  const hasActiveFilters = Object.keys(filters).length > 0 || searchTerm.trim() !== '' || Object.keys(selectedFilters).length > 0;
  const hasActiveSorting = sortColumn !== null && sortDirection !== null;

  // Should non-filterable columns be excluded
  const shouldExcludeFromFiltering = (columnId: string) => {
    return ["ip", "hash", "domain"].includes(columnId);
  };

  return (
    <div className="table-container">
      <div className="table-toolbar flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          {title && <h3 className="text-lg font-medium">{title}</h3>}
          
          {(hasActiveFilters || hasActiveSorting) && (
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearAllFilters} 
                  className="h-8 gap-1 text-xs"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear filters
                </Button>
              )}
              
              {hasActiveSorting && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearSorting} 
                  className="h-8 gap-1 text-xs"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear sorting
                </Button>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {searchable && (
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search all columns..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
                className="pl-8 h-9 w-[200px] md:w-[250px]"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-7 w-7"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuItem onClick={() => {
                setVisibleColumns(new Set(columns.map(col => col.id)));
              }}>
                Show all columns
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {columns
                .filter(column => column.enableHiding !== false)
                .map(column => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={visibleColumns.has(column.id)}
                    onCheckedChange={() => toggleColumnVisibility(column.id)}
                  >
                    {column.header}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader className="table-header">
            <TableRow>
              {visibleColumnsArray.map(column => (
                <TableHead 
                  key={column.id}
                >
                  <div className="flex items-center gap-1">
                    <div 
                      className={column.enableSorting !== false ? "cursor-pointer select-none flex items-center gap-1" : "flex items-center gap-1"}
                      onClick={() => column.enableSorting !== false ? handleSort(column.id) : null}
                    >
                      {column.header}
                      {sortColumn === column.id && sortDirection !== null && (
                        sortDirection === 'asc' 
                          ? <ArrowUp className="h-3.5 w-3.5" /> 
                          : <ArrowDown className="h-3.5 w-3.5" />
                      )}
                    </div>

                    {column.enableFiltering !== false && !shouldExcludeFromFiltering(column.id) && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`h-6 w-6 hover:bg-muted hover:text-foreground ${
                              filters[column.id] || (selectedFilters[column.id] && selectedFilters[column.id].size > 0) ? 'text-primary filter-active' : ''
                            }`}
                          >
                            <Filter className="h-3.5 w-3.5" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-[220px] p-0" 
                          align="start"
                        >
                          <div className="p-2 space-y-2">
                            <Input
                              placeholder={`Filter ${column.header.toLowerCase()}...`}
                              value={filters[column.id] || ''}
                              onChange={(e) => setFilter(column.id, e.target.value)}
                              className="h-8 text-sm"
                            />
                            
                            <div className="max-h-[200px] overflow-auto">
                              {getUniqueValues(column.id).map((value) => (
                                <div
                                  key={value}
                                  className="px-2 py-1 text-sm flex items-center hover:bg-muted/10 rounded-sm"
                                >
                                  <Checkbox 
                                    id={`filter-${column.id}-${value}`}
                                    checked={selectedFilters[column.id]?.has(value) || false}
                                    onCheckedChange={() => toggleFilterValue(column.id, value)}
                                    className="mr-2 h-4 w-4 border-muted!"
                                  />
                                  <label 
                                    htmlFor={`filter-${column.id}-${value}`}
                                    className="flex-grow cursor-pointer"
                                  >
                                    {value}
                                  </label>
                                </div>
                              ))}
                            </div>
                            
                            {(filters[column.id] || (selectedFilters[column.id] && selectedFilters[column.id].size > 0)) && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 text-xs w-full justify-center"
                                onClick={() => clearFilter(column.id)}
                              >
                                Clear filter
                              </Button>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumnsArray.length} className="text-center py-6">
                  No results found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {visibleColumnsArray.map(column => (
                    <TableCell key={column.id}>
                      {column.cell 
                        ? column.cell(getCellValue(row, column)) 
                        : String(getCellValue(row, column) || '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination controls - always visible but disabled for small tables */}
      <div className="pagination-container p-4">
        <div className="pagination-controls flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1 || sortedData.length <= rowsPerPage}
            className={`pagination-button ${sortedData.length <= rowsPerPage ? 'opacity-50' : ''}`}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </Button>
          
          <span className={`pagination-info ${sortedData.length <= rowsPerPage ? 'text-muted-foreground/50' : ''}`}>
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || sortedData.length <= rowsPerPage}
            className={`pagination-button ${sortedData.length <= rowsPerPage ? 'opacity-50' : ''}`}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next</span>
          </Button>
        </div>
        
        <div className={`pagination-info ${sortedData.length <= rowsPerPage ? 'text-muted-foreground/50' : ''}`}>
          Showing {sortedData.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + rowsPerPage, sortedData.length)} of {sortedData.length} results
        </div>
      </div>
    </div>
  );
}