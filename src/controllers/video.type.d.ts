export interface IVideoQuery  {
  page?: number;
  limit?: number;
  query?: string;
  sortedBy?: "createdAt" | "views" | "duration";
  sortedType?: string;
  userId?: string;
}

export interface IVideoBody {
  title: string;
  description: string;
}
