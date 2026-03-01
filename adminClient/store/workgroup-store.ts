import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Globe, Folder, File, Megaphone } from "lucide-react";
import React from "react";

export type WorkgroupItem = {
    id: string;
    name: string;
    icon?: string; // Store as string name for persistence
    type?: 'folder' | 'file';
    children?: WorkgroupItem[];
    floorId?: string; // ID for localStorage/Excalidraw
    hasWarning?: boolean;
    warningMessage?: string;
};

interface WorkgroupState {
    groups: WorkgroupItem[];
    expandedItems: string[];
    setGroups: (groups: WorkgroupItem[]) => void;
    addItem: (newItem: WorkgroupItem, parentId: string) => void;
    deleteItem: (itemId: string) => void;
    toggleItem: (id: string) => void;
    setExpandedItems: (items: string[]) => void;
}

export const useWorkgroupStore = create<WorkgroupState>()(
    persist(
        (set) => ({
            groups: [],
            expandedItems: [],
            setGroups: (groups) => set({ groups }),
            setExpandedItems: (expandedItems) => set({ expandedItems }),
            toggleItem: (id) => set((state) => ({
                expandedItems: state.expandedItems.includes(id)
                    ? state.expandedItems.filter((item) => item !== id)
                    : [...state.expandedItems, id]
            })),
            addItem: (newItem, parentId) => set((state) => {
                if (parentId === "root") {
                    return { groups: [...state.groups, newItem] };
                }

                const updateChildren = (items: WorkgroupItem[]): WorkgroupItem[] => {
                    return items.map(item => {
                        if (item.id === parentId) {
                            return {
                                ...item,
                                children: [...(item.children || []), newItem]
                            };
                        }
                        if (item.children) {
                            return {
                                ...item,
                                children: updateChildren(item.children)
                            };
                        }
                        return item;
                    });
                };

                return { groups: updateChildren(state.groups) };
            }),
            deleteItem: (itemId) => set((state) => {
                const deleteRecursive = (items: WorkgroupItem[]): WorkgroupItem[] => {
                    return items.filter(item => item.id !== itemId).map(item => ({
                        ...item,
                        children: item.children ? deleteRecursive(item.children) : undefined
                    }));
                };
                return { groups: deleteRecursive(state.groups) };
            }),
        }),
        {
            name: "workgroup-storage",
        }
    )
);
