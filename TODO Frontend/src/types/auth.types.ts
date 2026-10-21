export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ProfileUpdate {
  name?: string;
  email?: string;
  avatar?: File;
}

export interface PasswordChange {
  oldPassword: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
