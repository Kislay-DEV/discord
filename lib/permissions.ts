// permissions.ts
export const PERMISSIONS = {
    CREATE_INVITE: 1n << 0n,
    MANAGE_CHANNELS: 1n << 1n,
    MANAGE_SERVER: 1n << 2n,
    MANAGE_ROLES: 1n << 3n,
    MANAGE_MEMBERS: 1n << 4n,
    KICK_MEMBERS: 1n << 5n,
    BAN_MEMBERS: 1n << 6n,
    ADMINISTRATOR: 1n << 7n,
    // Add more permissions as needed
  };
  
  export type PermissionKey = keyof typeof PERMISSIONS;