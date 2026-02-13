"use client";

import * as React from "react";
import { Search, MapPin, DollarSign, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MapsPanelProps {
  elements: any[];
  onSelectElement: (id: string) => void;
  selectedElementId: string | null;
}

export function MapsPanel({ elements, onSelectElement, selectedElementId }: MapsPanelProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredElements = React.useMemo(() => {
    if (!searchQuery) return elements;
    return elements.filter((el) =>
      el.customData?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [elements, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b space-y-4">
        <div>
          <h2 className="font-semibold text-lg">Emplacements</h2>
          <p className="text-sm text-muted-foreground">
            {elements.length} emplacement{elements.length !== 1 ? "s" : ""} disponible{elements.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {filteredElements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Aucun emplacement trouvé
            </div>
          ) : (
            filteredElements.map((el) => {
              const isSelected = selectedElementId === el.id;
              const price = el.customData?.price;
              const unit = el.customData?.priceUnit === 'hour' ? '/h' :
                el.customData?.priceUnit === 'day' ? '/j' : '';

              return (
                <div
                  key={el.id}
                  onClick={() => onSelectElement(el.id)}
                  className={cn(
                    "group flex flex-col gap-2 rounded-lg border p-3 cursor-pointer transition-all hover:shadow-md",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-md"
                      : "bg-card hover:bg-accent/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={cn("p-2 rounded-md shrink-0", isSelected ? "bg-primary text-primary-foreground" : "bg-muted")}>
                        <MapPin className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-sm truncate leading-none mb-1">
                          {el.customData?.name || "Sans nom"}
                        </h3>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          ID: {el.id.slice(0, 6)}
                        </p>
                      </div>
                    </div>
                    {price && (
                      <Badge variant="outline" className="bg-background">
                        <DollarSign className="size-3 mr-0.5" />
                        {price} Ar{unit}
                      </Badge>
                    )}
                  </div>

                  {el.customData?.workingDays && el.customData.workingDays.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <Clock className="size-3" />
                      <span>{el.customData.workingDays.length} jours / semaine</span>
                    </div>
                  )}

                  {el.customData?.children && el.customData.children.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {el.customData.children.map((childId: string) => (
                        <span key={childId} className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground">
                          🔗 Lié
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
