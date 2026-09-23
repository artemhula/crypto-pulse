import { useMemo, useState } from 'react';

export type Order = 'asc' | 'desc';

export type OrderOption<T> = {
  field: keyof T;
  order: Order;
  label?: string;
};

export type UseSearchSortProps<T> = {
  initialData: T[];
  initialOrderOption: OrderOption<T>;
  initialSearchTerm?: string;
};

export const useSearchSort = <T extends Record<string, unknown>>({
  initialData,
  initialOrderOption,
  initialSearchTerm,
}: UseSearchSortProps<T>) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [orderOption, setOrderOption] = useState(initialOrderOption);

  const data = useMemo(() => {
    const sorted = [...initialData].sort((a, b) => {
      const fieldA = a[orderOption.field];
      const fieldB = b[orderOption.field];
      if (fieldA < fieldB) return orderOption.order === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return orderOption.order === 'asc' ? 1 : -1;
      return 0;
    });

    if (!searchTerm) return sorted;

    const q = searchTerm.toLowerCase();
    return sorted.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(q),
      ),
    );
  }, [initialData, searchTerm, orderOption]);

  const handleSort = (field: keyof T, order: Order) =>
    setOrderOption({ field, order });

  const handleSearch = (term?: string) => setSearchTerm(term);

  return { searchTerm, orderOption, data, handleSearch, handleSort };
};
