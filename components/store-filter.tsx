"use client"

import { useState, useMemo } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface StoreFilterProps {
  stores: string[]
  selectedStore: string
  onStoreChange: (store: string) => void
}

export function StoreFilter({ stores, selectedStore, onStoreChange }: StoreFilterProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")

  const filteredStores = useMemo(() => {
    if (!searchValue) return stores
    return stores.filter((store) => store.toLowerCase().includes(searchValue.toLowerCase()))
  }, [stores, searchValue])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-48 justify-between bg-slate-800 border-slate-700 hover:bg-slate-700 text-white"
        >
          {selectedStore === "all" ? "所有門店" : selectedStore}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0 bg-slate-900 border-slate-700">
        <Command className="bg-slate-900">
          <CommandInput
            placeholder="搜尋門店..."
            className="text-white"
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty className="text-slate-400">找不到門店</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-y-auto">
              <CommandItem
                value="all"
                onSelect={() => {
                  onStoreChange("all")
                  setOpen(false)
                }}
                className="text-white hover:bg-slate-800"
              >
                <Check className={cn("mr-2 h-4 w-4", selectedStore === "all" ? "opacity-100" : "opacity-0")} />
                所有門店
              </CommandItem>
              {filteredStores.map((store) => (
                <CommandItem
                  key={store}
                  value={store}
                  onSelect={() => {
                    onStoreChange(store)
                    setOpen(false)
                  }}
                  className="text-white hover:bg-slate-800"
                >
                  <Check className={cn("mr-2 h-4 w-4", selectedStore === store ? "opacity-100" : "opacity-0")} />
                  {store}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
