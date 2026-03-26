export interface User {
  id: number;
  name: string | null;
  email: string;
  todos?: Todo[];
}

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
  user?: User;
}

export interface CreateUserInput {
  name: string;
  email: string;
}

export interface CreateTodoInput {
  title: string;
  userId?: number;
}

export interface UpdateTodoInput {
  title?: string;
  completed?: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// ==================== FAMILY TREE ====================

export type Gender = 'MALE' | 'FEMALE';
export type MarriageStatus = 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'SEPARATED';
export type TreePermission = 'VIEW' | 'EDIT' | 'ADMIN';

export interface FamilyTree {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  owner?: User;
  persons?: Person[];
  marriages?: Marriage[];
  members?: FamilyTreeMember[];
  _count?: {
    persons: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface FamilyTreeMember {
  id: number;
  userId: number;
  familyTreeId: number;
  permission: TreePermission;
  user?: User;
  createdAt: string;
}

export interface Person {
  id: number;
  familyTreeId: number;
  name: string;
  phoneNumber?: string;
  gender: Gender;
  birthDate?: string;
  birthPlace?: string;
  avatar?: string;
  bio?: string;
  userId?: number;
  isDeceased: boolean;
  deathDate?: string;
  deathPlace?: string;
  burialPlace?: string;
  fatherId?: number;
  motherId?: number;
  positionX: number;
  positionY: number;
  branchColor: string;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  father?: Person;
  mother?: Person;
  childrenAsFather?: Person[];
  childrenAsMother?: Person[];
  marriagesAsSpouse1?: Marriage[];
  marriagesAsSpouse2?: Marriage[];
  familyTree?: FamilyTree;
  createdBy?: User;
}

export interface Marriage {
  id: number;
  familyTreeId: number;
  spouse1Id: number;
  spouse2Id: number;
  marriageDate?: string;
  marriagePlace?: string;
  status: MarriageStatus;
  divorceDate?: string;
  divorceReason?: string;
  orderForSpouse1: number;
  orderForSpouse2: number;
  spouse1?: Person;
  spouse2?: Person;
  familyTree?: FamilyTree;
  createdAt: string;
  updatedAt: string;
}

// ==================== INPUT TYPES ====================

export interface CreateFamilyTreeInput {
  name: string;
  description?: string;
}

export interface UpdateFamilyTreeInput {
  name?: string;
  description?: string;
}

export interface CreatePersonInput {
  familyTreeId: number;
  name: string;
  gender: Gender;
  phoneNumber?: string;
  birthDate?: string;
  birthPlace?: string;
  avatar?: string;
  bio?: string;
  fatherId?: number;
  motherId?: number;
  isDeceased?: boolean;
  deathDate?: string;
  deathPlace?: string;
  burialPlace?: string;
  positionX?: number;
  positionY?: number;
  branchColor?: string;
  userId?: number;
}

export interface UpdatePersonInput {
  name?: string;
  gender?: Gender;
  phoneNumber?: string;
  birthDate?: string;
  birthPlace?: string;
  avatar?: string;
  bio?: string;
  fatherId?: number | null;
  motherId?: number | null;
  isDeceased?: boolean;
  deathDate?: string;
  deathPlace?: string;
  burialPlace?: string;
  positionX?: number;
  positionY?: number;
  branchColor?: string;
  userId?: number | null;
}

export interface CreateMarriageInput {
  familyTreeId: number;
  spouse1Id: number;
  spouse2Id: number;
  marriageDate?: string;
  marriagePlace?: string;
  status?: MarriageStatus;
  orderForSpouse1?: number;
  orderForSpouse2?: number;
}

export interface UpdateMarriageInput {
  marriageDate?: string;
  marriagePlace?: string;
  status?: MarriageStatus;
  divorceDate?: string;
  divorceReason?: string;
  orderForSpouse1?: number;
  orderForSpouse2?: number;
}

export interface AddMemberInput {
  userId: number;
  permission: TreePermission;
}

export interface PositionUpdate {
  id: number;
  positionX: number;
  positionY: number;
}
