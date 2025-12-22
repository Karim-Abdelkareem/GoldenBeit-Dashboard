export interface CosultationInterface {
  id: string;
  nameAr: string;
  nameEn: string;
  briefAr: string;
  briefEn: string;
  descriptionAr: string;
  descriptionEn: string;
  detailsAr: string[];
  detailsEn: string[];
  imagePath: string;
  createdOn: string;
}

export interface ConsultationImage {
  name: string;
  extension: string;
  data: string;
}

export interface ConsultationFormData {
  nameAr: string;
  nameEn: string;
  briefAr: string;
  briefEn: string;
  descriptionAr: string;
  descriptionEn: string;
  detailsAr: string[];
  detailsEn: string[];
  image: ConsultationImage;
}
