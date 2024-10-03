"use client"
 
import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
 
import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
 
// k = value, v = label
export type ComboboxLabels = Map<string, string>;

export function Combobox({ placeholder, notfound, labels, onChange }: {
    placeholder: string,
    notfound: string,
    labels: ComboboxLabels,
    onChange: (value: string | null) => void,
}) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState<null | string>(null);

  React.useEffect(() => {
    onChange(value);
  }, [value, onChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? labels.get(value)
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>{notfound}</CommandEmpty>
            <CommandGroup>
              {Array.from(labels.entries()).map((v) => (
                <CommandItem
                  key={v[0]}
                  value={v[0]}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? null : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === v[0] ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {v[1]}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
