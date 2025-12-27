import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { CreateUserInterface, UpdateUserInterface } from '../../../interfaces/user.interface';
import { LucideAngularModule, ArrowLeft } from 'lucide-angular';

interface Country {
  name: string;
  nameAr: string;
  code: string;
  flag: string;
  isoCode: string; // ISO 3166-1 alpha-2 code for flag API
  flagUrl: string; // URL to flag image from public API
}

@Component({
  selector: 'app-add-user',
  imports: [ReactiveFormsModule, CommonModule, LucideAngularModule],
  templateUrl: './add-user.html',
  styleUrl: './add-user.css',
})
export class AddUser implements OnInit {
  userForm: FormGroup;
  isEdit = false;
  id: string | null = null;
  countryDropdownOpen = false;
  protected readonly ArrowLeft = ArrowLeft;

  get selectedCountry(): Country | undefined {
    const code = this.userForm.get('countryCode')?.value;
    return this.countries.find((c) => c.code === code);
  }

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
    private fb: FormBuilder,
    private userService: UserService,
    private hotToastService: HotToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.userForm = this.fb.group(
      {
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        userName: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        phoneNumber: ['', [Validators.required]],
        countryCode: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    // Close dropdown when clicking outside
    document.addEventListener('click', (event: any) => {
      if (!event.target.closest('.country-dropdown-container')) {
        this.countryDropdownOpen = false;
      }
    });

    this.route.params.subscribe((params) => {
      this.id = params['id'];
      this.isEdit = !!this.id;

      // For edit mode, password is optional
      if (this.isEdit) {
        this.userForm.get('password')?.clearValidators();
        this.userForm.get('password')?.updateValueAndValidity();
        this.userForm.get('confirmPassword')?.clearValidators();
        this.userForm.get('confirmPassword')?.updateValueAndValidity();

        if (this.id) {
          this.userService.getUser(this.id).subscribe(
            (response: any) => {
              const data = response;
              this.userForm.patchValue({
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                email: data.email || '',
                userName: data.userName || '',
                phoneNumber: data.phoneNumber || '',
                countryCode: data.countryCode || '',
              });
            },
            (error: any) => {
              this.hotToastService.error('Failed to get user');
            }
          );
        }
      }
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  get f() {
    return this.userForm.controls;
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const formData: CreateUserInterface = this.userForm.value;

      // For edit mode, prepare update data according to API structure
      if (this.isEdit && this.id) {
        const updateData: UpdateUserInterface = {
          id: this.id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          countryCode: formData.countryCode,
          email: formData.email,
        };

        // Add image if provided (optional)
        // Note: Image upload functionality can be added later if needed
        // if (this.selectedImage) {
        //   updateData.image = {
        //     name: this.selectedImage.name,
        //     extension: this.selectedImage.name.split('.').pop() || '',
        //     data: this.selectedImageBase64
        //   };
        // }

        // Add deleteCurrentImage if user wants to delete current image
        // updateData.deleteCurrentImage = this.shouldDeleteImage;

        this.userService.updateUser(this.id, updateData).subscribe(
          (response: any) => {
            let message = 'User updated successfully';
            if (typeof response === 'string') {
              message = response;
            } else if (response?.message) {
              message = response.message;
            }
            this.hotToastService.success(message);
            this.router.navigate(['/users']);
          },
          (error: any) => {
            const errorMessage = error?.error?.message || error?.message || 'Failed to update user';
            this.hotToastService.error(errorMessage);
          }
        );
      } else {
        // Send confirmPassword with the request
        this.userService.createUser(formData as CreateUserInterface).subscribe(
          (response: any) => {
            // Handle response: could be string directly or object with message property
            let message = 'User created successfully';
            if (typeof response === 'string') {
              message = response;
            } else if (response?.message) {
              message = response.message;
            }
            this.hotToastService.success(message);
            this.router.navigate(['/users']);
          },
          (error: any) => {
            console.log(error);
            // Use error message from API if available
            const errorMessage = error?.error?.message || error?.message || 'Failed to create user';
            this.hotToastService.error(errorMessage);
          }
        );
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.userForm.controls).forEach((key) => {
        const control = this.userForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
    }
  }

  selectCountry(country: Country): void {
    this.userForm.patchValue({ countryCode: country.code });
    this.countryDropdownOpen = false;
    this.userForm.get('countryCode')?.markAsTouched();
  }

  toggleCountryDropdown(): void {
    this.countryDropdownOpen = !this.countryDropdownOpen;
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}
