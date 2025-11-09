import type { LintMessage } from '@eslint/core';
import plugin from '../';

describe('eslint-plugin-sunset', () => {
  const processor = plugin.processors['sunset-after-date'];

  describe('postprocess', () => {
    it('should not convert warnings to errors', () => {
      const warning = {
        ruleId: 'no-console',
        severity: 1,
        message: 'Unexpected console statement.',
        line: 1,
        column: 1
      } as LintMessage;

      const error = {
        ruleId: 'no-eval',
        severity: 2,
        message: 'eval can be harmful.',
        line: 2,
        column: 1
      } as LintMessage;

      const messages = [[warning, error]];
      const result = processor.postprocess(messages, '');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        ...warning,
        severity: 1 // remains a warning because it doesn't match REMOVAL_REGEX
      });
      expect(result[1]).toEqual(error);
    });

    it('should keep warning if removal date is in the future', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const dateStr = futureDate.toISOString().slice(0, 10);
      const warning = {
        ruleId: 'deprecation',
        severity: 1,
        message: `This API will be removed in ${dateStr}`,
        line: 1,
        column: 1
      } as LintMessage;
      const messages = [[warning]];
      const result = processor.postprocess(messages, '');
      expect(result[0].severity).toBe(1);
    });

    it('should convert to error if removal date is today', () => {
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10);
      const warning = {
        ruleId: 'deprecation',
        severity: 1,
        message: `This API will be removed in ${dateStr}`,
        line: 1,
        column: 1
      } as LintMessage;
      const messages = [[warning]];
      const result = processor.postprocess(messages, '');
      expect(result[0].severity).toBe(2);
    });

    it('should convert to error if removal date is in the past', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);
      const dateStr = pastDate.toISOString().slice(0, 10);
      const warning = {
        ruleId: 'deprecation',
        severity: 1,
        message: `This API will be removed in ${dateStr}`,
        line: 1,
        column: 1
      } as LintMessage;
      const messages = [[warning]];
      const result = processor.postprocess(messages, '');
      expect(result[0].severity).toBe(2);
    });

    it('should handle empty message arrays', () => {
      const messages: LintMessage[][] = [];
      const result = processor.postprocess(messages, '');
      expect(result).toEqual([]);
    });

    it('should handle multiple groups of messages', () => {
      const warning1 = {
        ruleId: 'no-console',
        severity: 1,
        message: 'Unexpected console statement.',
        line: 1,
        column: 1
      } as LintMessage;

      const warning2 = {
        ruleId: 'no-debugger',
        severity: 1,
        message: 'Unexpected debugger statement.',
        line: 2,
        column: 1
      } as LintMessage;

      const messages = [[warning1], [warning2]];
      const result = processor.postprocess(messages, '');

      expect(result).toHaveLength(2);
      expect(result.every((msg: LintMessage) => msg.severity === 1)).toBe(true);
    });

    it('should support custom removalRegex option', () => {
      const warning = {
        ruleId: 'custom-deprecation',
        severity: 1,
        message: 'Deprecated: sunset=2099/12/31',
        line: 1,
        column: 1
      } as LintMessage;
      // Custom regex to extract the date in the format sunset=YYYY/MM/DD
      const customRegex = 'sunset=(\\d{4}/\\d{2}/\\d{2})';
      const messages = [[warning]];
      const result = processor.postprocess(messages, '', { removalRegex: customRegex });
      // The date is in the future, so it remains a warning
      expect(result[0].severity).toBe(1);
    });

    it('should escalate to error with custom removalRegex if date is today or past', () => {
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '/'); // format YYYY/MM/DD
      const warning = {
        ruleId: 'custom-deprecation',
        severity: 1,
        message: `Deprecated: sunset=${dateStr}`,
        line: 1,
        column: 1
      } as LintMessage;
      const customRegex = 'sunset=(\\d{4}/\\d{2}/\\d{2})';
      const messages = [[warning]];
      const result = processor.postprocess(messages, '', { removalRegex: customRegex });
      expect(result[0].severity).toBe(2);
    });
  });
});