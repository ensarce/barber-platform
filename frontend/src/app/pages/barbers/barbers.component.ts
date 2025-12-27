import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BarberService } from '../../core/services/barber.service';
import { BarberListItem } from '../../core/models/barber.model';

@Component({
  selector: 'app-barbers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './barbers.component.html',
  styleUrls: ['./barbers.component.css']
})
export class BarbersComponent implements OnInit {
  barbers = signal<BarberListItem[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  viewMode: 'grid' | 'list' = 'grid';
  showFilters = false;

  // Filter options
  searchQuery = '';
  selectedCity = '';
  selectedDistrict = '';

  // Pagination
  currentPage = 0;
  pageSize = 12;
  totalPages = 0;
  totalElements = 0;

  constructor(private barberService: BarberService) { }

  ngOnInit() {
    this.loadBarbers();
  }

  loadBarbers() {
    this.isLoading.set(true);
    this.error.set(null);

    this.barberService.getBarbers(
      this.selectedCity || undefined,
      this.selectedDistrict || undefined,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (response) => {
        this.barbers.set(response.content);
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Kuaförler yüklenemedi.');
        this.isLoading.set(false);
        console.error('Error loading barbers:', err);
      }
    });
  }

  toggleViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  applyFilters() {
    this.currentPage = 0;
    this.loadBarbers();
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedCity = '';
    this.selectedDistrict = '';
    this.currentPage = 0;
    this.loadBarbers();
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadBarbers();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPaginationArray(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;

    if (this.totalPages <= maxVisible) {
      for (let i = 0; i < this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 2) {
        for (let i = 0; i < 4; i++) pages.push(i);
        pages.push(-1); // Ellipsis
        pages.push(this.totalPages - 1);
      } else if (this.currentPage >= this.totalPages - 3) {
        pages.push(0);
        pages.push(-1);
        for (let i = this.totalPages - 4; i < this.totalPages; i++) pages.push(i);
      } else {
        pages.push(0);
        pages.push(-1);
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) pages.push(i);
        pages.push(-1);
        pages.push(this.totalPages - 1);
      }
    }

    return pages;
  }

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getEmptyStarArray(rating: number): number[] {
    return Array(5 - Math.floor(rating)).fill(0);
  }
}
