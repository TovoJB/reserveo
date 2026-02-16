"use client";

import * as React from "react";
import { Search, MapPin, DollarSign, Clock, ChevronRight, Users, Calendar, LayoutGrid, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface MapsPanelProps {
  elements: any[];
  onSelectElement: (id: string | null) => void; // Allow null to deselect
  selectedElementId: string | null;
}

const DAYS = [
  { id: 1, label: "Lundi" },
  { id: 2, label: "Mardi" },
  { id: 3, label: "Mercredi" },
  { id: 4, label: "Jeudi" },
  { id: 5, label: "Vendredi" },
  { id: 6, label: "Samedi" },
  { id: 0, label: "Dimanche" },
];

export function MapsPanel({ elements, onSelectElement, selectedElementId }: MapsPanelProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeDetail, setActiveDetail] = React.useState<string | null>(null);

  const filteredElements = React.useMemo(() => {
    if (!searchQuery) return elements;
    return elements.filter((el) =>
      (el.customData?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [elements, searchQuery]);

  const handleElementClick = (id: string) => {
    onSelectElement(id);
    // Removed setActiveDetail(id) from here so row click only selects
  };

  const handleDetailsClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent triggering the row selection again
    onSelectElement(id); // Ensure it's selected when viewing details
    setActiveDetail(id);
  };

  const getElementName = (id: string) => {
    return elements.find(el => el.id === id)?.customData?.name || id.slice(0, 8);
  };

  const selectedElement = elements.find(el => el.id === activeDetail);

  return (
    <div className="flex flex-col h-full bg-background border-r w-full">
      {/* Search Header */}
      <div className="p-4 border-b space-y-4 bg-white z-10">
        <div>
          <h2 className="font-semibold text-lg tracking-tight">Plan de Salle</h2>
          <p className="text-sm text-muted-foreground">
            {filteredElements.length} emplacements trouvés
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une table, une salle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-gray-50 border-gray-200 focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-blue-500"
          />
        </div>
      </div>

      {/* List Area */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {filteredElements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <MapPin className="size-8 mb-2 opacity-20" />
              <p className="text-sm">Aucun résultat trouvé</p>
            </div>
          ) : (
            filteredElements.map((el) => {
              const isSelected = selectedElementId === el.id;
              const data = el.customData || {};
              const price = data.price;
              const unit = data.priceUnit === 'minute' ? '/min' :
                data.priceUnit === 'hour' ? '/h' :
                  data.priceUnit === 'day' ? '/j' : '';

              return (
                <div
                  key={el.id}
                  onClick={() => handleElementClick(el.id)}
                  className={cn(
                    "group relative flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden",
                    isSelected
                      ? "bg-blue-50/50 border-blue-200 shadow-sm"
                      : "bg-white border-transparent hover:border-gray-200 hover:bg-gray-50"
                  )}
                >
                  {/* Left Indicator */}
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                  )}

                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      "flex items-center justify-center size-10 rounded-lg shrink-0 transition-colors",
                      isSelected ? "bg-white text-blue-600 shadow-sm" : "bg-gray-100 text-gray-400 group-hover:bg-white group-hover:text-gray-600 group-hover:shadow-sm"
                    )}>
                      <LayoutGrid className="size-5" />
                    </div>
                    <div className="overflow-hidden">
                      <h3 className={cn("font-medium text-sm truncate", isSelected ? "text-blue-900" : "text-gray-900")}>
                        {data.name || "Sans nom"}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                        {data.price ? (
                          <span className="font-medium text-green-600">
                            {data.price} Ar{unit}
                          </span>
                        ) : (
                          <span className="italic opacity-70">Prix non défini</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                    onClick={(e) => handleDetailsClick(e, el.id)}
                  >
                    <Eye className="size-4" />
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Detail Sheet (Controlled by activeDetail) */}
      <Sheet open={!!activeDetail} onOpenChange={(open) => !open && setActiveDetail(null)}>
        <SheetContent side="left" className="w-[400px] sm:w-[540px] p-0 overflow-hidden flex flex-col gap-0 border-r z-50">
          {selectedElement && (
            <>
              {/* Header Image / Color Area */}
              <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 relative shrink-0">
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-4 right-4 rounded-full bg-white/20 hover:bg-white/40 text-white border-none shadow-none backdrop-blur-sm"
                  onClick={() => setActiveDetail(null)}
                >
                  <ChevronRight className="rotate-180 size-4" />
                </Button>
                <div className="absolute -bottom-8 left-6 p-4 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center">
                  <LayoutGrid className="size-8 text-blue-600" />
                </div>
              </div>

              {/* Content */}
              <ScrollArea className="flex-1 bg-gray-50/50">
                <div className="p-6 pt-12 space-y-8">

                  {/* Title Section */}
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{selectedElement.customData?.name || "Sans Nom"}</h1>
                    <p className="text-sm text-gray-500 font-mono mt-1">ID: {selectedElement.id}</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {selectedElement.customData?.price && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-3 py-1">
                          <DollarSign className="size-3 mr-1" />
                          {selectedElement.customData.price} Ar / {selectedElement.customData.priceUnit}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-gray-600 bg-white">
                        Type: {selectedElement.type}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Working Days */}
                    <div className="bg-white p-5 rounded-xl border shadow-sm">
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-800">
                        <Calendar className="size-4 text-orange-500" />
                        Jours d'ouverture
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {DAYS.map(day => {
                          const isOpen = (selectedElement.customData?.workingDays || []).includes(day.id);
                          return (
                            <div
                              key={day.id}
                              className={cn(
                                "text-xs px-2 py-1 rounded-md border",
                                isOpen
                                  ? "bg-orange-50 border-orange-200 text-orange-700 font-medium"
                                  : "bg-gray-50 border-gray-100 text-gray-300 decoration-slice line-through opacity-60"
                              )}
                            >
                              {day.label}
                            </div>
                          )
                        })}
                        {(!selectedElement.customData?.workingDays || selectedElement.customData.workingDays.length === 0) && (
                          <span className="text-sm text-gray-400 italic">Aucun jour défini</span>
                        )}
                      </div>
                    </div>

                    {/* Linked Children */}
                    <div className="bg-white p-5 rounded-xl border shadow-sm">
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-800">
                        <Users className="size-4 text-blue-500" />
                        Sous-éléments associés & enfants
                      </h3>

                      <div className="space-y-2">
                        {selectedElement.customData?.children && selectedElement.customData.children.length > 0 ? (
                          (selectedElement.customData.children as string[]).map(childId => (
                            <div key={childId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors group cursor-pointer" onClick={() => setActiveDetail(childId)}>
                              <div className="size-8 rounded bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-100">
                                <LayoutGrid className="size-4" />
                              </div>
                              <span className="text-sm font-medium text-gray-700">{getElementName(childId)}</span>
                              <ChevronRight className="ml-auto size-4 text-gray-300" />
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-sm text-gray-400 bg-gray-50 rounded-lg border border-dashed">
                            Aucun enfant lié à cet emplacement.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
