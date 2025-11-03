import plugin from '../index';

describe('eslint-plugin-sunset', () => {
  const processor = plugin.processors['.'];

  describe('preprocess', () => {
    it('should return an array with the original text', () => {
      const text = 'const foo = "bar";';
      const result = processor.preprocess(text, 'test.js');
      expect(result).toEqual([text]);
    });
  });

  describe('postprocess', () => {
    it('should convert warnings to errors', () => {
      const warning = {
        ruleId: 'no-console',
        severity: 1,
        message: 'Unexpected console statement.',
        line: 1,
        column: 1
      };

      const error = {
        ruleId: 'no-eval',
        severity: 2,
        message: 'eval can be harmful.',
        line: 2,
        column: 1
      };

      const messages = [[warning, error]];
      const result = processor.postprocess(messages, 'test.js');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        ...warning,
        severity: 2
      });
      expect(result[1]).toEqual(error);
    });

    it('should handle empty message arrays', () => {
      const messages: any[][] = [];
      const result = processor.postprocess(messages, 'test.js');
      expect(result).toEqual([]);
    });

    it('should handle multiple groups of messages', () => {
      const warning1 = {
        ruleId: 'no-console',
        severity: 1,
        message: 'Unexpected console statement.',
        line: 1,
        column: 1
      };

      const warning2 = {
        ruleId: 'no-debugger',
        severity: 1,
        message: 'Unexpected debugger statement.',
        line: 2,
        column: 1
      };

      const messages = [[warning1], [warning2]];
      const result = processor.postprocess(messages, 'test.js');

      expect(result).toHaveLength(2);
      expect(result.every(msg => msg.severity === 2)).toBe(true);
    });
  });
});