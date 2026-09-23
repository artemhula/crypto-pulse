import { SearchIcon, ChevronDown, ChevronUp } from 'lucide-react';
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from '@/components/ui/input-group';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field, FieldLabel } from '@/components/ui/field';
import type { Order } from './use-search-sort.hook';

const orderOptions: { label: string; field: string; order: Order }[] = [
  { label: 'Market Cap', field: 'marketCap', order: 'desc' },
  { label: 'Market Cap', field: 'marketCap', order: 'asc' },
  { label: 'Price', field: 'currentPrice', order: 'desc' },
  { label: 'Price', field: 'currentPrice', order: 'asc' },
  { label: 'Price change (1h)', field: 'priceChangePercentage1h', order: 'desc' },
  { label: 'Price change (1h)', field: 'priceChangePercentage1h', order: 'asc' },
  { label: 'Price change (24h)', field: 'priceChangePercentage24h', order: 'desc' },
  { label: 'Price change (24h)', field: 'priceChangePercentage24h', order: 'asc' },
];

interface SearchSortBarProps<T extends Record<string, unknown>> {
  onSearch: (term?: string) => void;
  onSort: (field: keyof T, order: Order) => void;
}

export const SearchSortBar = <T extends Record<string, unknown>>({
  onSearch,
  onSort,
}: SearchSortBarProps<T>) => {
  return (
    <div className="flex flex-col gap-2 md:gap-4 md:flex-row md:justify-between mb-4 space-y-2 md:space-y-0">
      <Field orientation="horizontal">
        <InputGroup>
          <InputGroupInput
            id="inline-start-input"
            placeholder="Search..."
            onChange={(e) => onSearch(e.target.value)}
          />
          <InputGroupAddon align="inline-start">
            <SearchIcon className="text-muted-foreground" />
          </InputGroupAddon>
        </InputGroup>
      </Field>
      <Field orientation="horizontal" className="gap-1">
        <FieldLabel>Order by</FieldLabel>
        <Select
          defaultValue={orderOptions[0].field + orderOptions[0].order}
          items={orderOptions.map((o) => ({
            value: o.field + o.order,
            label: o.label,
          }))}
          onValueChange={(value) => {
            const selectedOption = orderOptions.find(
              (o) => o.field + o.order === value,
            );
            if (selectedOption) {
              onSort(selectedOption.field as keyof T, selectedOption.order);
            }
          }}
        >
          <SelectTrigger className="w-70">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="w-50">
            <SelectGroup>
              {orderOptions.map((option) => (
                <SelectItem
                  key={option.field + option.order}
                  value={option.field + option.order}
                >
                  {option.order === 'desc' ? <ChevronDown /> : <ChevronUp />}
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
};
