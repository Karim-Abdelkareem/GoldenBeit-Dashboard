import { Component, ChangeDetectorRef, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, ArrowLeft } from 'lucide-angular';
import { StageInterface } from '../../../interfaces/stage.interface';
import { StagesService } from '../../../services/stages.service';
import { ProjectService } from '../../../services/project.service';
import { HotToastService } from '@ngxpert/hot-toast';

interface ProjectOption {
  id: string;
  nameEn: string;
  nameAr: string;
}

@Component({
  selector: 'app-add-stages',
  imports: [ReactiveFormsModule, CommonModule, LucideAngularModule],
  templateUrl: './add-stages.html',
  styleUrl: './add-stages.css',
})
export class AddStages {
  stageForm: FormGroup;
  isEdit = false;
  id: string | null = null;
  projects = signal<ProjectOption[]>([]);
  loadingProjects = signal<boolean>(true);
  protected readonly ArrowLeft = ArrowLeft;

  constructor(
    private fb: FormBuilder,
    private stagesService: StagesService,
    private projectService: ProjectService,
    private hotToastService: HotToastService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.stageForm = this.fb.group({
      nameAr: ['', [Validators.required]],
      nameEn: ['', [Validators.required]],
      year: ['', [Validators.required]],
      projectId: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadProjects();
    this.route.params.subscribe((params) => {
      this.id = params['id'];
      this.isEdit = !!this.id;
      if (this.isEdit) {
        this.stagesService.getStage(this.id!).subscribe(
          (response: any) => {
            this.stageForm.patchValue({
              nameAr: response.nameAr || '',
              nameEn: response.nameEn || '',
              year: response.year || '',
              projectId: response.projectId || '',
            });
            this.cdr.detectChanges();
          },
          (error: any) => {
            this.hotToastService.error('Failed to load stage');
          }
        );
      }
    });
  }

  loadProjects(): void {
    this.loadingProjects.set(true);
    // Fetch all projects for the dropdown
    this.projectService.getProjects(1, 1000).subscribe(
      (response: any) => {
        const projectsList = response.data || [];
        this.projects.set(
          projectsList.map((project: any) => ({
            id: project.id,
            nameEn: project.nameEn || project.nameAr || 'Untitled Project',
            nameAr: project.nameAr || project.nameEn || 'مشروع بدون عنوان',
          }))
        );
        this.loadingProjects.set(false);
        this.cdr.detectChanges();
      },
      (error: any) => {
        console.error('Error loading projects:', error);
        this.hotToastService.error('Failed to load projects');
        this.loadingProjects.set(false);
        this.cdr.detectChanges();
      }
    );
  }

  get f() {
    return this.stageForm.controls;
  }

  onSubmit(): void {
    if (this.stageForm.valid) {
      const formData = this.stageForm.value as StageInterface;

      if (this.isEdit && this.id) {
        this.stagesService.updateStage(this.id, { id: this.id, ...formData }).subscribe(
          (response: any) => {
            this.hotToastService.success('Stage updated successfully');
            this.router.navigate(['/stage']);
          },
          (error: any) => {
            this.hotToastService.error('Failed to update stage');
          }
        );
      } else {
        this.stagesService.addStage(formData).subscribe(
          (response: any) => {
            this.hotToastService.success('Stage added successfully');
            this.router.navigate(['/stage']);
          },
          (error: any) => {
            this.hotToastService.error('Failed to add stage');
          }
        );
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.stageForm.controls).forEach((key) => {
        const control = this.stageForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/stage']);
  }
}
