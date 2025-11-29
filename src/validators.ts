/**
 * Built-in validators for Discord Conversation Wizard
 * 
 * @module validators
 */

/**
 * Validator function type - returns true if valid, or an error message string if invalid
 */
export type ValidatorFunction = (value: unknown) => boolean | string | Promise<boolean | string>;

/**
 * Options for the email validator
 */
export interface EmailValidatorOptions {
    /** Custom error message */
    message?: string;
    /** Allow plus addressing (e.g., user+tag@example.com) */
    allowPlusAddressing?: boolean;
}

/**
 * Options for the URL validator
 */
export interface URLValidatorOptions {
    /** Custom error message */
    message?: string;
    /** Allowed protocols (default: ['http', 'https']) */
    protocols?: string[];
    /** Require protocol to be present */
    requireProtocol?: boolean;
}

/**
 * Options for the phone validator
 */
export interface PhoneValidatorOptions {
    /** Custom error message */
    message?: string;
    /** Country code (e.g., 'US', 'ES', 'GB') */
    country?: string;
}

/**
 * Options for the regex validator
 */
export interface RegexValidatorOptions {
    /** Custom error message */
    message?: string;
    /** Regex flags (e.g., 'i' for case-insensitive) */
    flags?: string;
}

/**
 * Options for the length validator
 */
export interface LengthValidatorOptions {
    /** Minimum length */
    min?: number;
    /** Maximum length */
    max?: number;
    /** Custom error message */
    message?: string;
}

/**
 * Options for the range validator
 */
export interface RangeValidatorOptions {
    /** Minimum value */
    min?: number;
    /** Maximum value */
    max?: number;
    /** Custom error message */
    message?: string;
}

/**
 * Options for the date validator
 */
export interface DateValidatorOptions {
    /** Custom error message */
    message?: string;
    /** Minimum date */
    min?: Date;
    /** Maximum date */
    max?: Date;
}

/**
 * Validates email addresses using RFC 5322 compliant regex
 * 
 * @param options - Email validator options
 * @returns Validator function
 */
export function email(options: EmailValidatorOptions = {}): ValidatorFunction {
    const defaultMessage = 'Please enter a valid email address';
    const message = options.message || defaultMessage;

    // RFC 5322 simplified email regex
    const emailRegex = options.allowPlusAddressing
        ? /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
        : /^[a-zA-Z0-9.!#$%&'*\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    return (value: unknown): boolean | string => {
        if (typeof value !== 'string') {
            return message;
        }

        const trimmedValue = value.trim().toLowerCase();

        if (!emailRegex.test(trimmedValue)) {
            return message;
        }

        // Additional validation: check for common typos
        const domain = trimmedValue.split('@')[1];
        if (domain && domain.startsWith('.')) {
            return message;
        }

        return true;
    };
}

/**
 * Validates URLs with customizable protocol requirements
 * 
 * @param options - URL validator options
 * @returns Validator function
 */
export function url(options: URLValidatorOptions = {}): ValidatorFunction {
    const defaultMessage = 'Please enter a valid URL';
    const message = options.message || defaultMessage;
    const protocols = options.protocols || ['http', 'https'];
    const requireProtocol = options.requireProtocol ?? true;

    return (value: unknown): boolean | string => {
        if (typeof value !== 'string') {
            return message;
        }

        let urlString = value.trim();

        // Add protocol if not required and missing
        if (!requireProtocol && !urlString.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:/)) {
            urlString = 'https://' + urlString;
        }

        try {
            const parsedUrl = new URL(urlString);

            // Check if protocol is allowed
            const protocol = parsedUrl.protocol.slice(0, -1); // Remove trailing ':'
            if (!protocols.includes(protocol)) {
                return message;
            }

            // Basic validation
            if (!parsedUrl.hostname) {
                return message;
            }

            return true;
        } catch {
            return message;
        }
    };
}

/**
 * Validates phone numbers in international format
 * 
 * @param options - Phone validator options
 * @returns Validator function
 */
export function phone(options: PhoneValidatorOptions = {}): ValidatorFunction {
    const defaultMessage = 'Please enter a valid phone number (e.g., +1234567890)';
    const message = options.message || defaultMessage;

    return (value: unknown): boolean | string => {
        if (typeof value !== 'string') {
            return message;
        }

        // Remove common separators
        const cleanedValue = value.replace(/[\s\-\(\)\.]/g, '');

        // E.164 format: + followed by 1-15 digits
        const e164Regex = /^\+[1-9]\d{1,14}$/;

        // Also accept numbers without + if they're 10-15 digits
        const digitsOnlyRegex = /^\d{10,15}$/;

        if (!e164Regex.test(cleanedValue) && !digitsOnlyRegex.test(cleanedValue)) {
            return message;
        }

        return true;
    };
}

/**
 * Validates input against a custom regex pattern
 * 
 * @param pattern - Regular expression pattern
 * @param options - Regex validator options
 * @returns Validator function
 */
export function regex(pattern: RegExp | string, options: RegexValidatorOptions = {}): ValidatorFunction {
    const defaultMessage = 'Input does not match the required format';
    const message = options.message || defaultMessage;

    const regexPattern = typeof pattern === 'string'
        ? new RegExp(pattern, options.flags)
        : pattern;

    return (value: unknown): boolean | string => {
        if (typeof value !== 'string') {
            return message;
        }

        if (!regexPattern.test(value)) {
            return message;
        }

        return true;
    };
}

/**
 * Validates string length within a range
 * 
 * @param options - Length validator options
 * @returns Validator function
 */
export function length(options: LengthValidatorOptions): ValidatorFunction {
    const { min, max, message } = options;

    return (value: unknown): boolean | string => {
        if (typeof value !== 'string') {
            return message || 'Value must be a string';
        }

        const len = value.length;

        if (min !== undefined && len < min) {
            return message || `Must be at least ${min} characters`;
        }

        if (max !== undefined && len > max) {
            return message || `Must be at most ${max} characters`;
        }

        return true;
    };
}

/**
 * Validates numeric values within a range
 * 
 * @param options - Range validator options
 * @returns Validator function
 */
export function range(options: RangeValidatorOptions): ValidatorFunction {
    const { min, max, message } = options;

    return (value: unknown): boolean | string => {
        const num = typeof value === 'string' ? parseFloat(value) : value;

        if (typeof num !== 'number' || isNaN(num)) {
            return message || 'Value must be a number';
        }

        if (min !== undefined && num < min) {
            return message || `Must be at least ${min}`;
        }

        if (max !== undefined && num > max) {
            return message || `Must be at most ${max}`;
        }

        return true;
    };
}

/**
 * Validates dates
 * 
 * @param options - Date validator options
 * @returns Validator function
 */
export function date(options: DateValidatorOptions = {}): ValidatorFunction {
    const defaultMessage = 'Please enter a valid date';
    const message = options.message || defaultMessage;

    return (value: unknown): boolean | string => {
        const dateValue = new Date(value as string | number | Date);

        if (isNaN(dateValue.getTime())) {
            return message;
        }

        if (options.min && dateValue < options.min) {
            return message;
        }

        if (options.max && dateValue > options.max) {
            return message;
        }

        return true;
    };
}

/**
 * Combines multiple validators with AND logic (all must pass)
 * 
 * @param validators - Array of validator functions to combine
 * @returns Combined validator function
 */
export function combine(validators: ValidatorFunction[]): ValidatorFunction {
    return async (value: unknown): Promise<boolean | string> => {
        for (const validator of validators) {
            const result = await validator(value);
            if (result !== true) {
                return result;
            }
        }
        return true;
    };
}

/**
 * Creates a validator that checks if value is one of the allowed values
 * 
 * @param allowedValues - Array of allowed values
 * @param message - Custom error message
 * @returns Validator function
 */
export function oneOf(allowedValues: unknown[], message?: string): ValidatorFunction {
    const defaultMessage = `Value must be one of: ${allowedValues.join(', ')}`;

    return (value: unknown): boolean | string => {
        if (!allowedValues.includes(value)) {
            return message || defaultMessage;
        }
        return true;
    };
}

/**
 * Namespace containing all built-in validators
 */
export const validators = {
    email,
    url,
    phone,
    regex,
    length,
    range,
    date,
    combine,
    oneOf,
};

export default validators;

