export interface Permission {
  id: number
  name: string
  description: string
}

export interface Role {
  id: number
  name: string
  description: string
  permissions: Permission[]
}

export interface DataUser {
  username: string
  phone: string
  email: string
  fullname: string
  active: boolean
  datecreate: string
  birthday: string
  last_update: string
  roles: Role[]
}

export interface ApiResponse {
  data: DataUser
  timestamp: string
  author: string
  messenger: string
  responseCode: number
}

export interface UserState {
  user: DataUser | null
  loading: boolean
  error: string | null
}


