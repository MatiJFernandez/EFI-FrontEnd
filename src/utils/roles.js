export const getRoleLabel = (role) => {
  switch (role) {
    case 'admin':
      return 'Administrador';
    case 'moderator':
      return 'Cocinero';
    case 'waiter':
      return 'Mesero';
    default:
      return role || 'Usuario';
  }
};

export const getRoleColor = (role) => {
  switch (role) {
    case 'admin':
      return 'error';
    case 'moderator':
      return 'warning';
    case 'waiter':
      return 'info';
    default:
      return 'primary';
  }
};
