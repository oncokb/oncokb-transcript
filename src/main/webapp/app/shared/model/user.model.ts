// CrudStore needs Record<string, unknown> as a type so this cannot be an interface
export type IUser = {
  // the following three elements will be made required.
  firstName: string;
  lastName: string;
  email: string;
  authorities: string[];
  imageUrl: string;
};

export const defaultValue: Readonly<IUser> = {
  firstName: '',
  lastName: '',
  email: '',
  authorities: [],
  imageUrl: '',
};
