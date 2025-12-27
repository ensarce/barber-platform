# Bounded Contexts - Barber Platform

**Date:** 2025-12-26
**Phase:** DDD Phase 3

## Overview

This document defines the bounded contexts for the Barber Platform. Each bounded context represents a distinct area of the business domain with its own models, language, and responsibilities.

## Identified Bounded Contexts

### 1. Identity & Access Context

**Purpose:** Manage user accounts, authentication, and authorization

**Ubiquitous Language:**
- User: A person who can access the system
- Role: The type of user (Customer, Barber, Admin)
- Authentication: Process of verifying user identity
- Registration: Creating a new user account

**Aggregates:**
- User (root)

**Responsibilities:**
- User registration and login
- Password management
- Role-based access control
- User profile updates
- Email verification (future)

**Key Operations:**
- Register new user
- Authenticate user
- Update user profile
- Change password
- Manage user roles

**External Dependencies:**
- None (standalone context)

**Integration Points:**
- Publishes: UserRegistered, UserUpdated events
- Provides: User ID to other contexts

---

### 2. Barber Management Context

**Purpose:** Manage barber shop profiles, services, and availability

**Ubiquitous Language:**
- Barber Profile: A shop's public profile
- Service: A treatment/service offered by a barber
- Working Hours: When a barber shop is open
- Approval Status: Whether a barber can accept bookings
- Service Catalog: Collection of services offered

**Aggregates:**
- BarberProfile (root)
  - Service (child)
  - WorkingHours (child)

**Responsibilities:**
- Create and manage barber profiles
- Define services with pricing and duration
- Set working hours for each day
- Approve/reject barber applications
- Calculate availability
- Manage shop location and contact info

**Key Operations:**
- Create barber profile
- Add/update/remove services
- Set working hours
- Approve/reject profile
- Update shop details
- Calculate available time slots

**External Dependencies:**
- Identity & Access Context (requires User ID)

**Integration Points:**
- Consumes: User ID from Identity context
- Publishes: BarberProfileCreated, BarberProfileApproved, ServiceAdded events
- Provides: Barber profile data, service data, availability to Booking context

---

### 3. Booking Context

**Purpose:** Manage appointment scheduling and booking lifecycle

**Ubiquitous Language:**
- Appointment: A scheduled service booking
- Time Slot: A specific date and time window
- Booking: The act of creating an appointment
- Cancellation: Terminating a scheduled appointment
- Appointment Status: Current state (Pending, Confirmed, Cancelled, Completed)
- Conflict: Overlapping time slots

**Aggregates:**
- Appointment (root)

**Responsibilities:**
- Create appointments
- Validate time slot availability
- Check working hours conflicts
- Manage appointment lifecycle (confirm, cancel, complete)
- Enforce booking rules
- Calculate available slots

**Key Operations:**
- Book appointment
- Confirm appointment (barber)
- Cancel appointment (customer or barber)
- Complete appointment
- Get available slots for a barber
- Check time slot availability

**External Dependencies:**
- Identity & Access Context (requires Customer ID)
- Barber Management Context (requires Barber Profile ID, Service ID)

**Integration Points:**
- Consumes: User ID, Barber Profile ID, Service ID, Working Hours
- Publishes: AppointmentScheduled, AppointmentCancelled, AppointmentCompleted events
- Provides: Appointment data to Review context

---

### 4. Review & Rating Context

**Purpose:** Manage customer reviews and barber ratings

**Ubiquitous Language:**
- Review: Customer feedback for a completed appointment
- Rating: Numerical score (1-5 stars)
- Visibility: Whether a review is publicly shown
- Average Rating: Calculated rating for a barber
- Review Moderation: Hiding/showing reviews

**Aggregates:**
- Review (root)

**Responsibilities:**
- Create reviews for completed appointments
- Calculate barber ratings
- Manage review visibility
- Enforce one review per appointment rule
- Update barber profile ratings

**Key Operations:**
- Submit review
- Hide/show review
- Calculate average rating
- Get reviews for barber
- Validate review eligibility

**External Dependencies:**
- Booking Context (requires Appointment ID)
- Identity & Access Context (requires Customer ID)
- Barber Management Context (requires Barber Profile ID)

**Integration Points:**
- Consumes: Appointment ID, Customer ID, Barber Profile ID
- Publishes: ReviewSubmitted events
- Triggers: Updates to Barber Profile ratings

---

## Context Map

```
┌─────────────────────────┐
│  Identity & Access      │
│  (User Management)      │
└───────────┬─────────────┘
            │ provides User ID
            │
            ├──────────────────────────────────┬────────────────────┐
            │                                  │                    │
            ▼                                  ▼                    ▼
┌─────────────────────────┐    ┌─────────────────────────┐   ┌─────────────────────┐
│  Barber Management      │───▶│  Booking                │──▶│  Review & Rating    │
│  (Shops & Services)     │    │  (Appointments)         │   │  (Feedback)         │
└─────────────────────────┘    └─────────────────────────┘   └─────────────────────┘
      │ provides                       │ provides
      │ - Barber Profile ID            │ Appointment ID
      │ - Service ID
      │ - Working Hours
      └────────────────────────────────┘
```

## Relationships Between Contexts

### Upstream/Downstream Relationships:

1. **Identity & Access → Barber Management** (U/D)
   - Upstream: Identity & Access
   - Downstream: Barber Management
   - Pattern: Conformist (Barber Management conforms to User model)

2. **Identity & Access → Booking** (U/D)
   - Upstream: Identity & Access
   - Downstream: Booking
   - Pattern: Conformist

3. **Barber Management → Booking** (U/D)
   - Upstream: Barber Management
   - Downstream: Booking
   - Pattern: Customer/Supplier

4. **Booking → Review & Rating** (U/D)
   - Upstream: Booking
   - Downstream: Review & Rating
   - Pattern: Customer/Supplier

5. **Review & Rating → Barber Management** (Partnership)
   - Pattern: Partnership (review updates trigger rating recalculation)

## Shared Kernel

**Common Domain:**
- Value Objects (Money, Email, PhoneNumber, Address, Rating, ScheduledTimeSlot)
- Domain Events infrastructure
- Common exceptions
- Base interfaces

**Location:** `com.barber.common.domain`

These are shared across all bounded contexts as they represent fundamental business concepts.

## Anti-Corruption Layers (ACL)

Currently not needed as all contexts are internal. If integrating with external systems (payment gateway, SMS service, etc.), ACLs would be implemented to protect our domain model.

## Implementation Strategy

### Current State (Before Phase 3):
- All contexts mixed in same packages
- No clear boundaries
- Direct entity references across contexts

### Target State (After Phase 3):
- Each context in separate package structure
- Contexts reference each other by ID only
- Domain events for cross-context communication
- Application services as context entry points

### Package Structure (Proposed):

```
com.barber/
├── common/
│   ├── domain/
│   │   ├── valueobject/
│   │   └── event/
│   └── infrastructure/
│
├── identity/
│   ├── domain/
│   │   ├── model/        (User aggregate)
│   │   └── service/      (Domain services)
│   ├── application/      (Use cases)
│   ├── infrastructure/   (JPA repositories)
│   └── api/             (REST controllers)
│
├── barbershop/
│   ├── domain/
│   │   ├── model/        (BarberProfile, Service, WorkingHours)
│   │   └── service/      (Domain services)
│   ├── application/
│   ├── infrastructure/
│   └── api/
│
├── booking/
│   ├── domain/
│   │   ├── model/        (Appointment)
│   │   └── service/      (Availability checking)
│   ├── application/
│   ├── infrastructure/
│   └── api/
│
└── review/
    ├── domain/
    │   ├── model/        (Review)
    │   └── service/      (Rating calculation)
    ├── application/
    ├── infrastructure/
    └── api/
```

## Benefits of This Structure

1. **Clear Boundaries:** Each context has its own package and responsibilities
2. **Independent Evolution:** Contexts can evolve independently
3. **Team Organization:** Different teams can own different contexts
4. **Testability:** Each context can be tested in isolation
5. **Scalability:** Contexts could become microservices in the future

## Next Steps

1. Create the new package structure
2. Move entities to their respective contexts
3. Create application services for each context
4. Implement domain event publishing
5. Update controllers to use application services
6. Add integration tests for context boundaries

---

**Status:** 📋 **PLANNED**
**Ready for Implementation:** Yes
