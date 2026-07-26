// ─── Pagination ─────────────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  data: T[]
  totalRecords: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

// ─── Auth / User ─────────────────────────────────────────────────────────────

export type UserRole =
  | 'ADMIN'
  | 'PRODUCTION_ENGINEER'
  | 'OPERATOR'
  | 'WAREHOUSE_MANAGER'

export type Capability =
    | 'VIEW_USER'
    | 'VIEW_USERS'
    | 'INSERT_USER'
    | 'EDIT_USER'
    | 'DELETE_USER'
    | 'VIEW_ITEMS'
    | 'INSERT_ITEM'
    | 'EDIT_ITEM'
    | 'DELETE_ITEM'
    | 'VIEW_BOM'
    | 'EDIT_BOM'
    | 'VIEW_ROUTING'
    | 'EDIT_ROUTING'
    | 'VIEW_MACHINES'
    | 'EDIT_MACHINES'
    | 'VIEW_WORK_ORDERS'
    | 'INSERT_WORK_ORDER'
    | 'EDIT_WORK_ORDER'
    | 'START_WORK_ORDER'
    | 'COMPLETE_WORK_ORDER'
    | 'ASSIGN_WORK_ORDER'
    | 'VIEW_INVENTORY'
    | 'ADJUST_INVENTORY'


// JWT payload (decoded from token)
export interface JwtPayload {
  // Standard claims
  sub?: string
  exp?: number
  // Custom claims from our backend
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': string
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': string
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': string
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': UserRole
  capability: Capability | Capability[]
}

// Simplified user info extracted from JWT
export interface AuthUser {
  userId: string
  username: string
  email: string
  role: UserRole
  capabilities: Capability[]
}

export interface UserReadOnlyDTO {
  id: number
  username: string
  email: string
  firstname: string
  lastname: string
  role: UserRole
}

export interface RoleReadOnlyDTO {
  id: number
  name: string
}

// ─── Unit of Measure ─────────────────────────────────────────────────────────

export interface UoMReadOnlyDTO {
  id: number
  name: string
  symbol: string
}

// ─── Items ────────────────────────────────────────────────────────────────────

export type ItemType = 'RawMaterial' | 'SemiFinished' | 'FinalProduct' | 'Consumable'

export interface ItemReadOnlyDTO {
  id: number
  itemCode: string
  name: string
  description?: string
  itemType: ItemType
  isManufactured: boolean
  stockQuantity: number
  weightPerUoM?: number
  weight?: number
  unitOfMeasureId: number
  unitOfMeasureSymbol: string
  weightUoMSymbol?: string
}

export interface ItemInsertDTO {
  itemCode: string
  name: string
  description?: string
  itemType: ItemType
  weightPerUoM?: number
  unitOfMeasureId: number
  weightUoMId?: number
}

// ─── BOM ─────────────────────────────────────────────────────────────────────

export interface BomLineReadOnlyDTO {
  id: number
  componentItemId: number
  componentItemCode: string
  componentItemName: string
  quantity: number
  unitOfMeasureSymbol: string
  notes?: string
}

// ─── Routing ─────────────────────────────────────────────────────────────────

export interface RoutingStepReadOnlyDTO {
  id: number
  sequence: number
  operationName: string
  estimatedMinutes: number
  workstationCode: string
  workstationName: string
  machineCode?: string
  machineName?: string
  notes?: string
}

// ─── Workstations ─────────────────────────────────────────────────────────────

export interface WorkstationReadOnlyDTO {
  id: number
  code: string
  name: string
  notes?: string
}

export interface MachineReadOnlyDTO {
  id: number
  code: string
  name: string
  notes?: string
  workstationId: number
}

// ─── Work Orders ──────────────────────────────────────────────────────────────

export type WorkOrderStatus = 'Draft' | 'Released' | 'InProgress' | 'Completed' | 'Cancelled'

export interface WorkOrderReadOnlyDTO {
  id: number
  workOrderCode: string
  status: WorkOrderStatus
  producedItemId: number
  producedItemCode: string
  producedItemName: string
  quantity: number
  unitOfMeasureSymbol: string
  plannedStartDate: string
  plannedEndDate: string
  actualStartDate?: string
  actualEndDate?: string
  createdByUsername: string
  totalOperations: number
  completedOperations: number
  notes?: string
}

export type OperationStatus = 'Pending' | 'InProgress' | 'Completed' | 'Cancelled'

export interface WorkOrderOperationReadOnlyDTO {
  id: number
  sequence: number
  status: OperationStatus
  operationName: string
  workstationCode: string
  workstationName: string
  machineCode?: string
  machineName?: string
  assignedToUsername?: string
  actualStartDate?: string
  actualEndDate?: string
  notes?: string
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export type TransactionType = 'Purchase' | 'Adjustment' | 'Consumption' | 'Production'

export interface InventoryTransactionReadOnlyDTO {
  id: number
  itemCode: string
  itemName: string
  transactionType: TransactionType
  quantity: number
  insertedAt: string
  notes?: string
  workOrderCode?: string
  createdByUsername: string
}
