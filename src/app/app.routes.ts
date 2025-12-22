import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Article } from './pages/article/article';
import { AddArticles } from './pages/article/add-articles/add-articles';
import { ArticleDetails } from './pages/article/article-details/article-details';
import { ArticleCategory } from './pages/article-category/article-category';
import { AddArticleCategory } from './pages/article-category/add-article-category/add-article-category';
import { City } from './pages/city/city';
import { AddCity } from './pages/city/add-city/add-city';
import { CompanyReviews } from './pages/company-reviews/company-reviews';
import { AddCompanyReviews } from './pages/company-reviews/add-company-reviews/add-company-reviews';
import { AddConsultation } from './pages/consultation/add-consultation/add-consultation';
import { Consultation } from './pages/consultation/consultation';
import { Login } from './pages/login/login';
import { ContactUsMsg } from './pages/contact-us-msg/contact-us-msg';
import { EstateUnit } from './pages/estate-unit/estate-unit';
import { AddFaQuestion } from './pages/fa-question/add-fa-question/add-fa-question';
import { FaQuestion } from './pages/fa-question/fa-question';
import { AddProject } from './pages/project/add-project/add-project';
import { Project } from './pages/project/project';
import { Stages } from './pages/stages/stages';
import { AddStages } from './pages/stages/add-stages/add-stages';
import { TermsAndConditions } from './pages/terms-and-conditions/terms-and-conditions';
import { AddTermsAndConditions } from './pages/terms-and-conditions/add-terms-and-conditions/add-terms-and-conditions';
import { UnitType } from './pages/unit-type/unit-type';
import { AddUnitType } from './pages/unit-type/add-unit-type/add-unit-type';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
    title: 'Login',
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: Dashboard,
    title: 'Dashboard',
  },
  {
    path: 'articles',
    component: Article,
    title: 'View Articles',
  },
  {
    path: 'articles/add',
    component: AddArticles,
    title: 'Add Articles',
  },
  {
    path: 'articles/edit/:id',
    component: AddArticles,
    title: 'Edit Articles',
  },
  {
    path: 'articles/details/:id',
    component: ArticleDetails,
    title: 'Article Details',
  },
  {
    path: 'article-categories',
    component: ArticleCategory,
    title: 'View Article Categories',
  },
  {
    path: 'article-categories/add',
    component: AddArticleCategory,
    title: 'Add Article Categories',
  },
  {
    path: 'article-categories/:id',
    component: AddArticleCategory,
    title: 'Edit Article Categories',
  },
  {
    path: 'city',
    component: City,
    title: 'View Cities',
  },
  {
    path: 'city/add',
    component: AddCity,
    title: 'Add City',
  },
  {
    path: 'city/edit/:id',
    component: AddCity,
    title: 'Edit City',
  },
  {
    path: 'company-reviews',
    component: CompanyReviews,
    title: 'View Company Reviews',
  },
  {
    path: 'company-reviews/add',
    component: AddCompanyReviews,
    title: 'Add Company Reviews',
  },
  {
    path: 'company-reviews/edit/:id',
    component: AddCompanyReviews,
    title: 'Edit Company Review',
  },
  {
    path: 'consultations',
    component: Consultation,
    title: 'View Consultations',
  },
  {
    path: 'consultations/add',
    component: AddConsultation,
    title: 'Add Consultations',
  },
  {
    path: 'consultations/edit/:id',
    component: AddConsultation,
    title: 'Edit Consultations',
  },
  {
    path: 'contact-us-messages',
    component: ContactUsMsg,
    title: 'View Contact Us Messages',
  },
  {
    path: 'estate-units',
    component: EstateUnit,
    title: 'View Estate Units',
  },
  {
    path: 'fa-questions',
    component: FaQuestion,
    title: 'View FA Questions',
  },
  {
    path: 'fa-questions/add',
    component: AddFaQuestion,
    title: 'Add FA Questions',
  },
  {
    path: 'fa-questions/edit/:id',
    component: AddFaQuestion,
    title: 'Edit FA Questions',
  },
  {
    path: 'projects',
    component: Project,
    title: 'View Projects',
  },
  {
    path: 'projects/add',
    component: AddProject,
    title: 'Add Projects',
  },
  {
    path: 'projects/edit/:id',
    component: AddProject,
    title: 'Edit Projects',
  },
  {
    path: 'stage',
    component: Stages,
    title: 'View Stages',
  },
  {
    path: 'stage/add',
    component: AddStages,
    title: 'Add Stage',
  },
  {
    path: 'stage/edit/:id',
    component: AddStages,
    title: 'Edit Stage',
  },
  {
    path: 'terms-and-conditions',
    component: TermsAndConditions,
    title: 'View Terms and Conditions',
  },
  {
    path: 'terms-and-conditions/add',
    component: AddTermsAndConditions,
    title: 'Add Terms and Conditions',
  },
  {
    path: 'terms-and-conditions/edit/:id',
    component: AddTermsAndConditions,
    title: 'Edit Terms and Conditions',
  },
  {
    path: 'unit-type',
    component: UnitType,
    title: 'View Unit Types',
  },
  {
    path: 'unit-type/add',
    component: AddUnitType,
    title: 'Add Unit Type',
  },
  {
    path: 'unit-type/edit/:id',
    component: AddUnitType,
    title: 'Edit Unit Type',
  },
];
