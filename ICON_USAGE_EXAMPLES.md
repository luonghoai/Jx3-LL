# Icon Usage Examples

This document shows how to use the different icon functions in your application.

## Available Icon Functions

### 1. `getClassIcon(classCode)` - General Class Icon
Returns the general class icon from `public/icons` folder.

```typescript
import { getClassIcon } from '@/lib/constants'

// Get general class icon
const bdIcon = getClassIcon('BD') // Returns '/icons/BD.png'
const dtIcon = getClassIcon('DT') // Returns '/icons/DT.png'
```

### 2. `getClassRoleIcon(classCode, role)` - Role-Specific Icon
Returns the role-specific icon from `public/logo` folder.

```typescript
import { getClassRoleIcon } from '@/lib/constants'

// Get role-specific icons
const bdBossIcon = getClassRoleIcon('BD', 'Boss') // Returns '/logo/badao.png'
const dtDpsIcon = getClassRoleIcon('DT', 'DPS1') // Returns '/logo/beitianyaozong-dps.png'
const tvTankIcon = getClassRoleIcon('TV', 'Tank') // Returns '/logo/cangyun-tank.png'
```

### 3. `getClassIconWithFallback(classCode, role?)` - Smart Icon Selection
Returns the best available icon with fallback logic.

```typescript
import { getClassIconWithFallback } from '@/lib/constants'

// With role specified - tries role-specific first, falls back to class icon
const icon1 = getClassIconWithFallback('DT', 'DPS1') // Returns role-specific icon
const icon2 = getClassIconWithFallback('DT', 'Boss') // Returns general class icon

// Without role - returns general class icon
const icon3 = getClassIconWithFallback('DT') // Returns '/icons/DT.png'
```

## Usage Examples in Components

### Example 1: Display General Class Icon
```tsx
import { getClassIcon, getClassValue } from '@/lib/constants'

function ClassIcon({ classCode }: { classCode: string }) {
  return (
    <img 
      src={getClassIcon(classCode as any)}
      alt={getClassValue(classCode as any)}
      className="w-6 h-6"
      title={getClassValue(classCode as any)}
    />
  )
}
```

### Example 2: Display Role-Specific Icon
```tsx
import { getClassRoleIcon, getClassValue, getRoleDisplayValue } from '@/lib/constants'

function RoleSpecificIcon({ classCode, role }: { classCode: string; role: string }) {
  return (
    <img 
      src={getClassRoleIcon(classCode as any, role as any)}
      alt={`${getClassValue(classCode as any)} - ${getRoleDisplayValue(role as any)}`}
      className="w-6 h-6"
      title={`${getClassValue(classCode as any)} - ${getRoleDisplayValue(role as any)}`}
    />
  )
}
```

### Example 3: Smart Icon with Fallback
```tsx
import { getClassIconWithFallback, getClassValue, getRoleDisplayValue } from '@/lib/constants'

function SmartIcon({ classCode, role }: { classCode: string; role?: string }) {
  return (
    <img 
      src={getClassIconWithFallback(classCode as any, role as any)}
      alt={role ? `${getClassValue(classCode as any)} - ${getRoleDisplayValue(role as any)}` : getClassValue(classCode as any)}
      className="w-6 h-6"
      title={role ? `${getClassValue(classCode as any)} - ${getRoleDisplayValue(role as any)}` : getClassValue(classCode as any)}
    />
  )
}
```

## When to Use Each Function

### Use `getClassIcon()` when:
- Displaying a class in a list or grid
- Showing class information without role context
- Need consistent class representation

### Use `getClassRoleIcon()` when:
- Displaying specific role information
- Want to show role-specific visual differences
- Need precise role-class combination

### Use `getClassIconWithFallback()` when:
- Want the best available icon automatically
- Displaying in contexts where role might or might not be available
- Need graceful fallback behavior

## Icon File Structure

```
public/
├── icons/           # General class icons
│   ├── BD.png
│   ├── DT.png
│   ├── TV.png
│   └── ...
└── logo/            # Role-specific icons
    ├── badao.png
    ├── beitianyaozong-dps.png
    ├── cangyun-tank.png
    └── ...
```

## Migration Guide

If you're currently using `getClassRoleIcon()` everywhere and want to switch to the new system:

### Before (Current):
```tsx
// Always shows role-specific icon
<img src={getClassRoleIcon(classCode, role)} />
```

### After (Options):

**Option 1: Use general class icons**
```tsx
// Shows general class icon
<img src={getClassIcon(classCode)} />
```

**Option 2: Use smart fallback**
```tsx
// Shows role-specific if available, otherwise general class icon
<img src={getClassIconWithFallback(classCode, role)} />
```

**Option 3: Keep role-specific (no change needed)**
```tsx
// Still shows role-specific icon
<img src={getClassRoleIcon(classCode, role)} />
``` 