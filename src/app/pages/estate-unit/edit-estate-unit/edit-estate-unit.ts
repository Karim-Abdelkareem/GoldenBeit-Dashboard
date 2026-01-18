import { Component, ViewChild, ElementRef, signal, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  LucideAngularModule,
  ArrowLeft,
  Upload,
  X,
  Home,
  MapPin,
  DollarSign,
  Settings,
  Image,
  FileText,
  Building2,
  CheckCircle2,
  Save,
  Plus,
} from 'lucide-angular';
import { EstateunitService } from '../../../services/estateunit.service';
import { CityService } from '../../../services/city.service';
import { StagesService } from '../../../services/stages.service';
import { UnitTypeService } from '../../../services/unit-type.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { environment } from '../../../environment/environment';

interface SelectOption {
  id: string;
  nameEn: string;
  nameAr: string;
}

// Enums for dropdowns
enum ForType {
  Sale = 0,
  Rent = 1,
}

enum Finishing {
  NotFinished = 0,
  SemiFinished = 1,
  FullyFinished = 2,
  LuxuryFinished = 3,
}

enum Facade {
  North = 0,
  South = 1,
  East = 2,
  West = 3,
  NorthEast = 4,
  NorthWest = 5,
  SouthEast = 6,
  SouthWest = 7,
}

enum Status {
  PendingApproval = 0,
  Rejected = 1,
  Available = 2,
  Requested = 3,
  Sold = 4,
}

enum OwnershipStatus {
  Owned = 0,
  Rented = 1,
  Inherited = 2,
}

enum RentType {
  Daily = 0,
  Weekly = 1,
  Monthly = 2,
  Yearly = 3,
}

enum FurnishStatus {
  NotFurnished = 0,
  SemiFurnished = 1,
  FullyFurnished = 2,
}

enum PaymentMethod {
  Cash = 0,
  Installment = 1,
  CashAndInstallment = 2,
}

enum Currency {
  EGP = 0,
  USD = 1,
  EUR = 2,
  SAR = 3,
}

@Component({
  selector: 'app-edit-estate-unit',
  imports: [ReactiveFormsModule, CommonModule, LucideAngularModule],
  templateUrl: './edit-estate-unit.html',
  styleUrl: './edit-estate-unit.css',
})
export class EditEstateUnit implements OnInit {

  estateUnitForm!: FormGroup;
  loading = signal<boolean>(true);
  saving = signal<boolean>(false);
  id: string | null = null;
  imageUrl = environment.imageUrl;

  // Image previews - using array for multiple images
  images = signal<Array<{ preview: string; originalPath?: string; isNew: boolean; index: number }>>([]);
  imageInputs: ElementRef<HTMLInputElement>[] = [];

  // Dropdown data
  cities = signal<SelectOption[]>([]);
  stages = signal<SelectOption[]>([]);
  unitTypes = signal<SelectOption[]>([]);
  loadingCities = signal<boolean>(true);
  loadingStages = signal<boolean>(true);
  loadingUnitTypes = signal<boolean>(true);

  // Icons
  protected readonly ArrowLeft = ArrowLeft;
  protected readonly Upload = Upload;
  protected readonly X = X;
  protected readonly Home = Home;
  protected readonly MapPin = MapPin;
  protected readonly DollarSign = DollarSign;
  protected readonly Settings = Settings;
  protected readonly Image = Image;
  protected readonly FileText = FileText;
  protected readonly Building2 = Building2;
  protected readonly CheckCircle2 = CheckCircle2;
  protected readonly Save = Save;
  protected readonly Plus = Plus;

  // Enum options for dropdowns
  forTypeOptions = [
    { value: ForType.Sale, label: 'Sale' },
    { value: ForType.Rent, label: 'Rent' },
  ];

  finishingOptions = [
    { value: Finishing.NotFinished, label: 'Not Finished' },
    { value: Finishing.SemiFinished, label: 'Semi Finished' },
    { value: Finishing.FullyFinished, label: 'Fully Finished' },
    { value: Finishing.LuxuryFinished, label: 'Luxury Finished' },
  ];

  facadeOptions = [
    { value: Facade.North, label: 'North' },
    { value: Facade.South, label: 'South' },
    { value: Facade.East, label: 'East' },
    { value: Facade.West, label: 'West' },
    { value: Facade.NorthEast, label: 'North East' },
    { value: Facade.NorthWest, label: 'North West' },
    { value: Facade.SouthEast, label: 'South East' },
    { value: Facade.SouthWest, label: 'South West' },
  ];

  statusOptions = [
    { value: Status.PendingApproval, label: 'Pending Approval' },
    { value: Status.Rejected, label: 'Rejected' },
    { value: Status.Available, label: 'Available' },
    { value: Status.Requested, label: 'Requested' },
    { value: Status.Sold, label: 'Sold' },
  ];

  ownershipStatusOptions = [
    { value: OwnershipStatus.Owned, label: 'Owned' },
    { value: OwnershipStatus.Rented, label: 'Rented' },
    { value: OwnershipStatus.Inherited, label: 'Inherited' },
  ];

  rentTypeOptions = [
    { value: RentType.Daily, label: 'Daily' },
    { value: RentType.Weekly, label: 'Weekly' },
    { value: RentType.Monthly, label: 'Monthly' },
    { value: RentType.Yearly, label: 'Yearly' },
  ];

  furnishStatusOptions = [
    { value: FurnishStatus.NotFurnished, label: 'Not Furnished' },
    { value: FurnishStatus.SemiFurnished, label: 'Semi Furnished' },
    { value: FurnishStatus.FullyFurnished, label: 'Fully Furnished' },
  ];

  paymentMethodOptions = [
    { value: PaymentMethod.Cash, label: 'Cash' },
    { value: PaymentMethod.Installment, label: 'Installment' },
    { value: PaymentMethod.CashAndInstallment, label: 'Cash & Installment' },
  ];

  currencyOptions = [
    { value: Currency.EGP, label: 'EGP' },
    { value: Currency.USD, label: 'USD' },
    { value: Currency.EUR, label: 'EUR' },
    { value: Currency.SAR, label: 'SAR' },
  ];

  constructor(
    private fb: FormBuilder,
    private estateUnitService: EstateunitService,
    private cityService: CityService,
    private stagesService: StagesService,
    private unitTypeService: UnitTypeService,
    private hotToastService: HotToastService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.loadDropdownData();
      this.loadEstateUnit();
    } else {
      this.hotToastService.error('No estate unit ID provided');
      this.router.navigate(['/estate-units']);
    }
  }

  initForm(): void {
    this.estateUnitForm = this.fb.group({
      // Basic Information
      unitNumber: [''],
      buildingNumber: [''],
      area: [0],
      view: [''],
      model: [''],
      character: [''],
      phoneNumber: [''],

      // Description
      descriptionAr: [''],
      descriptionEn: [''],

      // Location
      mainAddress: [''],
      location: [''],
      longitude: [0],
      latitude: [0],
      cityId: [''],
      stageId: [''],
      unitTypeId: [''],

      // Property Details
      roomCount: [0],
      bathCount: [0],
      kitchenCount: [0],
      forType: [0],
      finishing: [0],
      facade: [0],
      ownerShipStatus: [0],
      rentType: [0],
      furnishStatus: [0],

      // Pricing & Payment
      paymentMethod: [0],
      installmentMethod: [''],
      installmentPeriod: [''],
      installmentAmount: [0],
      installmentAmountCurrency: [0],
      maintenanceFee: [0],
      paidAmount: [0],
      paidAmountCurrency: [0],
      remainingAmount: [0],
      remainingAmountCurrency: [0],
      meterPrice: [0],
      meterPriceCurrency: [0],
      overPrice: [0],
      overPriceCurrency: [0],
      totalPrice: [0],
      totalPriceCurrency: [0],

      // Status & Approval
      status: [0],
      isApproved: [false],
      isViewable: [true],
      isDeliveryReady: [false],
      approverMessage: [''],
      viewCount: [0],

      // Policy
      policy: [''],

      // User ID (hidden)
      userId: [''],
    });
  }

  loadDropdownData(): void {
    // Load cities
    this.cityService.getCities(1, 1000).subscribe(
      (response: any) => {
        const cities = response.data || [];
        this.cities.set(
          cities.map((c: any) => ({
            id: c.id,
            nameEn: c.nameEn || c.cityNameEn || '',
            nameAr: c.nameAr || c.cityNameAr || '',
          }))
        );
        this.loadingCities.set(false);
        this.cdr.detectChanges();
      },
      () => {
        this.loadingCities.set(false);
      }
    );

    // Load stages
    this.stagesService.getStages(1, 1000).subscribe(
      (response: any) => {
        const stages = response.data || [];
        this.stages.set(
          stages.map((s: any) => ({
            id: s.id,
            nameEn: s.nameEn || s.stageNameEn || '',
            nameAr: s.nameAr || s.stageNameAr || '',
          }))
        );
        this.loadingStages.set(false);
        this.cdr.detectChanges();
      },
      () => {
        this.loadingStages.set(false);
      }
    );

    // Load unit types
    this.unitTypeService.getUnitTypes(1, 1000).subscribe(
      (response: any) => {
        const unitTypes = response.data || [];
        this.unitTypes.set(
          unitTypes.map((u: any) => ({
            id: u.id,
            nameEn: u.nameEn || u.unitTypeNameEn || '',
            nameAr: u.nameAr || u.unitTypeNameAr || '',
          }))
        );
        this.loadingUnitTypes.set(false);
        this.cdr.detectChanges();
      },
      () => {
        this.loadingUnitTypes.set(false);
      }
    );
  }

  loadEstateUnit(): void {
    if (!this.id) return;

    this.estateUnitService.getEstateUnit(this.id).subscribe(
      (data: any) => {
        // Patch form with loaded data
        this.estateUnitForm.patchValue({
          unitNumber: data.unitNumber || '',
          buildingNumber: data.buildingNumber || '',
          area: data.area || 0,
          view: data.view || '',
          model: data.model || '',
          character: data.character || '',
          phoneNumber: data.phoneNumber || '',
          descriptionAr: data.descriptionAr || '',
          descriptionEn: data.descriptionEn || '',
          mainAddress: data.mainAddress || '',
          location: data.location || '',
          longitude: data.longitude || 0,
          latitude: data.latitude || 0,
          cityId: data.cityId || '',
          stageId: data.stageId || '',
          unitTypeId: data.unitTypeId || '',
          roomCount: data.roomCount || 0,
          bathCount: data.bathCount || 0,
          kitchenCount: data.kitchenCount || 0,
          forType: data.forType ?? 0,
          finishing: data.finishing ?? 0,
          facade: data.facade ?? 0,
          ownerShipStatus: data.ownerShipStatus ?? 0,
          rentType: data.rentType ?? 0,
          furnishStatus: data.furnishStatus ?? 0,
          paymentMethod: data.paymentMethod ?? 0,
          installmentMethod: data.installmentMethod || '',
          installmentPeriod: data.installmentPeriod || '',
          installmentAmount: data.installmentAmount || 0,
          installmentAmountCurrency: data.installmentAmountCurrency ?? 0,
          maintenanceFee: data.maintenanceFee || 0,
          paidAmount: data.paidAmount || data.paidPrice || 0,
          paidAmountCurrency: data.paidAmountCurrency || data.paidPriceCurrency || 0,
          remainingAmount: data.remainingAmount || data.remainingPrice || 0,
          remainingAmountCurrency: data.remainingAmountCurrency || data.remainingPriceCurrency || 0,
          meterPrice: data.meterPrice || 0,
          meterPriceCurrency: data.meterPriceCurrency ?? 0,
          overPrice: data.overPrice || 0,
          overPriceCurrency: data.overPriceCurrency ?? 0,
          totalPrice: data.totalPrice || 0,
          totalPriceCurrency: data.totalPriceCurrency ?? 0,
          status: data.status ?? 0,
          isApproved: data.isApproved ?? false,
          isViewable: data.viewable ?? data.isViewable ?? true,
          isDeliveryReady: data.isDeliveryReady ?? false,
          approverMessage: data.approverMessage || '',
          viewCount: data.viewCount || 0,
          policy: data.policy || '',
          userId: data.userId || '',
        });

        // Handle images - filter out empty paths and load all valid images
        const loadedImages: Array<{ preview: string; originalPath?: string; isNew: boolean; index: number }> = [];
        
        if (data.images && data.images.length > 0) {
          // Filter images with valid paths
          const validImages = data.images.filter(
            (img: any) => img && img.imagePath && img.imagePath.trim() !== ''
          );

          validImages.forEach((img: any, index: number) => {
            loadedImages.push({
              preview: this.getImageUrl(img.imagePath),
              originalPath: img.imagePath,
              isNew: false,
              index: index,
            });
          });
        } else if (data.imagePath) {
          loadedImages.push({
            preview: this.getImageUrl(data.imagePath),
            originalPath: data.imagePath,
            isNew: false,
            index: 0,
          });
        }

        this.images.set(loadedImages);

        this.loading.set(false);
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error loading estate unit:', error);
        this.hotToastService.error('Failed to load estate unit');
        this.loading.set(false);
        this.router.navigate(['/estate-units']);
      }
    );
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${this.imageUrl}${imagePath}`;
  }

  // Image handling - works with array
  triggerImageInput(index: number): void {
    const input = document.getElementById(`image-input-${index}`) as HTMLInputElement;
    input?.click();
  }

  onImageSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const currentImages = this.images();
        const newImages = [...currentImages];
        
        // If updating existing image
        if (index < newImages.length) {
          newImages[index] = {
            preview: reader.result as string,
            originalPath: newImages[index].originalPath,
            isNew: true,
            index: index,
          };
        } else {
          // Adding new image
          newImages.push({
            preview: reader.result as string,
            isNew: true,
            index: newImages.length,
          });
        }
        
        this.images.set(newImages);
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(index: number): void {
    const currentImages = this.images();
    const newImages = currentImages.filter((_, i) => i !== index);
    // Re-index remaining images
    newImages.forEach((img, i) => {
      img.index = i;
    });
    this.images.set(newImages);
    this.cdr.detectChanges();
  }

  addImageInput(): void {
    const currentImages = this.images();
    const newIndex = currentImages.length;
    // Trigger file input for new image
    setTimeout(() => {
      const input = document.getElementById(`image-input-${newIndex}`) as HTMLInputElement;
      input?.click();
    }, 100);
  }

  processImageFile(dataUrl: string): { name: string; extension: string; data: string } {
    // Extract mime type and base64 data from data URL
    const mimeType = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const extension = mimeType.split('/')[1] || 'jpeg';
    
    // Extension must have dot at the beginning (e.g., ".jpeg")
    const extensionWithDot = '.' + extension.substring(0, 5);
    
    // Data must include the full data URL format: "data:image/type;base64,data"
    return {
      name: `image_${Date.now()}`,
      extension: extensionWithDot,
      data: dataUrl, // Keep full data URL format: "data:image/jpeg;base64,..."
    };
  }

  onSubmit(): void {
    if (this.saving()) return;

    this.saving.set(true);
    const formValue = this.estateUnitForm.value;

    const updateData: any = {
      id: this.id,
      unitNumber: formValue.unitNumber,
      buildingNumber: formValue.buildingNumber,
      area: Number(formValue.area) || 0,
      descriptionAr: formValue.descriptionAr,
      descriptionEn: formValue.descriptionEn,
      longitude: Number(formValue.longitude) || 0,
      latitude: Number(formValue.latitude) || 0,
      view: formValue.view,
      roomCount: Number(formValue.roomCount) || 0,
      bathCount: Number(formValue.bathCount) || 0,
      kitchenCount: Number(formValue.kitchenCount) || 0,
      mainAddress: formValue.mainAddress,
      location: formValue.location,
      policy: formValue.policy,
      forType: Number(formValue.forType),
      finishing: Number(formValue.finishing),
      facade: Number(formValue.facade),
      status: Number(formValue.status),
      ownerShipStatus: Number(formValue.ownerShipStatus),
      rentType: Number(formValue.rentType),
      furnishStatus: Number(formValue.furnishStatus),
      paymentMethod: Number(formValue.paymentMethod),
      installmentMethod: formValue.installmentMethod,
      installmentPeriod: formValue.installmentPeriod,
      installmentAmount: Number(formValue.installmentAmount) || 0,
      installmentAmountCurrency: Number(formValue.installmentAmountCurrency),
      maintenanceFee: Number(formValue.maintenanceFee) || 0,
      paidAmount: Number(formValue.paidAmount) || 0,
      paidAmountCurrency: Number(formValue.paidAmountCurrency),
      remainingAmount: Number(formValue.remainingAmount) || 0,
      remainingAmountCurrency: Number(formValue.remainingAmountCurrency),
      meterPrice: Number(formValue.meterPrice) || 0,
      meterPriceCurrency: Number(formValue.meterPriceCurrency),
      overPrice: Number(formValue.overPrice) || 0,
      overPriceCurrency: Number(formValue.overPriceCurrency),
      totalPrice: Number(formValue.totalPrice) || 0,
      totalPriceCurrency: Number(formValue.totalPriceCurrency),
      character: formValue.character,
      model: formValue.model,
      phoneNumber: formValue.phoneNumber,
      isApproved: formValue.isApproved,
      isViewable: formValue.isViewable,
      isDeliveryReady: formValue.isDeliveryReady,
      approverMessage: formValue.approverMessage,
      viewCount: Number(formValue.viewCount) || 0,
      userId: formValue.userId,
      cityId: formValue.cityId || null,
      stageId: formValue.stageId || null,
      unitTypeId: formValue.unitTypeId || null,
    };

    // Handle images - process all images from the array
    const currentImages = this.images();
    if (currentImages.length > 0) {
      const firstImage = currentImages[0];
      if (firstImage.isNew) {
        updateData.mainImage = this.processImageFile(firstImage.preview);
      }
      
      if (currentImages.length > 1) {
        const secondImage = currentImages[1];
        if (secondImage.isNew) {
          updateData.secondImage = this.processImageFile(secondImage.preview);
        }
      }
    }

    this.estateUnitService.updateEstateUnit(this.id!, updateData).subscribe(
      () => {
        this.hotToastService.success('Estate unit updated successfully');
        this.saving.set(false);
        this.router.navigate(['/estate-units']);
      },
      (error) => {
        console.error('Error updating estate unit:', error);
        this.hotToastService.error('Failed to update estate unit');
        this.saving.set(false);
      }
    );
  }

  goBack(): void {
    this.router.navigate(['/estate-units']);
  }
}
