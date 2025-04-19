
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FilterSelectProps {
  label: string;
  value: string | null;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: Array<{ id: string; name: string; }>;
  allOptionLabel: string;
}

export const FilterSelect = ({
  label,
  value,
  onValueChange,
  placeholder,
  options,
  allOptionLabel,
}: FilterSelectProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Select value={value || `all-${label.toLowerCase()}`} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={`all-${label.toLowerCase()}`}>{allOptionLabel}</SelectItem>
          {options.map(option => (
            <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
