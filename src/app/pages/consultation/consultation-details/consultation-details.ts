import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsultationService } from '../../../services/consultation.service';
import { ConsultationData } from '../../../interfaces/cosultation.interface';
import { LucideAngularModule, ArrowLeft } from 'lucide-angular';
import { HotToastService } from '@ngxpert/hot-toast';
import { splitIncludes } from '../../../utils/string.utils';
import { environment } from '../../../environment/environment';

@Component({
  selector: 'app-consultation-details',
  imports: [CommonModule, LucideAngularModule, DatePipe],
  templateUrl: './consultation-details.html',
  styleUrl: './consultation-details.css',
})
export class ConsultationDetails implements OnInit {
  consultation = signal<ConsultationData | null>(null);
  loading = signal<boolean>(true);
  protected readonly ArrowLeft = ArrowLeft;
  url = environment.imageUrl;

  // Computed signals for parsed details using string utils
  detailsArArray = computed(() => {
    const consultation = this.consultation();
    if (!consultation) return [];
    return splitIncludes(consultation.detailsAr);
  });

  detailsEnArray = computed(() => {
    const consultation = this.consultation();
    if (!consultation) return [];
    return splitIncludes(consultation.detailsEn);
  });

  // Computed signal for image URL using image utils
  imageUrl = computed(() => {
    const consultation = this.consultation();
    if (!consultation || !consultation.imagePath) {
      return 'blog/3.jpg';
    }
    // Use image URL from environment
    return this.url + consultation.imagePath;
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private consultationService: ConsultationService,
    private hotToastService: HotToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadConsultation(id);
    } else {
      this.hotToastService.error('Consultation ID not found');
      this.router.navigate(['/consultations']);
    }
  }

  loadConsultation(id: string): void {
    this.loading.set(true);
    this.consultationService.getConsultation(id).subscribe(
      (response: any) => {
        this.consultation.set(response.data || response);
        this.loading.set(false);
      },
      (error: any) => {
        this.hotToastService.error('Failed to load consultation');
        this.loading.set(false);
        this.router.navigate(['/consultations']);
      }
    );
  }

  goBack(): void {
    this.router.navigate(['/consultations']);
  }
}

