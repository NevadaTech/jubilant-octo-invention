import { Input, Label } from "@/ui/components";

export function LabeledFilter({
  id,
  label,
  value,
}: {
  id: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} readOnly defaultValue={value} />
    </div>
  );
}
