'use strict';

const react = require('..');

describe('@aspot/react', () => {
    it('should export useNode function', () => {
        expect(react.useNode).toBeDefined();
        expect(typeof react.useNode).toBe('function');
    });

    it('should export useNodeList function', () => {
        expect(react.useNodeList).toBeDefined();
        expect(typeof react.useNodeList).toBe('function');
    });

    it('should export AspotContext', () => {
        expect(react.AspotContext).toBeDefined();
    });

    it('should export AspotWrapper', () => {
        expect(react.AspotWrapper).toBeDefined();
        expect(typeof react.AspotWrapper).toBe('function');
    });

    it('should export useAspotContext', () => {
        expect(react.useAspotContext).toBeDefined();
        expect(typeof react.useAspotContext).toBe('function');
    });

    it('should export default aspot function', () => {
        expect(react.default).toBeDefined();
        expect(typeof react.default).toBe('function');
    });
});
