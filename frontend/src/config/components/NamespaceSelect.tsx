import MultipleSelector, { Option } from '@/components/ui/multi-select';
import { Namespaces } from '@/types/Namspaces';
import { Capitalize } from '@/lib/utils';

const namespacesOption = Object.entries(Namespaces).map(([key, value]) => ({
  label: Capitalize(value),
  value: key,
  disable: value === 'retail' ? false : true,
}));

interface NamespaceSelectProps {
  onValueChange: (option: Option[]) => void;
  defaultValue?: string | undefined;
  isDisabled: boolean;
}

export const NamespaceSelect = ({ onValueChange }: NamespaceSelectProps) => {
  return (
    <div className="flex max-w-[285px]">
      <MultipleSelector
        onChange={onValueChange}
        hidePlaceholderWhenSelected
        className="bg-background"
        defaultOptions={namespacesOption}
        placeholder="Select verions of the game"
      />
    </div>
  );
};
