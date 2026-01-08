export interface ProjectImage {
  name: string;
  extension: string;
  data: string | null;
}

export interface UnitTypeInfo {
  id: string;
  unitTypeId: string;
  projectId: string;
  unitTypeNameAr: string;
  unitTypeNameEn: string;
  projectNameAr: string;
  projectNameEn: string;
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
  unitTypeIds?: string[];
  unitTypeNames?: string[];
  unitTypes?: UnitTypeInfo[];
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
  unitTypeIds: string[];
  image: ProjectImage;
  deleteCurrentImage?: boolean;
}
