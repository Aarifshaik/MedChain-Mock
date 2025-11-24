/**
 * Accessibility Audit Utilities
 * Validates WCAG 2.1 AA compliance for color contrast ratios
 */

interface ColorPair {
  name: string;
  foreground: string;
  background: string;
  requiredRatio: number;
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}

/**
 * Calculate relative luminance
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(
  fg: [number, number, number],
  bg: [number, number, number]
): number {
  const l1 = getLuminance(...fg);
  const l2 = getLuminance(...bg);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Parse HSL string and return RGB values
 */
function parseHSL(hsl: string): [number, number, number] {
  const [h, s, l] = hsl.split(' ').map(v => parseFloat(v.replace('%', '')));
  return hslToRgb(h, s, l);
}

/**
 * Check if contrast ratio meets WCAG AA standards
 */
export function checkContrastRatio(
  foregroundHSL: string,
  backgroundHSL: string,
  requiredRatio: number = 4.5
): { ratio: number; passes: boolean } {
  const fg = parseHSL(foregroundHSL);
  const bg = parseHSL(backgroundHSL);
  
  const ratio = getContrastRatio(fg, bg);
  const passes = ratio >= requiredRatio;

  return { ratio, passes };
}

/**
 * Audit all color pairs from the design system
 */
export function auditColorPairs(): Array<ColorPair & { ratio: number; passes: boolean }> {
  const colorPairs: ColorPair[] = [
    // Base text on background
    {
      name: 'Body text on background',
      foreground: '180 5% 98%',
      background: '200 50% 4%',
      requiredRatio: 4.5
    },
    // Card text
    {
      name: 'Card text on card background',
      foreground: '180 5% 98%',
      background: '200 40% 8%',
      requiredRatio: 4.5
    },
    // Primary button
    {
      name: 'Primary button text',
      foreground: '200 50% 5%',
      background: '175 70% 45%',
      requiredRatio: 4.5
    },
    // Secondary text
    {
      name: 'Secondary text',
      foreground: '180 5% 98%',
      background: '200 25% 18%',
      requiredRatio: 4.5
    },
    // Muted text
    {
      name: 'Muted text on background',
      foreground: '200 15% 70%',
      background: '200 50% 4%',
      requiredRatio: 4.5
    },
    // Muted text on card
    {
      name: 'Muted text on card',
      foreground: '200 15% 70%',
      background: '200 40% 8%',
      requiredRatio: 4.5
    },
    // Accent button
    {
      name: 'Accent button text',
      foreground: '200 50% 5%',
      background: '185 80% 55%',
      requiredRatio: 4.5
    },
    // Destructive button
    {
      name: 'Destructive button text',
      foreground: '0 0% 98%',
      background: '0 70% 50%',
      requiredRatio: 4.5
    },
    // Success button
    {
      name: 'Success button text',
      foreground: '140 100% 5%',
      background: '140 70% 50%',
      requiredRatio: 4.5
    },
    // Status active
    {
      name: 'Status active text',
      foreground: '140 70% 60%',
      background: '200 50% 4%',
      requiredRatio: 4.5
    },
    // Status pending
    {
      name: 'Status pending text',
      foreground: '45 90% 65%',
      background: '200 50% 4%',
      requiredRatio: 4.5
    },
    // Status error
    {
      name: 'Status error text',
      foreground: '0 75% 65%',
      background: '200 50% 4%',
      requiredRatio: 4.5
    },
    // Border visibility (3:1 for UI components)
    {
      name: 'Border on background',
      foreground: '200 30% 35%',
      background: '200 50% 4%',
      requiredRatio: 3.0
    }
  ];

  return colorPairs.map(pair => {
    const result = checkContrastRatio(pair.foreground, pair.background, pair.requiredRatio);
    return {
      ...pair,
      ...result
    };
  });
}

/**
 * Generate a report of contrast ratio issues
 */
export function generateAccessibilityReport(): string {
  const results = auditColorPairs();
  const failures = results.filter(r => !r.passes);
  
  let report = '=== Accessibility Audit Report ===\n\n';
  
  if (failures.length === 0) {
    report += '✓ All color pairs meet WCAG AA standards!\n\n';
  } else {
    report += `✗ ${failures.length} color pair(s) failing WCAG AA standards:\n\n`;
    failures.forEach(failure => {
      report += `- ${failure.name}\n`;
      report += `  Ratio: ${failure.ratio.toFixed(2)}:1 (Required: ${failure.requiredRatio}:1)\n`;
      report += `  Foreground: hsl(${failure.foreground})\n`;
      report += `  Background: hsl(${failure.background})\n\n`;
    });
  }
  
  report += 'All color pairs tested:\n\n';
  results.forEach(result => {
    const status = result.passes ? '✓' : '✗';
    report += `${status} ${result.name}: ${result.ratio.toFixed(2)}:1\n`;
  });
  
  return report;
}
