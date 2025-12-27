export interface Role {
  roleId: string;
  roleName: string;
  description: string;
  enabled: boolean;
}

export interface AssignRolesRequest {
  userRoles: Role[];
}

