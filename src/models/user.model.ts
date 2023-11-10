export interface UserPropInterface {
  id?: number;
  name: string;
  document: string;
  cellphone?: string;
  email: string;
  password: string;
  provider: "local" | "google";
  confirmed?: boolean;
  blocked?: boolean;
  createdat?: string;
  updatedat?: string;
}

export const users: UserPropInterface[] = [];
