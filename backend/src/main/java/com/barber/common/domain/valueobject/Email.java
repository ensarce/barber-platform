package com.barber.common.domain.valueobject;

import lombok.EqualsAndHashCode;
import lombok.Getter;

import java.util.regex.Pattern;

/**
 * VALUE OBJECT: Email
 *
 * Represents a valid email address.
 * Immutable and self-validating.
 *
 * Benefits:
 * - Ensures valid email format
 * - Type-safe: Cannot accidentally use invalid email strings
 * - Encapsulates email-related operations
 * - Prevents primitive obsession
 */
@Getter
@EqualsAndHashCode
public class Email {

    // Simple email validation pattern
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );

    private final String value;

    /**
     * Create an Email
     *
     * @param value Email address (must be valid format)
     * @throws IllegalArgumentException if email format is invalid
     */
    public Email(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be null or blank");
        }

        String normalized = value.trim().toLowerCase();

        if (!EMAIL_PATTERN.matcher(normalized).matches()) {
            throw new IllegalArgumentException("Invalid email format: " + value);
        }

        this.value = normalized;
    }

    /**
     * Create Email from string
     */
    public static Email of(String value) {
        return new Email(value);
    }

    /**
     * Get the local part of the email (before @)
     *
     * @return Local part (e.g., "user" from "user@example.com")
     */
    public String getLocalPart() {
        int atIndex = value.indexOf('@');
        return value.substring(0, atIndex);
    }

    /**
     * Get the domain part of the email (after @)
     *
     * @return Domain part (e.g., "example.com" from "user@example.com")
     */
    public String getDomain() {
        int atIndex = value.indexOf('@');
        return value.substring(atIndex + 1);
    }

    /**
     * Check if email is from a specific domain
     *
     * @param domain The domain to check (case-insensitive)
     * @return true if email is from the specified domain
     */
    public boolean isFromDomain(String domain) {
        if (domain == null) {
            return false;
        }
        return getDomain().equalsIgnoreCase(domain.trim());
    }

    /**
     * Check if email appears to be a temporary/disposable email
     * (Basic check - could be expanded)
     */
    public boolean isDisposable() {
        String[] disposableDomains = {
            "tempmail.com", "throwaway.email", "guerrillamail.com",
            "10minutemail.com", "mailinator.com", "temp-mail.org"
        };

        String domain = getDomain();
        for (String disposable : disposableDomains) {
            if (domain.equalsIgnoreCase(disposable)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Mask email for privacy (e.g., "u***r@example.com")
     *
     * @return Masked email string
     */
    public String masked() {
        String local = getLocalPart();
        String domain = getDomain();

        if (local.length() <= 2) {
            return local.charAt(0) + "***@" + domain;
        }

        return local.charAt(0) + "***" + local.charAt(local.length() - 1) + "@" + domain;
    }

    @Override
    public String toString() {
        return value;
    }
}
