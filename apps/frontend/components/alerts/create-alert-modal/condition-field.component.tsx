'use client';

import { Field } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { AlertCondition } from '@/types/alert.type';
import { Triangle } from 'lucide-react';

interface ConditionFieldProps {
  condition: AlertCondition;
  onChange: (condition: AlertCondition) => void;
}

export const ConditionField = ({
  condition,
  onChange,
}: ConditionFieldProps) => {
  const handleChange = (value: string[]) => {
    const selected = value[0];
    if (selected === 'ABOVE' || selected === 'BELOW') {
      onChange(selected);
    }
  };

  return (
    <Field>
      <Label htmlFor="condition">Condition</Label>
      <ToggleGroup id="condition" value={[condition]} onValueChange={handleChange}>
        <ToggleGroupItem
          value="ABOVE"
          className="text-green-600 bg-green-100 border-green-200 border hover:bg-green-200 hover:text-green-700 hover:scale-105 data-pressed:bg-green-200 data-pressed:border-green-400 data-pressed:scale-105"
        >
          <Triangle
            strokeWidth={0.5}
            className="size-2.5 shrink-0"
            fill="currentColor"
          />
          ABOVE
        </ToggleGroupItem>
        <ToggleGroupItem
          value="BELOW"
          className="text-red-600 bg-red-100 border-red-200 border hover:bg-red-200 hover:text-red-700 hover:scale-105 data-pressed:bg-red-200 data-pressed:border-red-400 data-pressed:scale-105"
        >
          <Triangle
            strokeWidth={0.5}
            className="size-2.5 shrink-0 rotate-180"
            fill="currentColor"
          />
          BELOW
        </ToggleGroupItem>
      </ToggleGroup>
    </Field>
  );
};