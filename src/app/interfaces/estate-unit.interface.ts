export interface EstateUnit {
  id: string;
  titleAr?: string;
  titleEn?: string;
  unitNumber?: string;
  buildingNumber?: string;
  area?: number;
  descriptionAr?: string;
  descriptionEn?: string;
  forType?: number;
  finishing?: number;
  facade?: number;
  rentType?: number;
  furnishStatus?: number;
  policy?: string;
  character?: string;
  status?: number;
  longitude?: number;
  latitude?: number;
  model?: number;
  view?: string;
  roomCount?: number;
  bathCount?: number;
  kitchenCount?: number;
  ownerShipStatus?: number;
  mainAddress?: string;
  location?: string;
  paidPrice?: number;
  paidPriceCurrency?: number;
  remainingPrice?: number;
  remainingPriceCurrency?: number;
  meterPrice?: number;
  meterPriceCurrency?: number;
  overPrice?: number;
  overPriceCurrency?: number;
  totalPrice?: number;
  totalPriceCurrency?: number;
  paymentMethod?: number;
  installmentPeriod?: string;
  phoneNumber?: string;
  isApproved?: boolean;
  viewable?: boolean;
  approverMessage?: string;
  viewCount?: number;
  cityId?: string;
  cityNameAr?: string;
  cityNameEn?: string;
  stageId?: string;
  stageNameAr?: string;
  stageNameEn?: string;
  images?: UnitImage[];
  [key: string]: any;
}

export interface UnitImage {
  id: string;
  imagePath: string;
  unitId: string;
}

