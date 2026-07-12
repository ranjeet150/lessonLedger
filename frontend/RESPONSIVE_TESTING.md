# Mobile Responsive Testing Guide

## Quick Start Testing

### Browser DevTools Testing
1. Open Chrome DevTools (F12)
2. Click "Toggle device toolbar" (Ctrl+Shift+M)
3. Test these viewports:
   - iPhone SE (375x667) - Small mobile
   - iPhone 12 Pro (390x844) - Standard mobile
   - iPad (768x1024) - Tablet
   - Desktop (1920x1080) - Desktop

### Test Each Page

#### ✅ Home Page (/)
**Mobile (320-640px):**
- [ ] Hero title readable and centered
- [ ] CTA buttons 44px+ tall
- [ ] Feature cards stack vertically
- [ ] All text readable without zoom
- [ ] Footer not cut off

**Tablet (640-1024px):**
- [ ] Feature cards in 2 columns
- [ ] Spacing looks balanced
- [ ] CTA section readable

**Desktop (1024px+):**
- [ ] Feature cards in 4 columns
- [ ] Maximum width constraint active

#### ✅ Login Page (/auth/login)
**Mobile:**
- [ ] Form centered and full width
- [ ] Google button icon visible
- [ ] Email input doesn't zoom on tap (16px font)
- [ ] Password input doesn't zoom on tap
- [ ] Submit button 44px+ tall
- [ ] Icons aligned properly
- [ ] "Sign in" link clickable

**Test Actions:**
1. Tap email input - no zoom should occur
2. Tap password input - keyboard appears correctly
3. Tap submit button - easy to hit with thumb

#### ✅ Signup Page (/auth/signup)
**Mobile:**
- [ ] All 3 input fields easily tappable
- [ ] Name, email, password fields 44px tall
- [ ] Submit button full width
- [ ] "Sign in" link at bottom visible
- [ ] Icons don't overlap text

#### ✅ Dashboard (/dashboard)
**Mobile:**
- [ ] Header text readable
- [ ] Streak card displays correctly
- [ ] Charts scroll horizontally if needed
- [ ] Task list items wrap properly
- [ ] Checkboxes 20x20px minimum
- [ ] Delete buttons 44px touch target
- [ ] Achievement cards stack vertically

**Tablet:**
- [ ] Charts side by side
- [ ] Tasks and achievements in 2 columns

**Desktop:**
- [ ] Full layout with proper spacing

**Test Actions:**
1. Scroll through dashboard - smooth scrolling
2. Tap checkbox - easy to toggle
3. Tap delete button - 44px touch area
4. Check chart responsiveness

#### ✅ Roadmaps (/roadmaps)
**Mobile:**
- [ ] Roadmap cards stack vertically (1 column)
- [ ] Card images 96px tall
- [ ] Card titles don't overflow
- [ ] Progress bars visible
- [ ] "View Roadmap" buttons clickable

**Tablet:**
- [ ] 2 column grid
- [ ] Cards uniform height

**Desktop:**
- [ ] 3 column grid
- [ ] Hover effects work

#### ✅ Roadmap Detail (/roadmaps/[id])
**Mobile:**
- [ ] Progress bar full width
- [ ] Section headers 44px touch area
- [ ] Topics expand/collapse smoothly
- [ ] Subtopics indented properly
- [ ] Text wraps without overflow
- [ ] Checkboxes visible

**Test Actions:**
1. Tap section header - should expand/collapse
2. Tap topic - should show subtopics
3. Long topic names should wrap

#### ✅ Achievements (/achievements)
**Mobile:**
- [ ] Achievement grid stacks vertically
- [ ] NFT type cards in 1 column (2 on tablet)
- [ ] Icons scale properly
- [ ] Dates don't overflow
- [ ] "NFT Minted" badges visible

#### ✅ Navigation
**Mobile:**
- [ ] Hamburger menu visible (desktop hidden)
- [ ] Menu opens smoothly
- [ ] All links 44px tall
- [ ] Menu closes on navigation
- [ ] Logo visible and clickable
- [ ] User name truncated if long

**Desktop:**
- [ ] Horizontal navigation visible
- [ ] Hamburger hidden
- [ ] All links in row
- [ ] Logout button accessible

## Touch Target Size Verification

### Minimum 44x44px (WCAG 2.1 Level AAA)
Test with finger or use ruler in DevTools:

- [ ] All buttons
- [ ] All form inputs
- [ ] Navigation links
- [ ] Checkboxes (visual 20x20px, tap area 44x44px)
- [ ] Close/delete icons
- [ ] Expandable section headers
- [ ] Card click areas

## Keyboard & Input Testing

### iOS Safari Specific
1. **Zoom Prevention Test:**
   - Tap any input field
   - If page zooms in, font size is too small (<16px)
   - ✅ All inputs should be 16px minimum

2. **Keyboard Type Test:**
   - Email input → @ symbol visible on keyboard
   - Password input → secure text entry
   - Date input → date picker appears

### Android Chrome
1. Test same inputs
2. Verify keyboard doesn't cover submit button
3. Check if "Next" button navigates between fields

## Orientation Testing

### Portrait Mode
- [ ] All pages render correctly
- [ ] Navigation accessible
- [ ] Content doesn't overflow

### Landscape Mode
- [ ] Content adapts appropriately
- [ ] Navigation still accessible
- [ ] Charts/images scale correctly
- [ ] Modals still centered

## Network Throttling Test

1. Open DevTools → Network tab
2. Set to "Slow 3G"
3. Reload each page
4. Verify:
   - [ ] Layout doesn't shift during load
   - [ ] Loading states visible
   - [ ] Images load progressively
   - [ ] Interactive quickly (< 3 seconds)

## Cross-Browser Testing Matrix

| Device/Browser | Home | Login | Dashboard | Roadmaps | Achievements |
|----------------|------|-------|-----------|----------|--------------|
| iPhone Safari  | ⬜   | ⬜    | ⬜        | ⬜       | ⬜           |
| Android Chrome | ⬜   | ⬜    | ⬜        | ⬜       | ⬜           |
| iPad Safari    | ⬜   | ⬜    | ⬜        | ⬜       | ⬜           |
| Firefox Mobile | ⬜   | ⬜    | ⬜        | ⬜       | ⬜           |

## Breakpoint Testing

Test at these exact widths:
- **320px** - iPhone SE (smallest)
- **375px** - iPhone 12 mini
- **390px** - iPhone 12/13/14
- **414px** - iPhone Plus models
- **640px** - sm breakpoint
- **768px** - md breakpoint  
- **1024px** - lg breakpoint
- **1280px** - xl breakpoint

### What to Check at Each Breakpoint:
- [ ] No horizontal scrollbar
- [ ] Text doesn't overflow containers
- [ ] Images maintain aspect ratio
- [ ] Buttons remain accessible
- [ ] Grid layouts adapt correctly

## Accessibility Testing

### Focus Indicators
1. Tab through page
2. Verify:
   - [ ] Focus ring visible on all interactive elements
   - [ ] Focus order logical
   - [ ] No focus traps

### Screen Reader (Optional)
- VoiceOver (iOS): Triple-click home button
- TalkBack (Android): Settings → Accessibility
- Test that all buttons/links are announced correctly

## Performance Checklist

### Lighthouse Mobile Audit
1. Open DevTools
2. Lighthouse tab
3. Select "Mobile" device
4. Run audit
5. Target scores:
   - Performance: 90+
   - Accessibility: 95+
   - Best Practices: 95+
   - SEO: 95+

### Core Web Vitals
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

## Common Issues & Solutions

### Issue: Page zooms when tapping input
**Solution:** Ensure font-size is 16px minimum
```tsx
className="text-base" // 16px
```

### Issue: Horizontal scrollbar appears
**Solution:** Check for fixed widths, use max-w instead
```tsx
className="max-w-full" // instead of w-[500px]
```

### Issue: Buttons too small to tap
**Solution:** Add min-h-[44px]
```tsx
className="min-h-[44px] px-4 py-3"
```

### Issue: Text overflows container
**Solution:** Add line-clamp or truncate
```tsx
className="line-clamp-2 break-words"
```

### Issue: Images pixelated
**Solution:** Use higher resolution images or SVG
```tsx
<img src="image@2x.png" className="max-w-full h-auto" />
```

## Real Device Testing

### iOS Physical Device Testing
1. Get IP address: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Run: `npm run dev -- --host`
3. Open `http://YOUR_IP:3000` on iPhone
4. Test all pages with real touch interactions

### Android Physical Device Testing
1. Enable USB debugging on Android device
2. Connect via USB
3. Chrome DevTools → Remote devices
4. Inspect and test

## Automated Testing Commands

```bash
# Run all tests
npm test

# Test specific component
npm test Navbar

# Run in watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

## Sign-Off Checklist

### Before marking complete:
- [ ] All pages tested at 320px width
- [ ] All buttons meet 44x44px minimum
- [ ] Mobile navigation works smoothly
- [ ] Forms don't trigger zoom on iOS
- [ ] Images scale without quality loss
- [ ] Tested on at least 3 devices/browsers
- [ ] No console errors
- [ ] No horizontal scroll at any size
- [ ] Lighthouse mobile score 90+
- [ ] All acceptance criteria met

## Reporting Issues

When reporting a responsive issue, include:
1. Device/browser (e.g., "iPhone 12 Safari 15.0")
2. Screen width (e.g., "390px")
3. Page/component affected
4. Screenshot or video
5. Expected vs actual behavior

---

**Testing completed by:** _________________
**Date:** _________________
**Sign-off:** _________________
