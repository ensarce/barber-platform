import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface Barber {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  image: string;
  location: string;
}

interface Service {
  name: string;
  price: string;
  duration: string;
  icon: string;
}

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
  image: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  features: Feature[] = [
    {
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      title: 'Kolay Randevu',
      description: 'İstediğiniz kuaför ve saate kolayca randevu alın'
    },
    {
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      title: 'En İyi Fiyatlar',
      description: 'Şeffaf fiyatlandırma, uygun kampanyalar'
    },
    {
      icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
      title: 'Güvenilir Yorumlar',
      description: 'Gerçek müşteri değerlendirmeleri ile doğru seçim yapın'
    },
    {
      icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
      title: 'Mobil Uygulama',
      description: 'İster web ister mobil, her yerden erişim'
    }
  ];

  featuredBarbers: Barber[] = [
    {
      id: 1,
      name: 'Ahmet Yılmaz',
      specialty: 'Klasik Kesim Uzmanı',
      rating: 4.9,
      reviewCount: 127,
      image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400',
      location: 'Kadıköy, İstanbul'
    },
    {
      id: 2,
      name: 'Mehmet Demir',
      specialty: 'Modern Styling',
      rating: 4.8,
      reviewCount: 95,
      image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400',
      location: 'Beşiktaş, İstanbul'
    },
    {
      id: 3,
      name: 'Can Özkan',
      specialty: 'Sakal Tasarımı',
      rating: 5.0,
      reviewCount: 156,
      image: 'https://images.unsplash.com/photo-1598511726623-d2e9996892f6?w=400',
      location: 'Şişli, İstanbul'
    }
  ];

  services: Service[] = [
    {
      name: 'Klasik Saç Kesimi',
      price: '150-300₺',
      duration: '45 dk',
      icon: 'M15 19l-7-7 7-7'
    },
    {
      name: 'Sakal Traşı & Bakımı',
      price: '100-200₺',
      duration: '30 dk',
      icon: 'M9 12l2 2 4-4'
    },
    {
      name: 'Cilt Bakımı',
      price: '200-400₺',
      duration: '60 dk',
      icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'
    },
    {
      name: 'Özel Gün Paketi',
      price: '500-800₺',
      duration: '120 dk',
      icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'
    }
  ];

  testimonials: Testimonial[] = [
    {
      name: 'Emre Kaya',
      role: 'Yazılım Geliştirici',
      content: 'BarberHub sayesinde işime en yakın kuaförü buldum. Randevu sistemi harika çalışıyor!',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
    },
    {
      name: 'Burak Çelik',
      role: 'Girişimci',
      content: 'Yıllardır aradığım profesyonel kuaförü bu platform sayesinde buldum. Kesinlikle tavsiye ederim.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'
    },
    {
      name: 'Murat Arslan',
      role: 'Öğretmen',
      content: 'Çok pratik bir uygulama. Artık randevu almak için saatlerce beklemiyorum.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100'
    }
  ];

  stats = [
    { value: '10,000+', label: 'Mutlu Müşteri' },
    { value: '500+', label: 'Profesyonel Kuaför' },
    { value: '50+', label: 'Şehir' },
    { value: '4.9', label: 'Ortalama Puan' }
  ];

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }
}
