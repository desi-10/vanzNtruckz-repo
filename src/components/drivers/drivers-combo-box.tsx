import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Check } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { DriverType } from "@/types/driver";

type Props = {
  drivers: DriverType[] | null;
  value: DriverType | null | undefined;
  onChange: (val: DriverType | null) => void;
};

export const DriverCombobox = ({ drivers, value, onChange }: Props) => {
  const [open, setOpen] = useState(false);

  const selectedDriver =
    value?.userId && drivers?.find((driver) => driver.userId === value.userId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          {selectedDriver ? (
            <div className="flex items-center gap-2 truncate">
              {selectedDriver.profilePicture && (
                <Image
                  src={selectedDriver.profilePicture.url}
                  alt={selectedDriver.user.name}
                  width={24}
                  height={24}
                  className="rounded-full object-cover"
                />
              )}
              <span className="truncate">
                {selectedDriver?.user.name} - {selectedDriver?.numberPlate}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">Select a driver</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0">
        <Command className="w-full">
          <CommandInput placeholder="Search drivers..." />
          <CommandEmpty>No drivers found.</CommandEmpty>
          <CommandGroup>
            <CommandItem
              onSelect={() => {
                onChange(null);
                setOpen(false);
              }}
              className="cursor-pointer"
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  value === null ? "opacity-100" : "opacity-0"
                )}
              />
              Unassigned
            </CommandItem>

            {drivers?.map((driver) => (
              <CommandItem
                key={driver.userId}
                onSelect={() => {
                  onChange(driver);
                  setOpen(false);
                }}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value?.userId === driver.userId
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                <div className="flex items-center gap-2 truncate">
                  {driver?.profilePicture && (
                    <Image
                      src={driver?.profilePicture.url}
                      alt={driver.user.name}
                      width={24}
                      height={24}
                      className="rounded-full object-cover"
                    />
                  )}
                  <span className="truncate">
                    {driver?.user.name} - {driver?.numberPlate}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
