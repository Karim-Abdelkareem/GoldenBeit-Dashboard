export interface CityInterface {
  id: string;
  nameEn: string;
  nameAr: string;
  imagePath: string;
}

export interface CityImage {
  name: string;
  extension: string;
  data: string;
}

export interface CityFormData {
  nameEn: string;
  nameAr: string;
  image: CityImage;
}
