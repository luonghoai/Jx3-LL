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
  'DPS1',
  'Buff',
  'Boss'
] as const

export type Role = typeof ROLE_OPTIONS[number]

// Role display values mapping
export const ROLE_DISPLAY_VALUES: Record<Role, string> = {
  'Tank': 'Tank',
  'DPS': 'DPS Ngoại',
  'DPS1': 'DPS Nội',
  'Buff': 'Buff',
  'Boss': 'Lão Bản'
} as const

export type RoleDisplayValue = typeof ROLE_DISPLAY_VALUES[Role]

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

// Redefined relationship: One class can have one or many roles
// Each member/guest will have one class and one corresponding role from that class
// Boss role is default for all classes, so it's not explicitly defined
export const CLASS_ROLE_RELATIONSHIP: Record<ClassCode, Role[]> = {
  'BD': ['DPS'],
  'DT': ['DPS1', 'Buff'],
  'TV': ['Tank', 'DPS'],
  'DM': ['DPS', 'DPS1'],
  'TCM': ['DPS1', 'Buff'],
  'TD': ['DPS', 'DPS1'],
  'TS': ['DPS', 'Tank'],
  'TK': ['DPS'],
  'CB': ['DPS'],
  'DT1': ['DPS'],
  'DT2': ['DPS1'],
  'LTC': ['DPS'],
  'MG': ['DPS1', 'Tank'],
  'BL': ['DPS'],
  'TT': ['DPS1', 'Buff'],
  'TL': ['DPS1', 'Tank'],
  'VH': ['DPS1', 'Buff'],
  'ND': ['DPS1', 'Buff'],
  'VL': ['DPS'],
  'DTT': ['DPS1']
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

// Class icons mapping (from public/icons folder)
// These are the general class icons, different from role-specific icons
export const CLASS_ICONS: Record<ClassCode, string> = {
  'BD': '/icons/BD.png',
  'DT': '/icons/DT.png',
  'TV': '/icons/TV.png',
  'DM': '/icons/DM.png',
  'TCM': '/icons/TCM.png',
  'TD': '/icons/TD.png',
  'TS': '/icons/TS.png',
  'TK': '/icons/TK.png',
  'CB': '/icons/CB.png',
  'DT1': '/icons/DT1.png',
  'DT2': '/icons/DT2.png',
  'LTC': '/icons/LTC.png',
  'MG': '/icons/MG.png',
  'BL': '/icons/BL.png',
  'TT': '/icons/TT.png',
  'TL': '/icons/TL.png',
  'VH': '/icons/VH.png',
  'ND': '/icons/ND.png',
  'VL': '/icons/VL.png',
  'DTT': '/icons/DTT.png'
} as const

// Class-Role specific icon mapping (from public/logo folder)
// Each class can have different icons for different roles
// Boss role uses the current logo as default
export const CLASS_ROLE_ICONS: Record<ClassCode, Partial<Record<Role, string>>> = {
  'BD': {
    'Boss': '/logo/badao.png',
    'DPS': '/logo/badao.png'
  },
  'DT': {
    'Boss': '/logo/beitianyaozong-dps.png',
    'DPS1': '/logo/beitianyaozong-dps.png',
    'Buff': '/logo/beitianyaozong-buff.png'
  },
  'TV': {
    'Boss': '/logo/cangyun-dps.png',
    'Tank': '/logo/cangyun-tank.png',
    'DPS': '/logo/cangyun-dps.png'
  },
  'DM': {
    'Boss': '/logo/cangyun-wai.png',
    'DPS': '/logo/cangyun-wai.png',
    'DPS1': '/logo/cangyun-nei.png'
  },
  'TCM': {
    'Boss': '/logo/changge-dps.png',
    'DPS1': '/logo/changge-dps.png',
    'Buff': '/logo/changge-buff.png'
  },
  'TD': {
    'Boss': '/logo/chunyang-wai.png',
    'DPS': '/logo/chunyang-wai.png',
    'DPS1': '/logo/chunyang-nei.png'
  },
  'TS': {
    'Boss': '/logo/tiance-dps.png',
    'DPS': '/logo/tiance-dps.png',
    'Tank': '/logo/tiance-tank.png'
  },
  'TK': {
    'Boss': '/logo/cangjian.png',
    'DPS': '/logo/cangjian.png'
  },
  'CB': {
    'Boss': '/logo/gaibang.png',
    'DPS': '/logo/gaibang.png'
  },
  'DT1': {
    'Boss': '/logo/daozong.png',
    'DPS': '/logo/daozong.png'
  },
  'DT2': {
    'Boss': '/logo/duanshi.png',
    'DPS': '/logo/duanshi.png'
  },
  'LTC': {
    'Boss': '/logo/lingxuege.png',
    'DPS': '/logo/lingxuege.png'
  },
  'MG': {
    'Boss': '/logo/mingjiao-dps.png',
    'DPS': '/logo/mingjiao-dps.png',
    'Tank': '/logo/mingjiao-tank.png'
  },
  'BL': {
    'Boss': '/logo/penglai.png',
    'DPS': '/logo/penglai.png'
  },
  'TT': {
    'Boss': '/logo/qixiu-dps.png',
    'DPS1': '/logo/qixiu-dps.png',
    'Buff': '/logo/qixiu-buff.png'
  },
  'TL': {
    'Boss': '/logo/shaolin-dps.png',
    'DPS1': '/logo/shaolin-dps.png',
    'Tank': '/logo/shaolin-tank.png'
  },
  'VH': {
    'Boss': '/logo/wanhua-dps.png',
    'DPS1': '/logo/wanhua-dps.png',
    'Buff': '/logo/wanhua-buff.png'
  },
  'ND': {
    'Boss': '/logo/wudu-dps.png',
    'DPS1': '/logo/wudu-dps.png',
    'Buff': '/logo/wudu-buff.png'
  },
  'VL': {
    'Boss': '/logo/wanlingshanzhuang.png',
    'DPS': '/logo/wanlingshanzhuang.png'
  },
  'DTT': {
    'Boss': '/logo/yantianzong.png',
    'DPS': '/logo/yantianzong.png'
  }
}

// Function to get general class icon (from public/icons folder)
export const getClassIcon = (classCode: ClassCode): string => {
  return CLASS_ICONS[classCode] || '/icons/app-icon.svg'
}

// Function to get role-specific icon (from public/logo folder)
export const getClassRoleIcon = (classCode: ClassCode, role: Role): string => {
  const classIcons = CLASS_ROLE_ICONS[classCode]
  if (!classIcons) {
    return '/icons/app-icon.svg' // fallback to app icon
  }
  
  // Return role-specific icon if available, otherwise fallback to Boss icon
  return classIcons[role] || classIcons['Boss'] || '/icons/app-icon.svg'
}

// Function to get class icon with fallback options
export const getClassIconWithFallback = (classCode: ClassCode, role?: Role): string => {
  // If role is specified, try to get role-specific icon first
  if (role && role !== 'Boss') {
    const roleIcon = getClassRoleIcon(classCode, role)
    if (roleIcon && roleIcon !== '/icons/app-icon.svg') {
      return roleIcon
    }
  }
  
  // Fallback to general class icon
  return getClassIcon(classCode)
}

// Get available roles for a specific class (Boss is always available)
export const getAvailableRolesForClass = (classCode: ClassCode): Role[] => {
  const explicitRoles = CLASS_ROLE_RELATIONSHIP[classCode] || []
  return ['Boss', ...explicitRoles]
}

// Get available classes for a specific role
export const getAvailableClassesForRole = (role: Role): ClassCode[] => {
  if (role === 'Boss') {
    // Boss is available for all classes
    return CLASS_OPTIONS.map(cls => cls.code as ClassCode)
  }
  
  return Object.entries(CLASS_ROLE_RELATIONSHIP)
    .filter(([_, roles]) => roles.includes(role))
    .map(([code]) => code as ClassCode)
}

// Get default role for a class (Boss is always the default)
export const getDefaultRoleForClass = (classCode: ClassCode): Role => {
  return 'Boss'
}

// Get default DPS role for a class (prioritizes DPS over DPS1)
export const getDefaultDPSRoleForClass = (classCode: ClassCode): Role => {
  const availableRoles = CLASS_ROLE_RELATIONSHIP[classCode] || []
  
  // Prioritize DPS over DPS1
  if (availableRoles.includes('DPS')) {
    return 'DPS'
  } else if (availableRoles.includes('DPS1')) {
    return 'DPS1'
  }
  
  // Fallback to Boss if no DPS roles available
  return 'Boss'
}

// Get default class for a role (first available class)
export const getDefaultClassForRole = (role: Role): ClassCode | null => {
  const classes = getAvailableClassesForRole(role)
  return classes.length > 0 ? classes[0] : null
}

// Validate if a role is valid for a class
export const isValidRoleForClass = (role: Role, classCode: ClassCode): boolean => {
  if (role === 'Boss') {
    return true // Boss is valid for all classes
  }
  return CLASS_ROLE_RELATIONSHIP[classCode]?.includes(role) || false
}

// Validate if a class is valid for a role
export const isValidClassForRole = (classCode: ClassCode, role: Role): boolean => {
  if (role === 'Boss') {
    return true // All classes are valid for Boss
  }
  return CLASS_ROLE_RELATIONSHIP[classCode]?.includes(role) || false
}

// Helper functions to get role display values
export const getRoleDisplayValue = (role: Role): string => {
  return ROLE_DISPLAY_VALUES[role] || role
}

export const getRoleFromDisplayValue = (displayValue: string): Role | null => {
  const entry = Object.entries(ROLE_DISPLAY_VALUES).find(([_, value]) => value === displayValue)
  return entry ? (entry[0] as Role) : null
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