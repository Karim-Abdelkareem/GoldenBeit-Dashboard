import { Component, OnInit, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { EstateunitService } from '../../../services/estateunit.service';
import { EstateUnit as EstateUnitData, UnitImage } from '../../../interfaces/estate-unit.interface';
import {
  LucideAngularModule,
  ArrowLeft,
  Home,
  Building2,
  MapPin,
  Ruler,
  BedDouble,
  Bath,
  ChefHat,
  Eye,
  Phone,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  Compass,
  Layers,
  CreditCard,
  FileText,
  Users,
  Tag,
  Edit,
  Save,
} from 'lucide-angular';
import { HotToastService } from '@ngxpert/hot-toast';
import { environment } from '../../../environment/environment';

@Component({
  selector: 'app-estate-unit-details',
  imports: [CommonModule, LucideAngularModule, DatePipe, FormsModule, DialogModule],
  templateUrl: './estate-unit-details.html',
  styleUrl: './estate-unit-details.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EstateUnitDetails implements OnInit {
  estateUnit = signal<EstateUnitData | null>(null);
  loading = signal<boolean>(true);
  imageUrl = environment.imageUrl;
  updateDialogVisible = false;
  updating = false;
  newStatus: number | null = null;
  approverMessage: string = '';
  isApproved: boolean = false;

  // Icons
  protected readonly ArrowLeft = ArrowLeft;
  protected readonly Home = Home;
  protected readonly Building2 = Building2;
  protected readonly MapPin = MapPin;
  protected readonly Ruler = Ruler;
  protected readonly BedDouble = BedDouble;
  protected readonly Bath = Bath;
  protected readonly ChefHat = ChefHat;
  protected readonly Eye = Eye;
  protected readonly Phone = Phone;
  protected readonly DollarSign = DollarSign;
  protected readonly Calendar = Calendar;
  protected readonly CheckCircle2 = CheckCircle2;
  protected readonly XCircle = XCircle;
  protected readonly Compass = Compass;
  protected readonly Layers = Layers;
  protected readonly CreditCard = CreditCard;
  protected readonly FileText = FileText;
  protected readonly Users = Users;
  protected readonly Tag = Tag;
  protected readonly Edit = Edit;
  protected readonly Save = Save;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private estateUnitService: EstateunitService,
    private hotToastService: HotToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEstateUnit(id);
    } else {
      this.hotToastService.error('Estate Unit ID not found');
      this.router.navigate(['/estate-units']);
    }
  }

  loadEstateUnit(id: string): void {
    this.loading.set(true);
    this.estateUnitService.getEstateUnit(id).subscribe(
      (response: any) => {
        this.estateUnit.set(response);
        this.loading.set(false);
      },
      (error: any) => {
        this.hotToastService.error('Failed to load estate unit');
        this.loading.set(false);
        this.router.navigate(['/estate-units']);
      }
    );
  }

  goBack(): void {
    this.router.navigate(['/estate-units']);
  }

  getValidImages(): UnitImage[] {
    const unit = this.estateUnit();
    if (!unit?.images || !Array.isArray(unit.images)) {
      return [];
    }
    return unit.images.filter((img) => img.imagePath && img.imagePath.trim() !== '');
  }

  getImageUrlFromPath(imagePath: string): string {
    if (!imagePath) {
      return '/blog/3.jpg'; // Default fallback image
    }
    // If imagePath already starts with http, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // Otherwise, prepend the base URL
    return `${this.imageUrl}${imagePath}`;
  }

  formatPrice(price?: number, currency?: number): string {
    if (price === undefined || price === null) return 'N/A';
    const formattedPrice = new Intl.NumberFormat('en-US').format(price);
    const currencySymbol = this.getCurrencySymbol(currency);
    return `${formattedPrice} ${currencySymbol}`;
  }

  getCurrencySymbol(currency?: number): string {
    const currencies: { [key: number]: string } = {
      0: 'EGP',
      1: 'USD',
      2: 'EUR',
    };
    return currencies[currency ?? 0] || 'EGP';
  }

  getStatusBadge(status?: number): { text: string; class: string } {
    // Status enum: 0=PendingApproval, 1=Rejected, 2=Available, 3=Requested, 4=Sold
    const statuses: { [key: number]: { text: string; class: string } } = {
      0: { text: 'Pending Approval', class: 'bg-yellow-100 text-yellow-800' },
      1: { text: 'Rejected', class: 'bg-red-100 text-red-800' },
      2: { text: 'Available', class: 'bg-green-100 text-green-800' },
      3: { text: 'Requested', class: 'bg-blue-100 text-blue-800' },
      4: { text: 'Sold', class: 'bg-gray-100 text-gray-800' },
    };
    return statuses[status ?? 2] || { text: 'Unknown', class: 'bg-gray-100 text-gray-800' };
  }

  formatArea(area?: number): string {
    if (area === undefined || area === null) return 'N/A';
    return `${new Intl.NumberFormat('en-US').format(area)} m²`;
  }

  getPaymentMethodText(method?: number): string {
    return method === 0 ? 'Cash' : method === 1 ? 'Installment' : 'N/A';
  }

  // Update status methods
  openUpdateDialog(): void {
    const unit = this.estateUnit();
    if (unit) {
      this.newStatus = unit.status ?? 0;
      this.approverMessage = unit.approverMessage || '';
      this.isApproved = unit.isApproved ?? false;
      this.updateDialogVisible = true;
    }
  }

  closeUpdateDialog(): void {
    this.updateDialogVisible = false;
    this.newStatus = null;
    this.approverMessage = '';
    this.isApproved = false;
  }

  updateStatus(): void {
    const unit = this.estateUnit();
    if (!unit || this.newStatus === null) return;

    this.updating = true;
    this.estateUnitService
      .updateEstateUnitStatus(unit.id, this.newStatus, this.approverMessage || undefined, this.isApproved)
      .subscribe(
        () => {
          this.hotToastService.success('Estate unit status updated successfully');
          this.closeUpdateDialog();
          this.loadEstateUnit(unit.id);
          this.updating = false;
        },
        (error) => {
          console.error('Error updating estate unit status:', error);
          this.hotToastService.error('Failed to update estate unit status');
          this.updating = false;
        }
      );
  }

  getStatusOptions(): Array<{ value: number; label: string }> {
    return [
      { value: 0, label: 'Pending Approval' },
      { value: 1, label: 'Rejected' },
      { value: 2, label: 'Available' },
      { value: 3, label: 'Requested' },
      { value: 4, label: 'Sold' },
    ];
  }
}
