import type { LintMessage } from '@eslint/core';


// Default regex if not provided in config
const DEFAULT_REMOVAL_REGEX = /will be removed in\s+(\d{4}-\d{2}-\d{2})/i;

function isDateInPastOrToday(date: Date): boolean {
  const today = new Date();

  today.setHours(0, 0, 0, 0); // Normalize to midnight
  date.setHours(0, 0, 0, 0); // Normalize to midnight

  return date <= today;
}


const plugin = {
  processors: {
    'sunset-after-date': {
      // Accepts options from ESLint configuration
      postprocess(messages: LintMessage[][], _filename: string, config?: { removalRegex?: string }): LintMessage[] {
        // Use custom regex if provided, otherwise use the default
        const removalRegex = config?.removalRegex ? new RegExp(config.removalRegex, 'i') : DEFAULT_REMOVAL_REGEX;
        return messages.flat().map((message) => {
          if (message.severity === 1 && typeof message.message === 'string') {
            const match = removalRegex.exec(message.message);
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
