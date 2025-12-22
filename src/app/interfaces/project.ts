export interface ProjectImage {
  name: string;
  extension: string;
  data: string | null;
}

export interface Project {
  id: string;
  nameAr: string;
  nameEn: string;
  subNameAr: string;
  subNameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  includesAr: string;
  includesEn: string;
  imagePath: string;
  createdOn: string;
}

export interface ProjectFormData {
  id?: string;
  nameAr: string;
  nameEn: string;
  subNameAr: string;
  subNameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  includesAr: string[];
  includesEn: string[];
  image: ProjectImage;
}
