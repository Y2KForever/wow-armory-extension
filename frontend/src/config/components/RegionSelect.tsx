import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Region } from '@/types/Region';

interface RegionSelectProps {
  onValueChange: (region: Region) => void;
  defaultValue: string | undefined;
  isDisabled: boolean;
}

export const RegionSelect = ({ onValueChange, defaultValue, isDisabled }: RegionSelectProps) => {
  return (
    <div className="flex mt-5">
      <Select disabled={isDisabled} value={defaultValue} onValueChange={onValueChange}>
        <SelectTrigger className="min-w-[150px]">
          <SelectValue placeholder="Select a region" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(Region).map(([code, name]) => (
            <SelectItem key={code} value={code}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
