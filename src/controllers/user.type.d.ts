export interface IRegister {
  fullName: string;
  username: string;
  email: string;
  password: string;
  avatar: string;
  coverImage?: string;
}

export interface ILogin {
  email ?:string;
  username?:string;
  password:string;
}