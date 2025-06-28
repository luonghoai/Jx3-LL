// Meeting Status Options
export const MEETING_STATUS = {
  DRAFT: 'draft',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELED: 'canceled'
} as const

export type MeetingStatus = typeof MEETING_STATUS[keyof typeof MEETING_STATUS]

// Meeting Status Display Configuration
export const MEETING_STATUS_CONFIG = {
  [MEETING_STATUS.DRAFT]: {
    label: 'Draft',
    color: 'bg-yellow-100 text-yellow-800',
    buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
  },
  [MEETING_STATUS.CONFIRMED]: {
    label: 'Confirmed',
    color: 'bg-blue-100 text-blue-800',
    buttonColor: 'bg-blue-600 hover:bg-blue-700'
  },
  [MEETING_STATUS.COMPLETED]: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800',
    buttonColor: 'bg-green-600 hover:bg-green-700'
  },
  [MEETING_STATUS.CANCELED]: {
    label: 'Canceled',
    color: 'bg-gray-100 text-gray-800',
    buttonColor: 'bg-gray-600 hover:bg-gray-700'
  }
} as const

// Meeting Filter Options
export const MEETING_FILTER_OPTIONS = {
  ALL: 'all',
  DRAFT: 'draft',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELED: 'canceled'
} as const

export type MeetingFilterOption = typeof MEETING_FILTER_OPTIONS[keyof typeof MEETING_FILTER_OPTIONS]

// Role Options for Team Members
export const ROLE_OPTIONS = [
  'Tank',
  'DPS',
  'Buff',
  'Boss'
] as const

export type Role = typeof ROLE_OPTIONS[number]

// Class Options for Team Members with both code and value
export const CLASS_OPTIONS = [
  { code: 'BD', value: 'Bá Đao' },
  { code: 'DT', value: 'Dược Tông' },
  { code: 'TV', value: 'Thương Vân' },
  { code: 'DM', value: 'Đường Môn' },
  { code: 'TCM', value: 'Trường Ca Môn' },
  { code: 'TD', value: 'Thuần Dương' },
  { code: 'TS', value: 'Thiên Sách' },
  { code: 'TK', value: 'Tàng Kiếm' },
  { code: 'CB', value: 'Cái Bang' },
  { code: 'DT1', value: 'Đao Tông' },
  { code: 'DT2', value: 'Đoàn Thị' },
  { code: 'LTC', value: 'Lăng Tuyết Các' },
  { code: 'MG', value: 'Minh Giáo' },
  { code: 'BL', value: 'Bồng Lai' },
  { code: 'TT', value: 'Thất Tú' },
  { code: 'TL', value: 'Thiếu Lâm' },
  { code: 'VH', value: 'Vạn Hoa' },
  { code: 'ND', value: 'Ngũ Độc' },
  { code: 'VL', value: 'Vạn Linh' },
  { code: 'DTT', value: 'Diễn Thiên Tông' }
] as const

export type ClassCode = typeof CLASS_OPTIONS[number]['code']
export type ClassValue = typeof CLASS_OPTIONS[number]['value']

// Relationship between Classes and Roles
// One class can have one or many roles
export const CLASS_ROLE_RELATIONSHIP: Record<ClassCode, Role[]> = {
  'BD': ['Boss', 'DPS'],
  'DT': ['Boss', 'DPS', 'Buff'],
  'TV': ['Boss', 'Tank', 'DPS'],
  'DM': ['DPS', 'Boss'],
  'TCM': ['Boss', 'DPS', 'Buff'],
  'TD': ['DPS', 'Boss'],
  'TS': ['Boss', 'DPS', 'Tank'],
  'TK': ['Boss', 'DPS'],
  'CB': ['Boss', 'DPS'],
  'DT1': ['Boss', 'DPS'],
  'DT2': ['Boss', 'DPS'],
  'LTC': ['Boss', 'DPS'],
  'MG': ['Boss', 'DPS', 'Tank'],
  'BL': ['Boss', 'DPS'],
  'TT': ['Boss', 'DPS', 'Buff'],
  'TL': ['Boss', 'DPS', 'Tank'],
  'VH': ['Boss', 'DPS', 'Buff'],
  'ND': ['Boss', 'DPS', 'Buff'],
  'VL': ['Boss', 'DPS'],
  'DTT': ['Boss', 'DPS']
} as const

// Helper functions to get class info
export const getClassValue = (code: ClassCode): ClassValue => {
  const classOption = CLASS_OPTIONS.find(c => c.code === code)
  return classOption?.value || code as ClassValue
}

export const getClassCode = (value: ClassValue): ClassCode => {
  const classOption = CLASS_OPTIONS.find(c => c.value === value)
  return classOption?.code || value as ClassCode
}

export const getClassIcon = (classCode: ClassCode): string => {
  // Map class codes to their corresponding icon files
  const iconMap: Record<ClassCode, string> = {
    'BD': '/logo/badao.png',
    'DT': '/logo/beitianyaozong-dps.png',
    'TV': '/logo/cangyun-dps.png',
    'DM': '/logo/cangyun-wai.png',
    'TCM': '/logo/changge-dps.png',
    'TD': '/logo/chunyang-nei.png',
    'TS': '/logo/tiance-dps.png',
    'TK': '/logo/cangjian.png',
    'CB': '/logo/gaibang.png',
    'DT1': '/logo/daozong.png',
    'DT2': '/logo/duanshi.png',
    'LTC': '/logo/lingxuege.png',
    'MG': '/logo/mingjiao-dps.png',
    'BL': '/logo/penglai.png',
    'TT': '/logo/qixiu-buff.png',
    'TL': '/logo/shaolin-dps.png',
    'VH': '/logo/wanhua-buff.png',
    'ND': '/logo/wudu-buff.png',
    'VL': '/logo/wanlingshanzhuang.png',
    'DTT': '/logo/yantianzong.png'
  }
  
  return iconMap[classCode] || '/icons/app-icon.svg' // fallback to app icon
}

export const getAvailableRolesForClass = (classCode: ClassCode): Role[] => {
  return CLASS_ROLE_RELATIONSHIP[classCode] || []
}

export const getAvailableClassesForRole = (role: Role): ClassCode[] => {
  return Object.entries(CLASS_ROLE_RELATIONSHIP)
    .filter(([_, roles]) => roles.includes(role))
    .map(([code]) => code as ClassCode)
}

// UI Configuration
export const UI_CONFIG = {
  // Pagination
  ITEMS_PER_PAGE: 25,
  
  // Search
  SEARCH_DEBOUNCE_MS: 300,
  
  // Modal
  MODAL_Z_INDEX: 50,
  
  // Colors
  COLORS: {
    PRIMARY: 'blue',
    SUCCESS: 'green',
    WARNING: 'yellow',
    ERROR: 'red',
    INFO: 'gray'
  }
} as const

// Form Validation
export const VALIDATION = {
  // Name validation
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s]+$/
  },
  
  // Email validation
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  
  // Meeting title validation
  MEETING_TITLE: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100
  },
  
  // Description validation
  DESCRIPTION: {
    MAX_LENGTH: 500
  }
} as const

// API Endpoints (for future use)
export const API_ENDPOINTS = {
  TEAM_MEMBERS: '/api/team-members',
  MEETINGS: '/api/meetings',
  GUESTS: '/api/guests'
} as const

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  MEETING_DRAFTS: 'meeting_drafts',
  SEARCH_HISTORY: 'search_history'
} as const

// Default Values
export const DEFAULTS = {
  // Meeting form defaults
  MEETING: {
    TITLE: '',
    DESCRIPTION: '',
    DATE: new Date().toISOString().split('T')[0],
    TIME: (() => {
      const now = new Date()
      const nextHour = new Date(now.getTime() + 60 * 60 * 1000)
      return `${nextHour.getHours().toString().padStart(2, '0')}:00`
    })(),
    SELECTED_MEMBERS: [],
    TEMPORARY_GUESTS: [],
    PARTICIPANTS: []
  },
  
  // Team member form defaults
  TEAM_MEMBER: {
    NAME: '',
    EMAIL: '',
    ROLES: '',
    DEPARTMENTS: ''
  },
  
  // Guest form defaults
  GUEST: {
    NAME: '',
    EMAIL: '',
    ROLE: 'Guest'
  }
} as const

// Error Messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_NAME: 'Name can only contain letters and spaces',
  MEETING_TITLE_TOO_SHORT: 'Meeting title must be at least 3 characters',
  MEETING_TITLE_TOO_LONG: 'Meeting title cannot exceed 100 characters',
  DESCRIPTION_TOO_LONG: 'Description cannot exceed 500 characters',
  NO_PARTICIPANTS: 'Please select at least one participant',
  MEETING_ROLE_REQUIRED: 'Please specify a meeting role',
  MEETING_DEPARTMENT_REQUIRED: 'Please specify a meeting department'
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  TEAM_MEMBER_ADDED: 'Team member added successfully',
  TEAM_MEMBER_UPDATED: 'Team member updated successfully',
  TEAM_MEMBER_DELETED: 'Team member deleted successfully',
  MEETING_CREATED: 'Meeting request created successfully',
  MEETING_CONFIRMED: 'Meeting confirmed successfully',
  MEETING_CANCELED: 'Meeting canceled successfully',
  GUEST_ADDED: 'Guest added successfully',
  GUEST_REMOVED: 'Guest removed successfully'
} as const

// Error and Success Messages
export const MESSAGES = {
  ERROR: {
    REQUIRED_FIELDS: 'Please fill in all required fields',
    MEETING_ROLE_REQUIRED: 'Meeting role and class are required',
    INVALID_DATE: 'Please select a valid date',
    INVALID_TIME: 'Please select a valid time'
  },
  SUCCESS: {
    MEMBER_ADDED: 'Team member added successfully',
    MEMBER_UPDATED: 'Team member updated successfully',
    MEMBER_DELETED: 'Team member deleted successfully',
    MEETING_CREATED: 'Meeting request created successfully',
    MEETING_UPDATED: 'Meeting request updated successfully',
    GUEST_ADDED: 'Guest added successfully'
  }
} as const 