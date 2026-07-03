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
  email?: string;
  phone?: string;
  mobile?: string;
  contact_name?: string;
  contact_phone?: string;
  address_line1?: string;
  address_line2?: string;
  neighborhood?: string;
  postal_code?: string;
  state?: string;
  country?: string;
  last_visit_at?: string;
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

// =============================================================================
// Field Types — Discriminated Union
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
  | 'fixed_text'
  | 'vertical_separator'
  | 'horizontal_separator'
  | 'signature'

export interface FieldOption {
  label: string
  value: string
}

/** Base properties shared by all field variants */
export interface FieldBase {
  id: string
  key: string
  label: string
  required: boolean
  showLabel?: boolean
  ai_help_description?: string
}

// --- Column types for DynamicTable ---

export interface TableColumnDef {
  key: string
  label: string
  type: 'text' | 'number' | 'date' | 'select'
  required: boolean
  options?: FieldOption[]
}

export type CalculatedFormula =
  | { op: 'sum' | 'avg' | 'count'; sourceKey: string }
  | { expression: string }

export interface CalculatedColumnDef extends TableColumnDef {
  calculated: true
  formula: CalculatedFormula
}

export interface FooterTotal {
  label: string
  formula: CalculatedFormula
}

// --- Field variants ---

export interface TextField extends FieldBase {
  type: 'text' | 'textarea'
  max_chars?: number
  placeholder?: string
  default_value?: string
}

export interface NumberField extends FieldBase {
  type: 'number'
  decimals?: number
  min?: number
  max?: number
  default_value?: number
}

export interface DateField extends FieldBase {
  type: 'date'
  min_date?: string
  max_date?: string
  placeholder?: string
  default_value?: string
}

export interface SelectionField extends FieldBase {
  type: 'select' | 'multi_select' | 'radio' | 'checkbox'
  options: FieldOption[]
  placeholder?: string
  default_value?: string | string[]
}

export interface FixedTextField extends FieldBase {
  type: 'fixed_text'
  text_content: string
  styling_options?: { bold?: boolean; size?: 'sm' | 'md' | 'lg' }
}

export interface DynamicTableField extends FieldBase {
  type: 'dynamic_table'
  columns: TableColumnDef[]
  footer_totals?: FooterTotal[]
}

export interface VerticalSeparatorField extends FieldBase {
  type: 'vertical_separator'
}

export interface HorizontalSeparatorField extends FieldBase {
  type: 'horizontal_separator'
}

export interface SignatureField extends FieldBase {
  type: 'signature'
}

/** Discriminated union of all field config variants */
export type FieldConfig = TextField | NumberField | DateField | SelectionField | FixedTextField | DynamicTableField | VerticalSeparatorField | HorizontalSeparatorField | SignatureField

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
  display?: string
  rows: Row[]
}

export interface HeaderFooterConfig {
  enabled: boolean
  pageDisplay: 'all' | 'first' | 'last'
  sections: Section[]
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  isActive: boolean
  structure: { sections: Section[]; header?: HeaderFooterConfig; footer?: HeaderFooterConfig }
  createdAt?: string
  updatedAt?: string
}

export type ReportStatus = 'draft' | 'signed' | 'closed'

export interface PatientReport {
  id: string
  patientId: string
  templateId?: string
  userId: string
  status: ReportStatus
  templateStructureSnapshot: { sections: Section[]; header?: HeaderFooterConfig; footer?: HeaderFooterConfig }
  values: Record<string, any>
  createdAt?: string
  updatedAt?: string
  patient_name?: string
  author_name?: string
  template_name?: string
}
