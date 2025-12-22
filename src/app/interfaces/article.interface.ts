export interface ArticleImage {
  name: string;
  extension: string;
  data: string;
}

export interface ArticleFormData {
  id?: string;
  titleAr: string;
  bodyAr: string;
  titleEn: string;
  bodyEn: string;
  order: number;
  categoryId: string;
  image: ArticleImage;
}

export interface Article {
  id: string;
  titleAr: string;
  bodyAr: string;
  titleEn: string;
  bodyEn: string;
  order: number;
  categoryId: string;
  imagePath: string;
  createdAt: string;
}

export interface ArticleResponseData {
  articles: Article[];
  totalPages: number;
  totalCount: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  showStartEllipsis: boolean;
  showEndEllipsis: boolean;
}

export interface ArticleCategoryFormData {
  nameAr: string;
  nameEn: string;
}

export interface ArticleCategoryUpdateFormData {
  id: string;
  nameAr: string;
  nameEn: string;
}

export interface ArticleCategory extends ArticleCategoryFormData {
  id: string;
}
