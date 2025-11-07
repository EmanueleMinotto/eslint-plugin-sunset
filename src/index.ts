import type { LintMessage } from '@eslint/core';

const REMOVAL_REGEX = /will be removed in\s+(\d{4}-\d{2}-\d{2})/i;

function isDateInPastOrToday(date: Date): boolean {
  const today = new Date();

  today.setHours(0, 0, 0, 0); // Normalize to midnight
  date.setHours(0, 0, 0, 0); // Normalize to midnight

  return date <= today;
}

const plugin = {
  processors: {
    'sunset-after-date': {
      postprocess(messages: LintMessage[][]): LintMessage[] {
        return messages.flat().map((message) => {
          if (message.severity === 1 && typeof message.message === 'string') {
            const match = REMOVAL_REGEX.exec(message.message);
            if (!match) {
              return message;
            }

            const dateStr = match[1];
            const removalDate = new Date(dateStr);

            // If the date is today or in the past, escalate to error
            if (!isNaN(removalDate.getTime()) && isDateInPastOrToday(removalDate)) {
              return {
                ...message,
                severity: 2
              };
            }

            // Otherwise, keep the original severity
            return message;
          }

          // Default behavior for other warnings
          return message;
        });
      }
    }
  }
};

export default plugin;
