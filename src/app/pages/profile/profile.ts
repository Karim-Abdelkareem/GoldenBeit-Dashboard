import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { LucideAngularModule, User, Edit2, X, Check } from 'lucide-angular';
import { HotToastService } from '@ngxpert/hot-toast';
import { environment } from '../../environment/environment';
import { UpdateUserInterface } from '../../interfaces/user.interface';

interface Country {
  name: string;
  nameAr: string;
  code: string;
  flag: string;
  isoCode: string;
  flagUrl: string;
}

@Component({
  selector: 'app-profile',
  imports: [CommonModule, LucideAngularModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  user: any = null;
  imageUrl = environment.imageUrl;
  isEditMode = false;
  profileForm: FormGroup;
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  countryDropdownOpen = false;
  saving = false;

  protected readonly User = User;
  protected readonly Edit2 = Edit2;
  protected readonly X = X;
  protected readonly Check = Check;

  countries: Country[] = [
    {
      name: 'Egypt',
      nameAr: 'مصر',
      code: '+20',
      flag: '🇪🇬',
      isoCode: 'eg',
      flagUrl: 'https://flagcdn.com/w40/eg.png',
    },
    {
      name: 'Bahrain',
      nameAr: 'البحرين',
      code: '+973',
      flag: '🇧🇭',
      isoCode: 'bh',
      flagUrl: 'https://flagcdn.com/w40/bh.png',
    },
    {
      name: 'Kuwait',
      nameAr: 'الكويت',
      code: '+965',
      flag: '🇰🇼',
      isoCode: 'kw',
      flagUrl: 'https://flagcdn.com/w40/kw.png',
    },
    {
      name: 'Qatar',
      nameAr: 'قطر',
      code: '+974',
      flag: '🇶🇦',
      isoCode: 'qa',
      flagUrl: 'https://flagcdn.com/w40/qa.png',
    },
    {
      name: 'Saudi Arabia',
      nameAr: 'المملكة العربية السعودية',
      code: '+966',
      flag: '🇸🇦',
      isoCode: 'sa',
      flagUrl: 'https://flagcdn.com/w40/sa.png',
    },
    {
      name: 'United Arab Emirates',
      nameAr: 'الامارات العربية المتحدة',
      code: '+971',
      flag: '🇦🇪',
      isoCode: 'ae',
      flagUrl: 'https://flagcdn.com/w40/ae.png',
    },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private userService: UserService,
    private hotToastService: HotToastService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      countryCode: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    // Close dropdown when clicking outside
    document.addEventListener('click', (event: any) => {
      if (!event.target.closest('.country-dropdown-container')) {
        this.countryDropdownOpen = false;
      }
    });

    this.loadUser();
  }

  loadUser(): void {
    this.user = this.authService.getUser();
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    // Populate form with user data
    this.profileForm.patchValue({
      firstName: this.user.firstName || '',
      lastName: this.user.lastName || '',
      email: this.user.email || '',
      phoneNumber: this.user.phoneNumber || '',
      countryCode: this.user.countryCode || '',
    });
  }

  get selectedCountry(): Country | undefined {
    const code = this.profileForm.get('countryCode')?.value;
    return this.countries.find((c) => c.code === code);
  }

  get f() {
    return this.profileForm.controls;
  }

  getFullName(): string {
    if (!this.user) return '-';
    const parts = [this.user.firstName, this.user.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : '-';
  }

  getDisplayPhone(): string {
    if (!this.user || !this.user.phoneNumber) {
      return '-';
    }
    if (this.user.phoneNumber?.startsWith('+')) {
      return this.user.phoneNumber;
    }
    return this.user.countryCode
      ? `${this.user.countryCode} ${this.user.phoneNumber}`
      : this.user.phoneNumber;
  }

  getFullImageUrl(imageUrl: string | null | undefined): string {
    if (!imageUrl) {
      return 'profile/person.jpg'; // Fallback image
    }
    return imageUrl.startsWith('http') ? imageUrl : `${this.imageUrl}${imageUrl}`;
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      // Reset form and image preview when canceling edit
      this.loadUser();
      this.selectedImage = null;
      this.imagePreview = null;
    }
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.hotToastService.error('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.hotToastService.error('Image size should be less than 5MB');
        return;
      }

      this.selectedImage = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.imagePreview = null;
  }

  selectCountry(country: Country): void {
    this.profileForm.patchValue({ countryCode: country.code });
    this.countryDropdownOpen = false;
    this.profileForm.get('countryCode')?.markAsTouched();
  }

  toggleCountryDropdown(): void {
    this.countryDropdownOpen = !this.countryDropdownOpen;
  }

  convertImageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async onSubmit(): Promise<void> {
    if (this.profileForm.valid && this.user?.id) {
      this.saving = true;
      const formData = this.profileForm.value;

      const updateData: UpdateUserInterface = {
        id: this.user.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        countryCode: formData.countryCode,
        email: formData.email,
      };

      // Handle image upload
      if (this.selectedImage) {
        try {
          const base64Data = await this.convertImageToBase64(this.selectedImage);
          const extension = this.selectedImage.name.split('.').pop() || '';
          updateData.image = {
            name: this.selectedImage.name,
            extension: extension,
            data: base64Data,
          };
        } catch (error) {
          this.hotToastService.error('Failed to process image');
          this.saving = false;
          return;
        }
      }

      this.userService.updateUser(this.user.id, updateData).subscribe(
        (response: any) => {
          let message = 'Profile updated successfully';
          if (typeof response === 'string') {
            message = response;
          } else if (response?.message) {
            message = response.message;
          }
          this.hotToastService.success(message);

          // Update user in auth service
          const updatedUser = { ...this.user, ...formData };
          if (updateData.image && this.imagePreview) {
            updatedUser.imageUrl = this.imagePreview;
          }
          this.authService.updateUser(updatedUser);
          this.user = updatedUser;

          this.isEditMode = false;
          this.selectedImage = null;
          this.imagePreview = null;
          this.saving = false;
        },
        (error: any) => {
          const errorMessage =
            error?.error?.message || error?.message || 'Failed to update profile';
          this.hotToastService.error(errorMessage);
          this.saving = false;
        }
      );
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.profileForm.controls).forEach((key) => {
        const control = this.profileForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
    }
  }
}
