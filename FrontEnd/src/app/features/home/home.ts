import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Sidebar } from '../../core/components/sidebar/sidebar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Sidebar],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

  userName: string;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.userName = this.authService.getCurrentUser()?.nome ?? 'Administrador';
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
