import { Component } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    console.log(this.loginForm.value);

    this.authService.login(this.loginForm.value.email!, this.loginForm.value.password!).subscribe({
      next: (response: any) => {
        console.log(response);
        // Token is already stored by the auth service
        this.hotToastService.success('Login successful!');
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.log(error);
        this.hotToastService.error(error.error?.message || 'Login failed. Please try again.');
      },
    });
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private hotToastService: HotToastService
  ) {}
}
