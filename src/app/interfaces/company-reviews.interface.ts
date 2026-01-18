export interface CompanyReviewsInterface {
  id: string;
  rate: number;
  review: string;
  userId: string;
  userName: string;
}

export interface CompanyReviewFormData {
  rate: number;
  review: string;
}
