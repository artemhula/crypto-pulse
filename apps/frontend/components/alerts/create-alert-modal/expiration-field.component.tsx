'use client';

import { format } from 'date-fns';
import { ChevronDownIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldContent, FieldLabel } from '@/components/ui/field';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ExpirationFieldProps {
  enabled: boolean;
  onEnabledChange: (value: boolean) => void;
  date?: Date;
  onDateChange: (date?: Date) => void;
}

export const ExpirationField = ({
  enabled,
  onEnabledChange,
  date,
  onDateChange,
}: ExpirationFieldProps) => {
  return (
    <div className="grid max-w-sm grid-cols-1 gap-2 md:grid-cols-2 md:gap-0 items-center">
      <Field orientation="horizontal">
        <Checkbox
          id="enable-expires-checkbox"
          name="enable-expires-checkbox"
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
        <FieldContent>
          <FieldLabel htmlFor="enable-expires-checkbox">
            Enable expiration
          </FieldLabel>
        </FieldContent>
      </Field>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              data-empty={!date}
              className="w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
              disabled={!enabled}
            >
              {date ? format(date, 'PPP') : <span>Pick a date</span>}
              <ChevronDownIcon data-icon="inline-end" />
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onDateChange}
            defaultMonth={date}
            disabled={{ before: new Date() }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
