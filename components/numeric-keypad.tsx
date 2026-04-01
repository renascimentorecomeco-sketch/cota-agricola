"use client"

import { Button } from "@/components/ui/button"
import { Delete } from "lucide-react"

interface NumericKeypadProps {
  onKeyPress: (key: string) => void
  onDelete: () => void
  onClear: () => void
}

export function NumericKeypad({ onKeyPress, onDelete, onClear }: NumericKeypadProps) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "0", "del"]

  return (
    <div className="grid grid-cols-3 gap-3">
      {keys.map((key) => {
        if (key === "del") {
          return (
            <Button
              key={key}
              variant="secondary"
              size="lg"
              className="h-16 text-xl font-semibold"
              onClick={onDelete}
            >
              <Delete className="h-6 w-6" />
            </Button>
          )
        }

        return (
          <Button
            key={key}
            variant="secondary"
            size="lg"
            className="h-16 text-2xl font-semibold"
            onClick={() => onKeyPress(key)}
          >
            {key}
          </Button>
        )
      })}
      <Button
        variant="outline"
        size="lg"
        className="col-span-3 h-12 text-base font-medium text-muted-foreground"
        onClick={onClear}
      >
        Limpar
      </Button>
    </div>
  )
}
