// Auth
export interface Credentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number | string;
  name: string;
  email: string;
  permissions: PermissionShape[] | string[] | Record<string, number>;
  is_active?: boolean;
}

// Patients
export interface Patient {
  id: number | string;
  medical_record_number: string;
  national_id: string;
  first_name: string;
  last_name: string;
  second_last_name?: string;
  gender: string;
  date_of_birth: string;
  city: string;
  insurance_id?: string;
  is_active?: boolean;
}

// Admin
export interface AdminUser {
  id: number | string;
  name: string;
  email: string;
  role?: Role | string;
  is_active?: boolean;
  permissions: PermissionShape[] | string[] | Record<string, number>;
}

export interface Role {
  id: number | string;
  name: string;
  slug: string;
  permissions: PermissionShape[] | string[];
}

export interface PermissionShape {
  id: number | string;
  name: string;
  slug: string;
}

// HTTP
export interface FetchClientOptions extends RequestInit {
  ignoreUnauthorized?: boolean;
}

export interface ApiError {
  status: number;
  body: any;
}

// Auth service interfaces
export interface IAuthService {
  userRepository: IUserRepository;
  storageGateway: IStorageGateway;
  login(credentials: Credentials): Promise<any>;
  validateToken(): Promise<boolean>;
  logout(): Promise<void>;
  clearSession(): void;
}

export interface IStorageGateway {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
  clear(): void;
  getToken(): string | null;
  setToken(token: string): void;
  removeToken(): void;
}

export interface IUserRepository {
  login(credentials: Credentials): Promise<any>;
  forgot(email: string): Promise<any>;
  me(): Promise<AuthUser>;
  logout(): Promise<any>;
  refresh(): Promise<any>;
  reset(data: any): Promise<any>;
}

export type PermissionFormat = 
  | Record<string, number>   // { 'admin.user.view': 1 }
  | string[]                 // ['admin.user.view']
  | PermissionShape[];       // [{ slug: 'admin.user.view' }]

// =============================================================================
// Report Template Types — Módulo de Informes Dinámicos
// =============================================================================

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'select'
  | 'multi_select'
  | 'radio'
  | 'checkbox'
  | 'dynamic_table'
  | 'signature'

export interface FieldOption {
  label: string
  value: string
}

export interface ConditionalRule {
  field: string
  op: '==' | '!=' | 'contains' | '>' | '<' | '>=' | '<='
  value: string
}

export interface FieldConfig {
  id: string
  type: FieldType
  label: string
  key: string
  placeholder?: string
  required?: boolean
  systemVariable?: string
  options?: FieldOption[]
  columns?: Array<{ name: string; type: FieldType }>
  conditionalRule?: ConditionalRule
}

export interface Column {
  id: string
  label: string
  width?: number
  fields: FieldConfig[]
}

export interface Row {
  id: string
  columns: Column[]
}

export interface Section {
  id: string
  label: string
  display: 'tabs' | 'accordion' | 'default'
  rows: Row[]
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  isActive: boolean
  structure: { sections: Section[] }
  createdAt?: string
  updatedAt?: string
}

export type ReportStatus = 'draft' | 'signed' | 'closed'

export interface PatientReport {
  id: string
  patientId: string
  userId: string
  status: ReportStatus
  templateStructureSnapshot: { sections: Section[] }
  values: Record<string, any>
  createdAt?: string
  updatedAt?: string
  patient_name?: string
  author_name?: string
  template_name?: string
}
