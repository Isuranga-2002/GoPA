import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

interface SummaryCard {
  title: string;
  value: string;
  description: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  // Mock student data
  studentData = {
    name: 'John Doe',
    indexNumber: 'SE/2021/001',
    cumulativeGPA: 3.45,
    degreeClass: 'Second Class Upper',
    repeatSubjects: 2,
    medicalAbsentSubjects: 1,
    earnedCredits: 96,
    totalCredits: 120,
    resultsStatus: 'Results fully published'
  };

  // Navigation menu items
  menuItems = [
    { path: '/dashboard', label: 'Overview', active: true },
    { path: '/dashboard/results', label: 'Results', active: false },
    { path: '/dashboard/year-wise-gpa', label: 'Year-wise GPA', active: false },
    { path: '/dashboard/repeats', label: 'Medicals & Repeats', active: false },
    { path: '/dashboard/profile', label: 'Profile', active: false },
    { path: '#', label: 'Analytics', active: false, disabled: true },
    { path: '#', label: 'Download Report', active: false, disabled: true }
  ];

  // Summary cards data
  summaryCards: SummaryCard[] = [
    {
      title: 'Current CGPA',
      value: this.studentData.cumulativeGPA.toFixed(2),
      description: 'Overall Performance',
      color: 'primary'
    },
    {
      title: 'Cumulative GPA',
      value: this.studentData.cumulativeGPA.toFixed(3),
      description: 'Detailed GPA Analysis',
      color: 'primary'
    },
    {
      title: 'Degree Class',
      value: this.studentData.degreeClass,
      description: 'Current Classification',
      color: 'success'
    },
    {
      title: 'Earned Credits',
      value: `${this.studentData.earnedCredits}/${this.studentData.totalCredits}`,
      description: 'Credits Completed',
      color: 'success'
    },
    {
      title: 'Repeat Subjects',
      value: this.studentData.repeatSubjects.toString(),
      description: 'Subjects to Repeat',
      color: 'warning'
    },
    {
      title: 'Medical/Absent',
      value: this.studentData.medicalAbsentSubjects.toString(),
      description: 'Medical Cases',
      color: 'info'
    }
  ];

  // Mobile menu state
  isMobileMenuOpen = false;

  constructor(private router: Router) {}

  // Navigation methods
  navigateTo(path: string): void {
    if (path !== '#') {
      this.updateActiveMenuItem(path);
      this.router.navigate([path]);
      this.closeMobileMenu();
    }
  }

  updateActiveMenuItem(path: string): void {
    this.menuItems.forEach(item => {
      item.active = item.path === path;
    });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  logout(): void {
    // TODO: Implement logout logic with backend API
    console.log('Logout clicked');
    this.router.navigate(['/auth/login']);
  }

  // Utility methods
  getCardColorClass(color: string): string {
    const colorMap: { [key: string]: string } = {
      'primary': 'card-primary',
      'success': 'card-success',
      'warning': 'card-warning',
      'info': 'card-info'
    };
    return colorMap[color] || 'card-primary';
  }

  getCardIconClass(color: string): string {
    const iconMap: { [key: string]: string } = {
      'primary': 'icon-primary',
      'success': 'icon-success',
      'warning': 'icon-warning',
      'info': 'icon-info'
    };
    return iconMap[color] || 'icon-primary';
  }
}
