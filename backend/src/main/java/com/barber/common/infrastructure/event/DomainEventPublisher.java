package com.barber.common.infrastructure.event;

import com.barber.common.domain.event.DomainEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import java.util.Collection;

/**
 * INFRASTRUCTURE: DomainEventPublisher
 *
 * Publishes domain events using Spring's ApplicationEventPublisher.
 * This is the bridge between the domain layer and Spring's event infrastructure.
 *
 * Usage:
 * 1. Domain aggregates collect events (using registerEvent() pattern)
 * 2. Application services pull events from aggregates after persistence
 * 3. Application services use this publisher to publish events
 * 4. Event handlers (@EventListener) react to published events
 *
 * Benefits:
 * - Decouples domain from infrastructure
 * - Synchronous event handling within same transaction
 * - Can be extended for asynchronous/external event publishing
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DomainEventPublisher {

    private final ApplicationEventPublisher applicationEventPublisher;

    /**
     * Publish a single domain event
     *
     * @param event The domain event to publish
     */
    public void publish(DomainEvent event) {
        if (event == null) {
            log.warn("Attempted to publish null event");
            return;
        }

        log.debug("Publishing domain event: {} - {}", event.getEventType(), event);
        applicationEventPublisher.publishEvent(event);
        log.debug("Successfully published: {}", event.getEventType());
    }

    /**
     * Publish multiple domain events
     *
     * @param events Collection of domain events to publish
     */
    public void publishAll(Collection<DomainEvent> events) {
        if (events == null || events.isEmpty()) {
            return;
        }

        log.debug("Publishing {} domain events", events.size());

        for (DomainEvent event : events) {
            publish(event);
        }

        log.debug("Successfully published {} events", events.size());
    }
}
