import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { SupabaseService } from '../../../../services/supabase.service';
import { AdminFormComponent } from '../../shared/admin-form/admin-form.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminFormComponent, TranslatePipe],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private supabaseService = inject(SupabaseService);
  private titleService = inject(Title);

  userForm!: FormGroup;
  loading = false;
  isEditMode = false;
  userId: string | null = null;

  constructor() {
    this.userForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      avatar_url: [''],
      role: ['', Validators.required],
      date_of_birth: [''],
      bio: [''],
      street_address: [''],
      city: [''],
      state: [''],
      postal_code: [''],
      country: ['']
    });
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.isEditMode = true;
      this.userId = userId;
      this.loadUser();
    }

    // Set page title
    this.titleService.setTitle(this.isEditMode ? 'Edit User - Solar Shop Admin' : 'Create User - Solar Shop Admin');
  }

  private async loadUser(): Promise<void> {
    if (!this.userId) return;

    try {
      const data = await this.supabaseService.getTableById('profiles', this.userId);
      if (data) {
        this.userForm.patchValue(data);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }

  async onSave(): Promise<void> {
    if (this.userForm.invalid) return;

    this.loading = true;

    try {
      const formData = this.userForm.value;

      if (this.isEditMode && this.userId) {
        await this.supabaseService.updateRecord('profiles', this.userId, formData);
        alert('User updated successfully');
      } else {
        await this.supabaseService.createRecord('profiles', formData);
        alert('User created successfully');
      }

      this.router.navigate(['/admin/users']);
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error saving user');
    } finally {
      this.loading = false;
    }
  }
} 