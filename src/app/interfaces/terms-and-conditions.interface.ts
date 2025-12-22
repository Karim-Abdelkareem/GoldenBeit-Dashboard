export interface TermsAndConditionsInterface {
  id?: string;
  titleAr: string;
  titleEn: string;
  subTitleAr: string;
  subTitleEn: string;
  contentAr: string;
  contentEn: string;
}

export interface TermAndCondition {
  id?: string;
  titleAr: string;
  titleEn: string;
  subTitleAr: string;
  subTitleEn: string;
  contentAr: string[];
  contentEn: string[];
}
