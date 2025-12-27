package com.barber.config;

import com.barber.entity.*;
import com.barber.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final UserRepository userRepository;
    private final BarberProfileRepository barberProfileRepository;
    private final ServiceRepository serviceRepository;
    private final WorkingHoursRepository workingHoursRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${ADMIN_PASSWORD:#{null}}")
    private String adminPassword;

    @Bean
    CommandLineRunner initData() {
        return args -> {
            // Create default admin if not exists (requires ADMIN_PASSWORD env variable)
            if (!userRepository.existsByEmail("admin@barber.com")) {
                if (adminPassword == null || adminPassword.isEmpty()) {
                    log.error("❌ ADMIN_PASSWORD environment variable is required to create admin user");
                    throw new IllegalStateException("ADMIN_PASSWORD environment variable must be set");
                }

                User admin = User.builder()
                    .name("Admin")
                    .email("admin@barber.com")
                    .passwordHash(passwordEncoder.encode(adminPassword))
                    .role(Role.ADMIN)
                    .build();
                userRepository.save(admin);
                log.info("✅ Admin user created: admin@barber.com");
            }
            
            log.info("✅ Admin initialization completed");
        };
    }

    @Bean
    @Profile("dev")
    CommandLineRunner initTestData() {
        return args -> {
            log.info("🔧 Running in DEVELOPMENT mode - Creating test data...");

            // Create sample customers
            createCustomerIfNotExists("Ahmet Yılmaz", "ahmet@test.com", "5551234567");
            createCustomerIfNotExists("Mehmet Demir", "mehmet@test.com", "5552345678");
            createCustomerIfNotExists("Ali Kaya", "ali@test.com", "5553456789");

            // Create sample barbers with profiles
            createBarberIfNotExists(
                "Mustafa Berber", "mustafa@barber.com", "5554567890",
                "Elite Kuaför", "Profesyonel erkek kuaförü, 15 yıllık deneyim",
                "İstanbul", "Kadıköy", "Moda Caddesi No:45"
            );

            createBarberIfNotExists(
                "Hasan Usta", "hasan@barber.com", "5555678901",
                "Gentleman's Club", "Modern ve klasik kesimler, sakal bıyık uzmanı",
                "İstanbul", "Beşiktaş", "Barbaros Bulvarı No:78"
            );

            createBarberIfNotExists(
                "Kemal Tıraş", "kemal@barber.com", "5556789012",
                "Style Studio", "Trend kesimler ve saç bakımı",
                "Ankara", "Çankaya", "Tunalı Hilmi Caddesi No:120"
            );

            log.info("✅ Test data initialization completed!");
            log.info("📧 Test users created - Check application documentation for login details");
        };
    }
    
    private void createCustomerIfNotExists(String name, String email, String phone) {
        if (!userRepository.existsByEmail(email)) {
            // Use simple password for development only
            String devPassword = System.getenv("DEV_TEST_PASSWORD");
            if (devPassword == null || devPassword.isEmpty()) {
                devPassword = "TestPass123!"; // Fallback for dev environment
            }

            User customer = User.builder()
                .name(name)
                .email(email)
                .phone(phone)
                .passwordHash(passwordEncoder.encode(devPassword))
                .role(Role.CUSTOMER)
                .build();
            userRepository.save(customer);
            log.debug("Created customer: {} / {}", name, email);
        }
    }
    
    private void createBarberIfNotExists(String name, String email, String phone,
                                         String shopName, String description,
                                         String city, String district, String address) {
        if (!userRepository.existsByEmail(email)) {
            // Use simple password for development only
            String devPassword = System.getenv("DEV_TEST_PASSWORD");
            if (devPassword == null || devPassword.isEmpty()) {
                devPassword = "TestPass123!"; // Fallback for dev environment
            }

            // Create user
            User barberUser = User.builder()
                .name(name)
                .email(email)
                .phone(phone)
                .passwordHash(passwordEncoder.encode(devPassword))
                .role(Role.BARBER)
                .build();
            barberUser = userRepository.save(barberUser);
            
            // Create profile (APPROVED for demo purposes)
            BarberProfile profile = BarberProfile.builder()
                .user(barberUser)
                .shopName(shopName)
                .description(description)
                .city(city)
                .district(district)
                .address(address)
                .status(BarberStatus.APPROVED)
                .averageRating(4.5)
                .totalReviews(0)
                .build();
            profile = barberProfileRepository.save(profile);
            
            // Create services
            createService(profile, "Saç Kesimi", "Klasik erkek saç kesimi", 30, 150);
            createService(profile, "Sakal Tıraşı", "Ustura ile profesyonel tıraş", 20, 100);
            createService(profile, "Saç + Sakal", "Komple bakım paketi", 45, 220);
            
            // Create working hours (Mon-Sat 09:00-19:00, Sunday closed)
            createWorkingHours(profile);

            log.debug("Created barber: {} - {} / {}", shopName, name, email);
        }
    }
    
    private void createService(BarberProfile profile, String name, String description, int duration, double price) {
        com.barber.entity.Service service = com.barber.entity.Service.builder()
            .barberProfile(profile)
            .name(name)
            .description(description)
            .durationMinutes(duration)
            .price(BigDecimal.valueOf(price))
            .isActive(true)
            .build();
        serviceRepository.save(service);
    }
    
    private void createWorkingHours(BarberProfile profile) {
        for (DayOfWeek day : DayOfWeek.values()) {
            boolean isClosed = (day == DayOfWeek.SUNDAY);
            WorkingHours wh = WorkingHours.builder()
                .barberProfile(profile)
                .dayOfWeek(day)
                .startTime(isClosed ? null : LocalTime.of(9, 0))
                .endTime(isClosed ? null : LocalTime.of(19, 0))
                .isClosed(isClosed)
                .build();
            workingHoursRepository.save(wh);
        }
    }
}
