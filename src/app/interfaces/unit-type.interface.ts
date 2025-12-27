export interface UnitTypeImageInterface {
  name: string;
  extension: string;
  data: string;
}
export interface UnitTypeInterface {
  id?: string;
  nameAr: string;
  nameEn: string;
  image: UnitTypeImageInterface;
}

export interface UnitTypeResponseInterface {
  id: string;
  nameAr: string;
  nameEn: string;
  imagePath: string;
}
