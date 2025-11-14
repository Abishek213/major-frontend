export const checkUserPermission = (userPermissions, requiredPermission) => {
    return userPermissions.includes(requiredPermission);
  };