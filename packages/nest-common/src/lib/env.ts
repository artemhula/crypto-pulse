export interface EnvRule {
  key: string;
  required?: boolean;
  default?: string;
}

export type EnvRules = Record<string, EnvRule>;

export function createEnvValidator(rules: EnvRules) {
  return (config: Record<string, unknown>): Record<string, unknown> => {
    const errors: string[] = [];
    const result: Record<string, unknown> = { ...config };

    for (const rule of Object.values(rules)) {
      const value = config[rule.key];

      if (value === undefined || value === '') {
        if (rule.default !== undefined) {
          result[rule.key] = rule.default;
          continue;
        }

        if (rule.required) {
          errors.push(`  - ${rule.key} is required`);
        }

        continue;
      }

      result[rule.key] = value;
    }

    if (errors.length > 0) {
      throw new Error(
        `Environment validation failed:\n${errors.join('\n')}`,
      );
    }

    return result;
  };
}

export const required = (key: string): EnvRule => ({ key, required: true });
export const optional = (key: string, fallback: string): EnvRule => ({
  key,
  default: fallback,
});
