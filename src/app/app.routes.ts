import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout.component/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout.component/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/articles',
    pathMatch: 'full',
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then((m) => m.Login),
        title: 'Login',
      },
    ],
  },
  {
    path: '',
    component: MainLayoutComponent,

    children: [
      {
        path: 'articles',
        loadComponent: () => import('./pages/article/article').then((m) => m.Article),
        title: 'View Articles',
      },
      {
        path: 'articles/add',
        loadComponent: () =>
          import('./pages/article/add-articles/add-articles').then((m) => m.AddArticles),
        title: 'Add Articles',
      },
      {
        path: 'articles/edit/:id',
        loadComponent: () =>
          import('./pages/article/add-articles/add-articles').then((m) => m.AddArticles),
        title: 'Edit Articles',
      },
      {
        path: 'articles/details/:id',
        loadComponent: () =>
          import('./pages/article/article-details/article-details').then((m) => m.ArticleDetails),
        title: 'Article Details',
      },
      {
        path: 'article-categories',
        loadComponent: () =>
          import('./pages/article-category/article-category').then((m) => m.ArticleCategory),
        title: 'View Article Categories',
      },
      {
        path: 'article-categories/add',
        loadComponent: () =>
          import('./pages/article-category/add-article-category/add-article-category').then(
            (m) => m.AddArticleCategory
          ),
        title: 'Add Article Categories',
      },
      {
        path: 'article-categories/:id',
        loadComponent: () =>
          import('./pages/article-category/add-article-category/add-article-category').then(
            (m) => m.AddArticleCategory
          ),
        title: 'Edit Article Categories',
      },
      {
        path: 'city',
        loadComponent: () => import('./pages/city/city').then((m) => m.City),
        title: 'View Cities',
      },
      {
        path: 'city/add',
        loadComponent: () => import('./pages/city/add-city/add-city').then((m) => m.AddCity),
        title: 'Add City',
      },
      {
        path: 'city/edit/:id',
        loadComponent: () => import('./pages/city/add-city/add-city').then((m) => m.AddCity),
        title: 'Edit City',
      },
      {
        path: 'company-reviews',
        loadComponent: () =>
          import('./pages/company-reviews/company-reviews').then((m) => m.CompanyReviews),
        title: 'View Company Reviews',
      },
      {
        path: 'company-reviews/add',
        loadComponent: () =>
          import('./pages/company-reviews/add-company-reviews/add-company-reviews').then(
            (m) => m.AddCompanyReviews
          ),
        title: 'Add Company Reviews',
      },
      {
        path: 'company-reviews/edit/:id',
        loadComponent: () =>
          import('./pages/company-reviews/add-company-reviews/add-company-reviews').then(
            (m) => m.AddCompanyReviews
          ),
        title: 'Edit Company Review',
      },
      {
        path: 'consultations',
        loadComponent: () =>
          import('./pages/consultation/consultation').then((m) => m.Consultation),
        title: 'View Consultations',
      },
      {
        path: 'consultations/add',
        loadComponent: () =>
          import('./pages/consultation/add-consultation/add-consultation').then(
            (m) => m.AddConsultation
          ),
        title: 'Add Consultations',
      },
      {
        path: 'consultations/edit/:id',
        loadComponent: () =>
          import('./pages/consultation/add-consultation/add-consultation').then(
            (m) => m.AddConsultation
          ),
        title: 'Edit Consultations',
      },
      {
        path: 'consultations/details/:id',
        loadComponent: () =>
          import('./pages/consultation/consultation-details/consultation-details').then(
            (m) => m.ConsultationDetails
          ),
        title: 'Consultation Details',
      },
      {
        path: 'contact-us-messages',
        loadComponent: () =>
          import('./pages/contact-us-msg/contact-us-msg').then((m) => m.ContactUsMsg),
        title: 'View Contact Us Messages',
      },
      {
        path: 'estate-units',
        loadComponent: () => import('./pages/estate-unit/estate-unit').then((m) => m.EstateUnit),
        title: 'View Estate Units',
      },
      {
        path: 'fa-questions',
        loadComponent: () => import('./pages/fa-question/fa-question').then((m) => m.FaQuestion),
        title: 'View FA Questions',
      },
      {
        path: 'fa-questions/add',
        loadComponent: () =>
          import('./pages/fa-question/add-fa-question/add-fa-question').then(
            (m) => m.AddFaQuestion
          ),
        title: 'Add FA Questions',
      },
      {
        path: 'fa-questions/edit/:id',
        loadComponent: () =>
          import('./pages/fa-question/add-fa-question/add-fa-question').then(
            (m) => m.AddFaQuestion
          ),
        title: 'Edit FA Questions',
      },
      {
        path: 'projects',
        loadComponent: () => import('./pages/project/project').then((m) => m.Project),
        title: 'View Projects',
      },
      {
        path: 'projects/add',
        loadComponent: () =>
          import('./pages/project/add-project/add-project').then((m) => m.AddProject),
        title: 'Add Projects',
      },
      {
        path: 'projects/edit/:id',
        loadComponent: () =>
          import('./pages/project/add-project/add-project').then((m) => m.AddProject),
        title: 'Edit Projects',
      },
      {
        path: 'stage',
        loadComponent: () => import('./pages/stages/stages').then((m) => m.Stages),
        title: 'View Stages',
      },
      {
        path: 'stage/add',
        loadComponent: () =>
          import('./pages/stages/add-stages/add-stages').then((m) => m.AddStages),
        title: 'Add Stage',
      },
      {
        path: 'stage/edit/:id',
        loadComponent: () =>
          import('./pages/stages/add-stages/add-stages').then((m) => m.AddStages),
        title: 'Edit Stage',
      },
      {
        path: 'terms-and-conditions',
        loadComponent: () =>
          import('./pages/terms-and-conditions/terms-and-conditions').then(
            (m) => m.TermsAndConditions
          ),
        title: 'View Terms and Conditions',
      },
      {
        path: 'terms-and-conditions/add',
        loadComponent: () =>
          import(
            './pages/terms-and-conditions/add-terms-and-conditions/add-terms-and-conditions'
          ).then((m) => m.AddTermsAndConditions),
        title: 'Add Terms and Conditions',
      },
      {
        path: 'terms-and-conditions/edit/:id',
        loadComponent: () =>
          import(
            './pages/terms-and-conditions/add-terms-and-conditions/add-terms-and-conditions'
          ).then((m) => m.AddTermsAndConditions),
        title: 'Edit Terms and Conditions',
      },
      {
        path: 'unit-type',
        loadComponent: () => import('./pages/unit-type/unit-type').then((m) => m.UnitType),
        title: 'View Unit Types',
      },
      {
        path: 'unit-type/add',
        loadComponent: () =>
          import('./pages/unit-type/add-unit-type/add-unit-type').then((m) => m.AddUnitType),
        title: 'Add Unit Type',
      },
      {
        path: 'unit-type/edit/:id',
        loadComponent: () =>
          import('./pages/unit-type/add-unit-type/add-unit-type').then((m) => m.AddUnitType),
        title: 'Edit Unit Type',
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users').then((m) => m.Users),
        title: 'View Users',
      },
      {
        path: 'users/add',
        loadComponent: () => import('./pages/users/add-user/add-user').then((m) => m.AddUser),
        title: 'Add Users',
      },
      {
        path: 'users/edit/:id',
        loadComponent: () => import('./pages/users/add-user/add-user').then((m) => m.AddUser),
        title: 'Edit Users',
      },
      {
        path: 'users/details/:id',
        loadComponent: () =>
          import('./pages/users/user-details/user-details').then((m) => m.UserDetails),
        title: 'User Details',
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile').then((m) => m.Profile),
        title: 'Profile',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'profile',
    pathMatch: 'full',
  },
];
