interface Permission {
  id: number;
  name: string;
  description: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
}


export interface Account {
  id: number;
  username: string;
  phone: string;
  email: string;
  fullname: string;
  active: boolean;
  datecreate: string;
  birthday: string;
  last_update: string;
  roles: Role[];
}