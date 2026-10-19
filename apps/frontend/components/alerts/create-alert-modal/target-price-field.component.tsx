'use client';

import { useState } from 'react';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TargetPriceFieldProps {
  value?: number;
  onChange: (value?: number) => void;
}

const sanitize = (raw: string) => {
  const cleaned = raw.replace(/[^\d.]/g, '');
  const [integer, ...decimals] = cleaned.split('.');
  return decimals.length > 0 ? `${integer}.${decimals.join('')}` : integer;
};

export const TargetPriceField = ({
  value,
  onChange,
}: TargetPriceFieldProps) => {
  const [inputValue, setInputValue] = useState(
    value !== undefined ? String(value) : '',
  );

  const parsed = parseFloat(inputValue);
  const isInvalid = inputValue !== '' && (Number.isNaN(parsed) || parsed <= 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = sanitize(e.target.value);
    setInputValue(next);

    const parsedNext = parseFloat(next);
    onChange(
      next === '' || Number.isNaN(parsedNext) || parsedNext <= 0
        ? undefined
        : parsedNext,
    );
  };

  return (
    <Field data-invalid={isInvalid}>
      <Label htmlFor="target-price">Target Price</Label>
      <Input
        id="target-price"
        type="text"
        inputMode="decimal"
        autoComplete="off"
        placeholder="Enter target price"
        value={inputValue}
        onChange={handleChange}
        aria-invalid={isInvalid}
      />
      {isInvalid && <FieldError>Enter a price greater than 0</FieldError>}
    </Field>
  );
};
