/**
 * Tests for type definitions and enums
 */

import { StepType, NavigationAction } from '../src/types';

describe('Type Definitions', () => {
    describe('StepType Enum', () => {
        it('should have correct values', () => {
            expect(StepType.TEXT).toBe('text');
            expect(StepType.NUMBER).toBe('number');
            expect(StepType.SELECT_MENU).toBe('select_menu');
            expect(StepType.ATTACHMENT).toBe('attachment');
            expect(StepType.BUTTON).toBe('button');
            expect(StepType.CONFIRMATION).toBe('confirmation');
        });
    });

    describe('NavigationAction Enum', () => {
        it('should have correct values', () => {
            expect(NavigationAction.NEXT).toBe('next');
            expect(NavigationAction.BACK).toBe('back');
            expect(NavigationAction.SKIP).toBe('skip');
            expect(NavigationAction.JUMP).toBe('jump');
            expect(NavigationAction.CANCEL).toBe('cancel');
        });
    });
});
