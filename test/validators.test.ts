import { validators } from '../src/validators';

describe('Validators', () => {
    describe('email', () => {
        const emailValidator = validators.email();

        it('should accept valid email addresses', () => {
            expect(emailValidator('test@example.com')).toBe(true);
            expect(emailValidator('user.name@example.co.uk')).toBe(true);
            expect(emailValidator('user+tag@example.com')).toBe(true);
        });

        it('should reject invalid email addresses', () => {
            const result1 = emailValidator('invalid');
            const result2 = emailValidator('invalid@');
            const result3 = emailValidator('@example.com');
            const result4 = emailValidator('test @example.com');

            expect(result1).toBe('Please enter a valid email address');
            expect(result2).toBe('Please enter a valid email address');
            expect(result3).toBe('Please enter a valid email address');
            expect(result4).toBe('Please enter a valid email address');
        });

        it('should use custom error message', () => {
            const customValidator = validators.email({ message: 'Custom error' });
            expect(customValidator('invalid')).toBe('Custom error');
        });

        it('should reject non-string values', () => {
            expect(emailValidator(123)).toBe('Please enter a valid email address');
            expect(emailValidator(null)).toBe('Please enter a valid email address');
        });
    });

    describe('url', () => {
        const urlValidator = validators.url();

        it('should accept valid URLs', () => {
            expect(urlValidator('https://example.com')).toBe(true);
            expect(urlValidator('http://example.com')).toBe(true);
            expect(urlValidator('https://sub.example.com/path')).toBe(true);
        });

        it('should reject invalid URLs', () => {
            const result = urlValidator('not a url');
            expect(typeof result).toBe('string');
        });

        it('should allow specific protocols only', () => {
            const httpsOnly = validators.url({ protocols: ['https'] });
            expect(httpsOnly('https://example.com')).toBe(true);
            expect(typeof httpsOnly('http://example.com')).toBe('string');
        });

        it('should optionally not require protocol', () => {
            const noProtocolRequired = validators.url({ requireProtocol: false });
            expect(noProtocolRequired('example.com')).toBe(true);
        });
    });

    describe('phone', () => {
        const phoneValidator = validators.phone();

        it('should accept valid phone numbers', () => {
            expect(phoneValidator('+12345678901')).toBe(true);
            expect(phoneValidator('+34123456789')).toBe(true);
            expect(phoneValidator('1234567890')).toBe(true);
            expect(phoneValidator('+1 (234) 567-8901')).toBe(true);
        });

        it('should reject invalid phone numbers', () => {
            const result1 = phoneValidator('123');
            const result2 = phoneValidator('abc');
            const result3 = phoneValidator('+');

            expect(typeof result1).toBe('string');
            expect(typeof result2).toBe('string');
            expect(typeof result3).toBe('string');
        });
    });

    describe('regex', () => {
        it('should validate against regex pattern', () => {
            const usernameValidator = validators.regex(/^[a-zA-Z0-9_]{3,16}$/);

            expect(usernameValidator('valid_user123')).toBe(true);
            expect(usernameValidator('ab')).not.toBe(true);
            expect(usernameValidator('invalid user')).not.toBe(true);
        });

        it('should accept string patterns', () => {
            const patternValidator = validators.regex('^test$');
            expect(patternValidator('test')).toBe(true);
            expect(patternValidator('testing')).not.toBe(true);
        });

        it('should use custom error message', () => {
            const validator = validators.regex(/^test$/, { message: 'Must be "test"' });
            expect(validator('wrong')).toBe('Must be "test"');
        });
    });

    describe('length', () => {
        it('should validate minimum length', () => {
            const minValidator = validators.length({ min: 5 });
            expect(minValidator('hello')).toBe(true);
            expect(minValidator('test')).not.toBe(true);
        });

        it('should validate maximum length', () => {
            const maxValidator = validators.length({ max: 10 });
            expect(maxValidator('short')).toBe(true);
            expect(maxValidator('this is way too long')).not.toBe(true);
        });

        it('should validate length range', () => {
            const rangeValidator = validators.length({ min: 3, max: 10 });
            expect(rangeValidator('valid')).toBe(true);
            expect(rangeValidator('no')).not.toBe(true);
            expect(rangeValidator('this is way too long')).not.toBe(true);
        });

        it('should use custom error message', () => {
            const validator = validators.length({ min: 5, message: 'Too short!' });
            expect(validator('hi')).toBe('Too short!');
        });
    });

    describe('range', () => {
        it('should validate minimum value', () => {
            const minValidator = validators.range({ min: 10 });
            expect(minValidator(15)).toBe(true);
            expect(minValidator(5)).not.toBe(true);
        });

        it('should validate maximum value', () => {
            const maxValidator = validators.range({ max: 100 });
            expect(maxValidator(50)).toBe(true);
            expect(maxValidator(150)).not.toBe(true);
        });

        it('should validate numeric range', () => {
            const rangeValidator = validators.range({ min: 10, max: 100 });
            expect(rangeValidator(50)).toBe(true);
            expect(rangeValidator(5)).not.toBe(true);
            expect(rangeValidator(150)).not.toBe(true);
        });

        it('should accept string numbers', () => {
            const validator = validators.range({ min: 10, max: 100 });
            expect(validator('50')).toBe(true);
        });

        it('should reject non-numeric values', () => {
            const validator = validators.range({ min: 10 });
            expect(typeof validator('abc')).toBe('string');
        });
    });

    describe('combine', () => {
        it('should combine multiple validators', async () => {
            const combined = validators.combine([
                validators.length({ min: 8 }),
                validators.regex(/[A-Z]/, { message: 'Must contain uppercase' }),
                validators.regex(/[0-9]/, { message: 'Must contain number' }),
            ]);

            expect(await combined('Password123')).toBe(true);
            expect(await combined('short')).not.toBe(true);
            expect(await combined('nouppercase123')).toBe('Must contain uppercase');
            expect(await combined('NoNumber')).toBe('Must contain number');
        });

        it('should return first error encountered', async () => {
            const combined = validators.combine([
                validators.length({ min: 10, message: 'Too short' }),
                validators.regex(/[A-Z]/, { message: 'No uppercase' }),
            ]);

            expect(await combined('short')).toBe('Too short');
        });
    });

    describe('oneOf', () => {
        it('should validate against allowed values', () => {
            const colorValidator = validators.oneOf(['red', 'blue', 'green']);

            expect(colorValidator('red')).toBe(true);
            expect(colorValidator('blue')).toBe(true);
            expect(colorValidator('yellow')).not.toBe(true);
        });

        it('should use custom error message', () => {
            const validator = validators.oneOf(['a', 'b'], 'Must be a or b');
            expect(validator('c')).toBe('Must be a or b');
        });

        it('should work with numbers', () => {
            const validator = validators.oneOf([1, 2, 3]);
            expect(validator(2)).toBe(true);
            expect(validator(5)).not.toBe(true);
        });
    });
});
