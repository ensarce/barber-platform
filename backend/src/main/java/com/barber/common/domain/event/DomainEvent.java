package com.barber.common.domain.event;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * BASE INTERFACE: DomainEvent
 *
 * Marker interface for all domain events.
 * Domain events represent something significant that happened in the domain.
 *
 * Benefits:
 * - Enables eventual consistency across aggregates
 * - Provides integration points for other bounded contexts
 * - Creates audit trail of domain changes
 * - Enables event-driven architecture
 *
 * Design Principles:
 * - Events are immutable (past tense names)
 * - Events represent business-relevant facts
 * - Events should contain all necessary data (no lazy loading)
 */
public interface DomainEvent {

    /**
     * Get the unique identifier of this event
     *
     * @return Event ID
     */
    default String getEventId() {
        return UUID.randomUUID().toString();
    }

    /**
     * Get when this event occurred
     *
     * @return Event timestamp
     */
    LocalDateTime occurredOn();

    /**
     * Get the event type (class name by default)
     *
     * @return Event type identifier
     */
    default String getEventType() {
        return this.getClass().getSimpleName();
    }
}
