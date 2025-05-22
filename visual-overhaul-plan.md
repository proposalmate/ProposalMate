# ProposalMate Visual Overhaul Implementation Plan

## Overview
This document outlines the implementation plan for the full visual overhaul of ProposalMate to create a premium, wedding-focused SaaS experience. The goal is to transform the current MVP/demo-style UI into an elegant, professional design system that evokes the aesthetic of high-end wedding service tools.

## 1. CSS Structure Updates

### 1.1 Root Variables Update
Update the `:root` variables in `layout.css` to reflect the new color scheme:
```css
:root {
  --primary-color: #F8D5DC; /* Soapstone pink for primary elements */
  --secondary-color: #E7B4C1; /* Deeper pink for hover states */
  --text-color: #333333; /* Dark gray for main text */
  --light-text: #666666; /* Lighter gray for secondary text */
  --background: #FAFAFA; /* Light background */
  --light-background: #F9EBF2; /* Soft pastel for alternate sections */
  --border-color: #e0e0e0; /* Light gray for borders */
  --shadow-light: #ffffff;
  --shadow-dark: rgba(0,0,0,0.08);
}
```

### 1.2 Typography System
Replace current typography settings with:
```css
body {
  font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
  line-height: 1.5;
  color: var(--text-color);
  background-color: var(--background);
}

h1, h2, h3, h4, h5, h6 {
  margin-bottom: 1rem;
}

h1 {
  font-size: 2rem; /* 32px */
  font-weight: bold;
}

h2 {
  font-size: 1.75rem; /* 28px */
  font-weight: bold;
}

h3 {
  font-size: 1.5rem; /* 24px */
  font-weight: bold;
}

h4 {
  font-size: 1.25rem; /* 20px */
  font-weight: 600;
}

p, li, a, button, input, textarea, select {
  font-size: 1rem; /* 16px */
}
```

### 1.3 Button Hierarchy
Replace all button classes with the new hierarchy:
```css
/* Primary Button - Elevated */
.elevated-btn {
  background: #F8D5DC;
  color: #333;
  font-weight: 500;
  border-radius: 14px;
  box-shadow: 6px 6px 12px rgba(0,0,0,0.08),
              -6px -6px 12px #ffffff;
  padding: 14px 28px;
  border: none;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  text-align: center;
  display: inline-block;
  text-decoration: none;
}

.elevated-btn:hover {
  background: #E7B4C1;
  box-shadow: inset 3px 3px 6px rgba(0,0,0,0.1),
              inset -3px -3px 6px #ffffff;
  transform: scale(0.98);
}

/* Secondary Button - Ghost */
.ghost-btn {
  background: transparent;
  border: 1px solid #ccc;
  color: #666;
  border-radius: 10px;
  padding: 10px 22px;
  transition: 0.2s;
  cursor: pointer;
  text-align: center;
  display: inline-block;
  text-decoration: none;
}

.ghost-btn:hover {
  border-color: #aaa;
  color: #333;
}
```

### 1.4 Layout & Spacing System
Update container and spacing:
```css
.container {
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 24px;
}

section {
  padding: 48px 0;
}

.card {
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  background-color: white;
}

.gap-16 {
  gap: 16px;
}
```

### 1.5 Form Elements
Update form styling:
```css
.form-group input, 
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 14px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: inset 2px 2px 5px rgba(0,0,0,0.05),
              inset -2px -2px 5px rgba(255,255,255,0.5);
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(248, 213, 220, 0.3);
}
```

### 1.6 Navigation & Footer
Update navigation and footer:
```css
/* Navigation */
nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-links a {
  text-decoration: none;
  color: var(--text-color);
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-links a:hover {
  color: var(--primary-color);
}

/* Footer */
footer {
  padding: 40px 0;
  background-color: #f2f2f2;
  border-top: 1px solid var(--border-color);
}

.footer-links a {
  font-size: 0.9rem;
  text-decoration: none;
  color: var(--light-text);
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: var(--primary-color);
}

.copyright {
  margin-top: 30px;
  text-align: center;
  color: var(--light-text);
  font-size: 0.85rem;
}
```

## 2. HTML Updates

### 2.1 Button Class Replacements
- Replace all `.btn-primary` with `.elevated-btn`
- Replace all `.btn-secondary`, `.btn-outline` with `.ghost-btn`
- Replace all `.neumorphic-btn` with `.elevated-btn`
- Replace all `.neumorphic-btn-secondary`, `.neumorphic-btn-outline` with `.ghost-btn`

### 2.2 Font Updates
- Update all font references to use the new font stack
- Ensure all heading elements use the correct font sizes

### 2.3 Layout Updates
- Ensure all sections have proper padding (48px)
- Update all card elements to have 24px padding
- Ensure consistent 16px gaps between elements

## 3. Implementation Order

1. Update CSS variables and base styles
2. Implement new typography system
3. Create new button hierarchy
4. Update layout and spacing
5. Refine form elements
6. Update navigation and footer
7. Apply changes to all HTML pages:
   - index.html
   - login.html and signup.html
   - dashboard.html
   - templates.html
   - account.html
   - pricing.html
   - about.html
   - create.html

## 4. Testing Plan

1. Visual consistency check across all pages
2. Responsive testing on multiple device sizes
3. Accessibility validation
4. Cross-browser compatibility check

## 5. Deliverables

1. Updated CSS files:
   - layout.css
   - styles.css
   - wedding-theme.css (if needed)
2. Updated HTML files for all pages
3. Documentation of changes
4. Before/after screenshots
