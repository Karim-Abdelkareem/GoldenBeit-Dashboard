export interface StageInterface {
  id?: string;
  nameAr: string;
  nameEn: string;
  year: string;
  projectId: string;
  cityIds: string[];
  projectNameAr?: string;
  projectNameEn?: string;
  cityNames?: string[];
}

export interface Stage {
  nameAr: string;
  nameEn: string;
  year: string;
  projectId: string;
  cityIds: string[];
}
