package com.barber.common.domain.valueobject;

import lombok.EqualsAndHashCode;
import lombok.Getter;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Currency;

/**
 * VALUE OBJECT: Money
 *
 * Represents a monetary amount with currency.
 * Immutable and self-validating.
 *
 * Benefits:
 * - Type safety: Cannot accidentally add incompatible currencies
 * - Validation: No negative amounts
 * - Business operations: Discount, multiply, add encapsulated
 * - Immutability: Thread-safe and prevents accidental mutation
 */
@Getter
@EqualsAndHashCode
public class Money {

    public static final Currency TRY = Currency.getInstance("TRY");
    public static final Money ZERO_TRY = new Money(BigDecimal.ZERO, TRY);

    private final BigDecimal amount;
    private final Currency currency;

    /**
     * Create a Money instance
     *
     * @param amount The monetary amount (cannot be null or negative)
     * @param currency The currency (cannot be null)
     * @throws IllegalArgumentException if validation fails
     */
    public Money(BigDecimal amount, Currency currency) {
        if (amount == null) {
            throw new IllegalArgumentException("Amount cannot be null");
        }
        if (currency == null) {
            throw new IllegalArgumentException("Currency cannot be null");
        }
        if (amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Amount cannot be negative: " + amount);
        }

        this.amount = amount.setScale(2, RoundingMode.HALF_UP);
        this.currency = currency;
    }

    /**
     * Create Money from double value
     */
    public static Money of(double amount, Currency currency) {
        return new Money(BigDecimal.valueOf(amount), currency);
    }

    /**
     * Create Turkish Lira money
     */
    public static Money try$(double amount) {
        return new Money(BigDecimal.valueOf(amount), TRY);
    }

    /**
     * Create Turkish Lira money from BigDecimal
     */
    public static Money try$(BigDecimal amount) {
        return new Money(amount, TRY);
    }

    /**
     * Add two money amounts (must be same currency)
     *
     * @param other The money to add
     * @return New Money instance with sum
     * @throws IllegalArgumentException if currencies don't match
     */
    public Money add(Money other) {
        ensureSameCurrency(other);
        return new Money(this.amount.add(other.amount), this.currency);
    }

    /**
     * Subtract money amount
     *
     * @param other The money to subtract
     * @return New Money instance with difference
     * @throws IllegalArgumentException if currencies don't match
     * @throws ArithmeticException if result would be negative
     */
    public Money subtract(Money other) {
        ensureSameCurrency(other);
        BigDecimal result = this.amount.subtract(other.amount);
        if (result.compareTo(BigDecimal.ZERO) < 0) {
            throw new ArithmeticException("Subtraction would result in negative amount");
        }
        return new Money(result, this.currency);
    }

    /**
     * Multiply by a factor
     *
     * @param factor The multiplication factor (cannot be negative)
     * @return New Money instance
     */
    public Money multiply(int factor) {
        if (factor < 0) {
            throw new IllegalArgumentException("Factor cannot be negative");
        }
        return new Money(this.amount.multiply(BigDecimal.valueOf(factor)), this.currency);
    }

    /**
     * Multiply by a decimal factor
     *
     * @param factor The multiplication factor (cannot be negative)
     * @return New Money instance
     */
    public Money multiply(BigDecimal factor) {
        if (factor.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Factor cannot be negative");
        }
        return new Money(this.amount.multiply(factor), this.currency);
    }

    /**
     * Apply discount percentage
     *
     * @param percentDiscount Discount percentage (0-100)
     * @return New Money instance with discount applied
     */
    public Money applyDiscount(int percentDiscount) {
        if (percentDiscount < 0 || percentDiscount > 100) {
            throw new IllegalArgumentException("Discount must be between 0 and 100");
        }
        BigDecimal multiplier = BigDecimal.valueOf(100 - percentDiscount)
            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        return new Money(this.amount.multiply(multiplier), this.currency);
    }

    /**
     * Check if greater than another amount
     */
    public boolean isGreaterThan(Money other) {
        ensureSameCurrency(other);
        return this.amount.compareTo(other.amount) > 0;
    }

    /**
     * Check if less than another amount
     */
    public boolean isLessThan(Money other) {
        ensureSameCurrency(other);
        return this.amount.compareTo(other.amount) < 0;
    }

    /**
     * Check if equal to another amount
     */
    public boolean isEqualTo(Money other) {
        ensureSameCurrency(other);
        return this.amount.compareTo(other.amount) == 0;
    }

    /**
     * Check if zero
     */
    public boolean isZero() {
        return this.amount.compareTo(BigDecimal.ZERO) == 0;
    }

    /**
     * Check if positive (greater than zero)
     */
    public boolean isPositive() {
        return this.amount.compareTo(BigDecimal.ZERO) > 0;
    }

    /**
     * Ensure same currency for operations
     */
    private void ensureSameCurrency(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new IllegalArgumentException(
                String.format("Cannot operate on different currencies: %s and %s",
                    this.currency.getCurrencyCode(), other.currency.getCurrencyCode())
            );
        }
    }

    @Override
    public String toString() {
        return String.format("%s %s", amount, currency.getCurrencyCode());
    }
}
