export type WorkgroupType = 'folder' | 'file' | 'link';

export interface WorkgroupItem {
    id: string; // Identifier
    name: string;

    // Type and Hierarchy
    type: WorkgroupType;
    parentId?: string | null;     // 'root' or a parent folder's ID
    children?: WorkgroupItem[];   // If type === 'folder'

    // Icons
    icon?: string; // Optional icon identifier (Lucide name)

    // Map Context (excalidraw floor plan identifiers)
    floorId?: string; // Exists when type === 'file' defining a floor plan

    createdAt: string;
    updatedAt: string;
}

export interface CreateWorkgroupItemDTO {
    name: string;
    type: WorkgroupType;
    parentId?: string | null;
    icon?: string;
    floorId?: string;
}

export interface UpdateWorkgroupItemDTO extends Partial<CreateWorkgroupItemDTO> {
    // Can add specific logic
}
