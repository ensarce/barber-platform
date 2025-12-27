package com.barber.common.domain.valueobject;

import lombok.EqualsAndHashCode;
import lombok.Getter;

import java.util.regex.Pattern;

/**
 * VALUE OBJECT: PhoneNumber
 *
 * Represents a valid phone number (Turkish format).
 * Immutable and self-validating.
 *
 * Benefits:
 * - Ensures valid phone number format
 * - Normalizes phone number representation
 * - Type-safe: Cannot accidentally use invalid phone strings
 * - Encapsulates phone number formatting logic
 */
@Getter
@EqualsAndHashCode
public class PhoneNumber {

    // Turkish phone number pattern: +90 (5XX) XXX XX XX or variations
    private static final Pattern TURKISH_MOBILE_PATTERN = Pattern.compile(
        "^(\\+90|0)?\\s*5\\d{2}\\s*\\d{3}\\s*\\d{2}\\s*\\d{2}$"
    );

    private final String value; // Normalized format: +905XXXXXXXXX

    /**
     * Create a PhoneNumber
     *
     * @param value Phone number string (various formats accepted)
     * @throws IllegalArgumentException if phone number format is invalid
     */
    public PhoneNumber(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Phone number cannot be null or blank");
        }

        // Remove all whitespace, dashes, parentheses, etc.
        String cleaned = value.replaceAll("[\\s\\-().]", "");

        // Validate and normalize
        String normalized = normalize(cleaned);

        if (!isValidTurkishMobile(normalized)) {
            throw new IllegalArgumentException("Invalid Turkish phone number format: " + value);
        }

        this.value = normalized;
    }

    /**
     * Create PhoneNumber from string
     */
    public static PhoneNumber of(String value) {
        return new PhoneNumber(value);
    }

    /**
     * Normalize phone number to +905XXXXXXXXX format
     */
    private String normalize(String cleaned) {
        // Already in +90 format
        if (cleaned.startsWith("+90")) {
            return cleaned;
        }

        // Starts with 90 (add +)
        if (cleaned.startsWith("90") && cleaned.length() == 12) {
            return "+" + cleaned;
        }

        // Starts with 0 (replace with +90)
        if (cleaned.startsWith("0") && cleaned.length() == 11) {
            return "+90" + cleaned.substring(1);
        }

        // Starts with 5 (add +90)
        if (cleaned.startsWith("5") && cleaned.length() == 10) {
            return "+90" + cleaned;
        }

        // Return as-is and let validation fail
        return cleaned;
    }

    /**
     * Validate Turkish mobile number
     */
    private boolean isValidTurkishMobile(String normalized) {
        // Must be exactly 13 characters: +905XXXXXXXXX
        if (normalized.length() != 13) {
            return false;
        }

        // Must start with +90
        if (!normalized.startsWith("+90")) {
            return false;
        }

        // Fourth digit must be 5 (mobile numbers in Turkey start with 5)
        if (normalized.charAt(3) != '5') {
            return false;
        }

        // All remaining characters must be digits
        String digits = normalized.substring(3);
        return digits.matches("\\d{10}");
    }

    /**
     * Get phone number without country code (05XXXXXXXXX)
     */
    public String getWithoutCountryCode() {
        return "0" + value.substring(3);
    }

    /**
     * Get formatted phone number: +90 (5XX) XXX XX XX
     */
    public String getFormatted() {
        String digits = value.substring(3); // Remove +90
        return String.format("+90 (%s) %s %s %s",
            digits.substring(0, 3),
            digits.substring(3, 6),
            digits.substring(6, 8),
            digits.substring(8, 10)
        );
    }

    /**
     * Get compact format: +905XXXXXXXXX
     */
    public String getCompact() {
        return value;
    }

    /**
     * Get masked phone number for privacy: +90 (5XX) *** ** XX
     */
    public String getMasked() {
        String digits = value.substring(3);
        return String.format("+90 (%s) *** ** %s",
            digits.substring(0, 3),
            digits.substring(8, 10)
        );
    }

    /**
     * Get operator code (second and third digits after 5)
     *
     * Turkish mobile operators:
     * 50X - Turkcell
     * 51X, 52X - Turkcell
     * 53X - Turkcell
     * 54X - Vodafone
     * 55X - Türk Telekom
     * 59X - Türk Telekom
     */
    public String getOperatorCode() {
        return value.substring(3, 6); // Returns 5XX
    }

    /**
     * Get likely operator name (informational only)
     */
    public String getOperatorName() {
        String code = getOperatorCode();

        if (code.matches("50[0-9]|51[0-9]|52[0-9]|53[0-9]")) {
            return "Turkcell";
        } else if (code.matches("54[0-9]")) {
            return "Vodafone";
        } else if (code.matches("55[0-9]|59[0-9]")) {
            return "Türk Telekom";
        }

        return "Unknown";
    }

    /**
     * Check if same phone number (ignoring format differences)
     */
    public boolean isSameAs(PhoneNumber other) {
        return this.value.equals(other.value);
    }

    @Override
    public String toString() {
        return getFormatted();
    }
}
