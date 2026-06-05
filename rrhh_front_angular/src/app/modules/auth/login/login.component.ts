import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  // Precargado con el usuario semilla (V3__insert_seed_data.sql) para pruebas.
  form = this.fb.group({
    username: ['admin', Validators.required],
    password: ['password123', Validators.required],
  });
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { username, password } = this.form.value;
    this.auth.login(username!, password!).subscribe({
      next: () => {
        const ret = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(ret);
      },
      error: (e) => {
        this.loading = false;
        this.error =
          e.status === 401
            ? 'Credenciales inválidas.'
            : e.status === 0
            ? 'No se pudo conectar al backend (¿está corriendo en localhost:8080?).'
            : 'Ocurrió un error al iniciar sesión.';
      },
    });
  }
}
