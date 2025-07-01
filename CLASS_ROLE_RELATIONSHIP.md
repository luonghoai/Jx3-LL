# Class-Role Relationship System

## Overview

This document describes the redefined relationship between classes and roles in the admin panel for meeting requests.

## Relationship Definition

### One Class → Multiple Roles
Each class (môn phái) can have one or many roles. The relationship is defined in `lib/constants.ts`:

```typescript
export const CLASS_ROLE_RELATIONSHIP: Record<ClassCode, Role[]> = {
  'BD': ['DPS'],
  'DT': ['DPS', 'Buff'],
  'TV': ['Tank', 'DPS'],
  // ... more classes
}
```

**Note**: The 'Boss' role is the default role for all classes and is not explicitly defined in the relationship. It's automatically available for every class.

### One Member/Guest → One Class + One Role
Each member or guest in a meeting request has:
- **One class** (môn phái)
- **One corresponding role** from that class's available roles (including the default 'Boss' role)

## Available Classes and Their Roles

| Class Code | Class Name | Available Roles |
|------------|------------|-----------------|
| BD | Bá Đao | Boss (default), DPS |
| DT | Dược Tông | Boss (default), DPS, Buff |
| TV | Thương Vân | Boss (default), Tank, DPS |
| DM | Đường Môn | Boss (default), DPS, DPS1 |
| TCM | Trường Ca Môn | Boss (default), DPS, Buff |
| TD | Thuần Dương | Boss (default), DPS, DPS1 |
| TS | Thiên Sách | Boss (default), DPS, Tank |
| TK | Tàng Kiếm | Boss (default), DPS |
| CB | Cái Bang | Boss (default), DPS |
| DT1 | Đao Tông | Boss (default), DPS |
| DT2 | Đoàn Thị | Boss (default), DPS |
| LTC | Lăng Tuyết Các | Boss (default), DPS |
| MG | Minh Giáo | Boss (default), DPS, Tank |
| BL | Bồng Lai | Boss (default), DPS |
| TT | Thất Tú | Boss (default), DPS, Buff |
| TL | Thiếu Lâm | Boss (default), DPS, Tank |
| VH | Vạn Hoa | Boss (default), DPS, Buff |
| ND | Ngũ Độc | Boss (default), DPS, Buff |
| VL | Vạn Linh | Boss (default), DPS |
| DTT | Diễn Thiên Tông | Boss (default), DPS |

## Helper Functions

The system provides several helper functions in `lib/constants.ts`:

### `getAvailableRolesForClass(classCode: ClassCode): Role[]`
Returns all available roles for a given class.

### `getAvailableClassesForRole(role: Role): ClassCode[]`
Returns all classes that can perform a given role.

### `getDefaultRoleForClass(classCode: ClassCode): Role`
Returns 'Boss' as the default role for any class.

### `getDefaultClassForRole(role: Role): ClassCode | null`
Returns the first available class for a role (used as default).

### `isValidRoleForClass(role: Role, classCode: ClassCode): boolean`
Validates if a role is valid for a class. 'Boss' is always valid for all classes.

### `isValidClassForRole(classCode: ClassCode, role: Role): boolean`
Validates if a class is valid for a role. All classes are valid for 'Boss' role.

## Icon System

The system provides two types of icons:

### Class Icons (from `public/icons` folder)
General class icons that represent each class regardless of role.

### Role-Specific Icons (from `public/logo` folder)
Specialized icons that change based on the class-role combination.

### Icon Helper Functions

### `getClassIcon(classCode: ClassCode): string`
Returns the general class icon from the `public/icons` folder.

### `getClassRoleIcon(classCode: ClassCode, role: Role): string`
Returns the role-specific icon from the `public/logo` folder.

### `getClassIconWithFallback(classCode: ClassCode, role?: Role): string`
Returns the best available icon with fallback logic:
1. If role is specified (and not 'Boss'), tries to get role-specific icon
2. Falls back to general class icon if role-specific icon is not available

## UI Behavior

### MemberRoleModal Component
- **Class Selection First**: Users select a class first, then choose from available roles
- **Dynamic Filtering**: When a class is selected, only available roles are shown
- **Validation**: Ensures only valid class-role combinations can be saved
- **Default Values**: Uses helper functions to set appropriate defaults

### Admin Panel Integration
- **Default Assignment**: When adding members/guests, the system automatically assigns the default role for their class
- **Validation**: Ensures all class-role combinations are valid
- **User Experience**: Clear indication of available roles for each class

## Data Structure

### MeetingParticipant Interface
```typescript
interface MeetingParticipant {
  memberId: string
  name: string
  discordUid?: string
  meetingRole: string    // One role from the class's available roles
  meetingClass: string   // One class code
  position?: number
}
```

### TemporaryGuest Interface
```typescript
interface TemporaryGuest {
  id: string
  name: string
  discordUid?: string
  roles: string[]        // All roles the guest can perform
  classes: string[]      // All classes the guest can play
  meetingRole: string    // One role for this meeting
  meetingClass: string   // One class for this meeting
  avatar?: string
  position?: number
}
```

## Benefits

1. **Logical Consistency**: Ensures only valid class-role combinations
2. **User-Friendly**: Clear guidance on available options
3. **Maintainable**: Centralized relationship definition
4. **Flexible**: Easy to add new classes or modify role assignments
5. **Type-Safe**: Full TypeScript support with proper validation

## Future Enhancements

- Role-specific class preferences
- Class-specific role requirements for team composition
- Advanced validation rules for team balance
- Role rotation suggestions based on class availability 