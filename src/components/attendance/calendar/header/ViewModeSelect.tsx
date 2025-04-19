
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ViewModeSelectProps {
  viewMode: 'daily' | 'weekly' | 'monthly';
  onViewModeChange: (mode: 'daily' | 'weekly' | 'monthly') => void;
}

export const ViewModeSelect = ({ viewMode, onViewModeChange }: ViewModeSelectProps) => {
  return (
    <Select value={viewMode} onValueChange={onViewModeChange}>
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder="View Mode" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="daily">Daily</SelectItem>
        <SelectItem value="weekly">Weekly</SelectItem>
        <SelectItem value="monthly">Monthly</SelectItem>
      </SelectContent>
    </Select>
  );
};
