#!/usr/bin/env tsx

/**
 * Accessibility Audit Script
 * Run this to check WCAG 2.1 AA compliance for all color pairs
 */

import { generateAccessibilityReport } from '../src/lib/accessibility-audit';

console.log(generateAccessibilityReport());
