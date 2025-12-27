export interface UserInterface {
  id: string;
  userName: string;
  firstName: string;
  lastName: string | null;
  email: string;
  isActive: boolean;
  emailConfirmed: boolean;
  countryCode: string | null;
  phoneNumber: string | null;
  imageUrl: string | null;
  roles?: string[];
}

export interface CreateUserInterface {
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  countryCode: string;
}

export interface UpdateUserInterface {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  countryCode: string;
  email: string;
  image?: {
    name: string;
    extension: string;
    data: string;
  };
  deleteCurrentImage?: boolean;
}
