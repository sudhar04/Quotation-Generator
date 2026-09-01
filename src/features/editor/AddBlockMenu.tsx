import { Plus } from "lucide-react";
import { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { BLOCK_LABEL, type BlockType } from "@/models/quotation";

const GROUPS: { label: string; items: BlockType[] }[] = [
  { label: "Content", items: ["heading", "paragraph", "bulletList", "numberedList", "richText", "note"] },
  { label: "Document", items: ["logo", "title", "subtitle", "metadata", "divider", "spacer", "pageBreak", "footer"] },
  { label: "Tables", items: ["pricingTable", "timelineTable", "customTable"] },
  { label: "Signature", items: ["signature", "approval"] },
];

interface Props {
  onAdd: (type: BlockType) => void;
  variant?: "default" | "ghost" | "outline";
  label?: string;
  className?: string;
}

export function AddBlockMenu({ onAdd, variant = "outline", label = "Add Block", className }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={variant} size="sm" className={className}>
          <Plus className="size-4" /> {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="center" className="w-72 p-0" sideOffset={8}>
        <Command>
          <CommandInput placeholder="Search blocks…" />
          <CommandList className="max-h-80">
            <CommandEmpty>No block found.</CommandEmpty>
            {GROUPS.map((group) => (
              <CommandGroup key={group.label} heading={group.label}>
                {group.items.map((type) => (
                  <CommandItem
                    key={type}
                    value={`${group.label} ${BLOCK_LABEL[type]}`}
                    onSelect={() => {
                      onAdd(type);
                      setOpen(false);
                    }}
                  >
                    {BLOCK_LABEL[type]}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
