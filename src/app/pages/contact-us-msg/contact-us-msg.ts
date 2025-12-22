import { Component, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { LucideAngularModule, Eye, Mail, User, Calendar, MessageSquare } from 'lucide-angular';
import { ContactUsMsgService } from '../../services/contact-us-msg.service';
import { HotToastService } from '@ngxpert/hot-toast';

interface ContactUsMessage {
  id: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  message?: string;
  createdOn?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-contact-us-msg',
  imports: [CommonModule, TableModule, DialogModule, LucideAngularModule],
  templateUrl: './contact-us-msg.html',
  styleUrl: './contact-us-msg.css',
})
export class ContactUsMsg {
  messages = signal<ContactUsMessage[]>([]);
  selectedMessage: ContactUsMessage | null = null;
  detailsDialogVisible = false;
  loading = signal<boolean>(true);

  protected readonly Eye = Eye;
  protected readonly Mail = Mail;
  protected readonly User = User;
  protected readonly Calendar = Calendar;
  protected readonly MessageSquare = MessageSquare;

  constructor(
    private contactUsMsgService: ContactUsMsgService,
    private cdr: ChangeDetectorRef,
    private hotToastService: HotToastService
  ) {
    this.loadMessages();
  }

  loadMessages(): void {
    this.loading.set(true);
    this.contactUsMsgService.getContactUsMessages().subscribe(
      (response: any) => {
        // Handle different response structures
        const messages = response.data || response || [];
        this.messages.set(messages);
        this.loading.set(false);
        this.cdr.detectChanges();
      },
      (error) => {
        this.hotToastService.error('Failed to load contact us messages');
        this.loading.set(false);
        this.cdr.detectChanges();
      }
    );
  }

  viewMessage(message: ContactUsMessage): void {
    this.selectedMessage = message;
    this.detailsDialogVisible = true;
  }

  closeDetailsDialog(): void {
    this.detailsDialogVisible = false;
    this.selectedMessage = null;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  }
}
