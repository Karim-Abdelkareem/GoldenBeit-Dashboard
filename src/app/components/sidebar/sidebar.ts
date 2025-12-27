import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import {
  LucideAngularModule,
  LayoutDashboard,
  PanelRightOpen,
  PanelLeftOpen,
  LogOut,
  Book,
  Plus,
  Pencil,
  LibraryBig,
  Award,
  Building2,
  Star,
  MessagesSquare,
  MailQuestionMark,
  Mail,
  HelpCircle,
  Landmark,
  Layers2,
  FileText,
  House,
  Users,
  ChevronDown,
} from 'lucide-angular';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AccordionModule } from 'primeng/accordion';
import { CommonModule } from '@angular/common';
import { HotToastService } from '@ngxpert/hot-toast';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [LucideAngularModule, RouterLink, RouterLinkActive, AccordionModule, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  protected readonly PanelRightOpen = PanelRightOpen;
  protected readonly PanelLeftOpen = PanelLeftOpen;
  protected readonly LogOut = LogOut;
  protected readonly ChevronDown = ChevronDown;
  
  // Track expanded items
  expandedItems = new Set<string>();

  constructor(
    private hotToastService: HotToastService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Auto-expand items with active child routes on init
    this.GeneralItems.forEach((item) => {
      if (item.items && this.isChildRouteActive(item)) {
        this.expandedItems.add(item.label);
      }
    });
  }

  get isLoggedIn() {
    return this.authService.isLoggedIn();
  }
  get user() {
    return this.authService.getUser();
  }
  @Input() isOpen!: boolean;
  @Output() isOpenChange = new EventEmitter<boolean>();

  // Check if any child route is active
  isChildRouteActive(item: any): boolean {
    if (!item.items || item.items.length === 0) {
      return false;
    }
    const currentUrl = this.router.url;
    return item.items.some((subItem: any) => {
      if (subItem.route === currentUrl) {
        return true;
      }
      // Check if current URL starts with the subItem route
      return currentUrl.startsWith(subItem.route + '/') || currentUrl === subItem.route;
    });
  }

  // Toggle item expansion
  toggleItemExpansion(item: any): void {
    if (!this.isOpen || !item.items || item.items.length === 0) {
      return;
    }
    if (this.expandedItems.has(item.label)) {
      this.expandedItems.delete(item.label);
    } else {
      this.expandedItems.add(item.label);
    }
  }

  // Check if item is expanded
  isItemExpanded(item: any): boolean {
    return this.expandedItems.has(item.label);
  }
  // {
  //   label: 'Dashboard',
  //   icon: LayoutDashboard,
  //   route: '/dashboard',
  // },
  protected readonly GeneralItems = [
    {
      label: 'Articles',
      icon: Book,
      route: '/articles',
      items: [
        {
          label: 'View Articles',
          icon: Book,
          route: '/articles',
        },
        {
          label: 'Add Articles',
          icon: Plus,
          route: '/articles/add',
        },
      ],
    },
    {
      label: 'Article Categories',
      icon: LibraryBig,
      route: '/article-categories',
      items: [
        {
          label: 'View Article Categories',
          icon: LibraryBig,
          route: '/article-categories',
        },
        {
          label: 'Add Article Categories',
          icon: Plus,
          route: '/article-categories/add',
        },
      ],
    },
    {
      label: 'City',
      icon: Building2,
      route: '/city',
      items: [
        {
          label: 'View Cities',
          icon: Building2,
          route: '/city',
        },
        {
          label: 'Add City',
          icon: Plus,
          route: '/city/add',
        },
      ],
    },
    {
      label: 'Company Reviews',
      icon: Star,
      route: '/company-reviews',
      items: [
        {
          label: 'View Company Reviews',
          icon: Star,
          route: '/company-reviews',
        },
        {
          label: 'Add Company Reviews',
          icon: Plus,
          route: '/company-reviews/add',
        },
      ],
    },
    {
      label: 'Consultations',
      icon: MessagesSquare,
      route: '/consultations',
      items: [
        {
          label: 'View Consultations',
          icon: MessagesSquare,
          route: '/consultations',
        },
        {
          label: 'Add Consultations',
          icon: Plus,
          route: '/consultations/add',
        },
      ],
    },
    {
      label: 'Consultation Requests',
      icon: MailQuestionMark,
      route: '/consultation-requests',
    },
    {
      label: 'Contact Us Messages',
      icon: Mail,
      route: '/contact-us-messages',
    },
    {
      label: 'Estate Units',
      icon: Building2,
      route: '/estate-units',
    },
    {
      label: 'FA Questions',
      icon: HelpCircle,
      route: '/fa-questions',
      items: [
        {
          label: 'View FA Questions',
          icon: HelpCircle,
          route: '/fa-questions',
        },
        {
          label: 'Add FA Questions',
          icon: Plus,
          route: '/fa-questions/add',
        },
      ],
    },
    {
      label: 'Projects',
      icon: Landmark,
      route: '/projects',
      items: [
        {
          label: 'View Projects',
          icon: Landmark,
          route: '/projects',
        },
        {
          label: 'Add Projects',
          icon: Plus,
          route: '/projects/add',
        },
      ],
    },
    {
      label: 'Stages',
      icon: Layers2,
      route: '/stage',
      items: [
        {
          label: 'View Stages',
          icon: Layers2,
          route: '/stage',
        },
        {
          label: 'Add Stages',
          icon: Plus,
          route: '/stage/add',
        },
      ],
    },
    {
      label: 'Terms and Conditions',
      icon: FileText,
      route: '/terms-and-conditions',
      items: [
        {
          label: 'View Terms and Conditions',
          icon: FileText,
          route: '/terms-and-conditions',
        },
        {
          label: 'Add Terms and Conditions',
          icon: Plus,
          route: '/terms-and-conditions/add',
        },
      ],
    },
    {
      label: 'Unit Type',
      icon: House,
      route: '/unit-type',
      items: [
        {
          label: 'View Unit Type',
          icon: House,
          route: '/unit-type',
        },
        {
          label: 'Add Unit Type',
          icon: Plus,
          route: '/unit-type/add',
        },
      ],
    },
    {
      label: 'Users',
      icon: Users,
      route: '/users',
      items: [
        {
          label: 'View Users',
          icon: Users,
          route: '/users',
        },
        {
          label: 'Add Users',
          icon: Plus,
          route: '/users/add',
        },
      ],
    },
  ];
  logout() {
    this.hotToastService.success('Logged out successfully');
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
