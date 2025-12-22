import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, ArrowLeft } from 'lucide-angular';
import { UnitTypeService } from '../../../services/unit-type.service';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-add-unit-type',
  imports: [ReactiveFormsModule, CommonModule, LucideAngularModule],
  templateUrl: './add-unit-type.html',
  styleUrl: './add-unit-type.css',
})
export class AddUnitType {
  unitTypeForm: FormGroup;
  isEdit = false;
  id: string | null = null;
  protected readonly ArrowLeft = ArrowLeft;

  constructor(
    private fb: FormBuilder,
    private unitTypeService: UnitTypeService,
    private hotToastService: HotToastService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.unitTypeForm = this.fb.group({
      nameAr: ['', [Validators.required]],
      nameEn: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.id = params['id'];
      this.isEdit = !!this.id;
      if (this.isEdit) {
        this.unitTypeService.getUnitType(this.id!).subscribe(
          (response: any) => {
            this.unitTypeForm.patchValue({
              nameAr: response.nameAr || '',
              nameEn: response.nameEn || '',
            });
            this.cdr.detectChanges();
          },
          (error) => {
            console.error('Error loading unit type:', error);
            this.hotToastService.error('Failed to load unit type');
            this.router.navigate(['/unit-type']);
          }
        );
      }
    });
  }

  get f() {
    return this.unitTypeForm.controls;
  }

  onSubmit(): void {
    if (this.unitTypeForm.invalid) {
      this.unitTypeForm.markAllAsTouched();
      this.hotToastService.error('Please fill in all required fields');
      return;
    }

    const formValue = this.unitTypeForm.value;

    if (this.isEdit && this.id) {
      this.unitTypeService.updateUnitType(this.id, { id: this.id, ...formValue }).subscribe(
        (response: any) => {
          this.hotToastService.success('Unit type updated successfully');
          this.router.navigate(['/unit-type']);
        },
        (error: any) => {
          console.error('Error updating unit type:', error);
          this.hotToastService.error('Failed to update unit type');
        }
      );
    } else {
      this.unitTypeService.addUnitType(formValue).subscribe(
        (response: any) => {
          this.hotToastService.success('Unit type added successfully');
          this.router.navigate(['/unit-type']);
        },
        (error: any) => {
          console.error('Error adding unit type:', error);
          this.hotToastService.error('Failed to add unit type');
        }
      );
    }
  }

  goBack(): void {
    this.router.navigate(['/unit-type']);
  }
}
