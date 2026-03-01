export type SpaceType = 'BUILDING' | 'FLOOR' | 'PARKING' | 'ZONE' | 'TABLE' | 'CHAIR' | 'AREA' | 'ROOM' | string;
export type SpaceStatus = 'DRAFT' | 'PUBLISHED' | 'PRIVATE' | 'MAINTENANCE' | 'ARCHIVED';

export interface Space {
    id: number;
    uuid: string;
    organizerId: number;
    parentSpaceId?: number | null;

    // Core definition
    name: string;
    slug: string;
    spaceType: SpaceType;
    description?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    icon?: string | null;
    status: SpaceStatus;

    capacity?: number | null;

    // Hierarchy
    parentSpace?: Space | null;
    childSpaces?: Space[];

    createdAt: string;
    updatedAt: string;
}

export interface CreateSpaceDTO {
    name: string;
    spaceType: SpaceType;
    capacity?: number;
    parentSpaceId?: number | null;
    status?: SpaceStatus;
}
