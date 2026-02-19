import {
  Component,
  inject,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { FooterActions } from './store/footer.actions';
import { selectFooterData } from './store/footer.selectors';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface FooterLink {
  label: string;
  url: string;
  external?: boolean;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface FooterData {
  sections: FooterSection[];
  socialLinks: SocialLink[];
  contactInfo: {
    address: string;
    phone: string;
    email: string;
    hours: string;
  };
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  private store = inject(Store);
  private sanitizer = inject(DomSanitizer);

  @ViewChild('emailInput') emailInput!: ElementRef<HTMLInputElement>;

  footerData$: Observable<FooterData | null>;
  currentYear = new Date().getFullYear();

  constructor() {
    this.footerData$ = this.store.select(selectFooterData);
  }

  ngOnInit(): void {
    this.store.dispatch(FooterActions.loadFooterData());
  }

  sanitizeIcon(icon: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(icon);
  }

  // Obfuscate email to prevent spam harvesting
  getEmailLink(): string {
    const parts = ['info', 'solarni-paneli', 'hr'];
    return 'mailto:' + parts[0] + '@' + parts[1] + '.' + parts[2];
  }
}
