'use client';

import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TargetPriceFieldProps {
  value?: number;
  onChange: (value?: number) => void;
}

export const TargetPriceField = ({
  value,
  onChange,
}: TargetPriceFieldProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseFloat(e.target.value);
    onChange(isNaN(parsed) ? undefined : parsed);
  };

  return (
    <Field>
      <Label htmlFor="target-price">Target Price</Label>
      <Input
        id="target-price"
        placeholder="Enter target price"
        value={value}
        onChange={handleChange}
      />
    </Field>
  );
};