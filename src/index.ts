type LintMessage = {
  severity: number;
  message: string;
  line?: number;
  column?: number;
  nodeType?: string;
  ruleId?: string;
  [key: string]: any;
};

const plugin = {
  rules: {},
  processors: {
    '.': {
      // Il preprocessor è richiesto quando si usa il postprocessor
      preprocess(text: string, filename: string): string[] {
        return [text];
      },
      // Il postprocessor riceve un array di messaggi per ogni file analizzato
      postprocess(messages: LintMessage[][], filename: string): LintMessage[] {
        // Appiattisce l'array di messaggi in un unico array
        return messages.flat().map(message => {
          // Se il messaggio è un warning, lo trasforma in un errore
          if (message.severity === 1) {
            return {
              ...message,
              severity: 2 // 2 rappresenta un errore in ESLint
            };
          }
          return message;
        });
      }
    }
  }
};

export = plugin;