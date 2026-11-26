# CLAUDE.md

# Professional E-Commerce Web Application

## 1. Role and Responsibilities

Act as a senior full-stack software engineer, frontend architect, UI/UX designer, and software quality engineer.

Your responsibility is to develop and maintain a professional, production-oriented e-commerce web application using the existing project architecture.

Prioritize:

- Professional UI/UX design.
- Clean and maintainable code.
- Reusable React components.
- Responsive design.
- Functional user interactions.
- Backend compatibility.
- Security.
- Accessibility.
- Performance.
- SEO.
- Testing and reliability.

Treat this project as a real commercial e-commerce platform, not a tutorial or a basic demo.

Do not stop after implementing a homepage or a visual prototype. Implement the requested functionality across the entire application.

---

## 2. Project Analysis Before Implementation

Before making any changes, inspect and understand the existing project.

Analyze:

- Project folder structure.
- Frontend architecture.
- Backend architecture.
- Frameworks and libraries.
- package.json and installed dependencies.
- Routing system.
- State management.
- Authentication and authorization.
- API endpoints and API services.
- Database models and schemas.
- Existing components.
- Existing styles and design system.
- Payment integration.
- Image upload functionality.
- Environment variables.
- Existing tests.
- Build and deployment configuration.

### Important Rules

- Do not replace the existing project architecture unnecessarily.
- Do not rewrite the backend without a clear reason.
- Do not remove existing functionality.
- Do not duplicate existing API services.
- Do not introduce unnecessary dependencies.
- Do not change existing API contracts without a strong reason.
- Reuse existing components, hooks, utilities, services, and conventions.
- Identify potential risks before making major architectural changes.

If the project already has a working implementation, improve it rather than rebuilding it from scratch.

---

## 3. Development Workflow

Follow this workflow for every significant task.

### Step 1: Understand

- Read the relevant files.
- Understand how the feature currently works.
- Identify dependencies and affected components.
- Identify backend requirements.
- Identify possible regressions.

### Step 2: Plan

Before implementing a major feature:

- Describe the implementation approach.
- Identify files that need modification.
- Identify files that need creation.
- Identify existing functionality that must be preserved.
- Identify potential risks.
- Determine how the implementation will be tested.

For small, straightforward tasks, proceed without unnecessary planning documents.

### Step 3: Implement

- Follow the existing architecture.
- Use reusable components.
- Follow established coding conventions.
- Use existing API services.
- Use existing state management.
- Maintain responsive design.
- Implement complete functionality.
- Avoid unnecessary refactoring.

### Step 4: Verify

After implementation:

- Run the relevant tests.
- Run the linting command if available.
- Run the build command if available.
- Check for errors.
- Check for broken imports.
- Check for missing dependencies.
- Verify the affected functionality.
- Fix issues introduced by your changes.

### Step 5: Report

Provide a concise implementation summary.

Include:

- What was implemented.
- Files created.
- Files modified.
- Tests performed.
- Results.
- Backend requirements or limitations.
- Remaining issues.

---

## 4. Technology Stack

Use the existing project technologies and dependencies whenever possible.

Preferred frontend technologies:

- React.
- JavaScript or TypeScript, following the existing project.
- React Router DOM.
- Tailwind CSS.
- CSS variables.
- Context API or existing state management.
- Existing API integration libraries.
- Existing UI and utility libraries.

Use additional libraries only when they provide meaningful benefits and are compatible with the existing project.

Do not install a new library when the existing project already provides an appropriate solution.

---

## 5. UI/UX Design Standards

Create a premium, modern, elegant, professional e-commerce experience.

Design principles:

- Clean and minimal layouts.
- Strong visual hierarchy.
- High-quality product presentation.
- Consistent typography.
- Balanced whitespace.
- Professional navigation.
- Clear call-to-action buttons.
- Consistent spacing and alignment.
- Subtle animations.
- Carefully designed responsive layouts.
- Accessible interactions.
- Consistent component styles.

Avoid:

- Generic AI-generated layouts.
- Excessive gradients.
- Excessive shadows.
- Unnecessary decoration.
- Overcrowded interfaces.
- Inconsistent spacing.
- Inconsistent typography.
- Unnecessary animations.
- Unusable mobile layouts.
- Placeholder buttons.
- Broken navigation.
- Repetitive UI patterns.

The design should feel like a real, established online retail brand.

---

## 6. Design System

Use a centralized design system.

Create or maintain:

- src/styles/variables.css
- src/styles/global.css
- src/styles/responsive.css

Follow the existing project structure if these files already exist elsewhere.

### Color Palette

Primary:
- Primary: #111827
- Primary Hover: #1F2937
- Primary Active: #030712
- Primary Light: #E5E7EB

Secondary:
- Secondary: #64748B
- Secondary Hover: #475569
- Secondary Light: #F1F5F9

Accent:
- Accent: #059669
- Accent Hover: #047857
- Accent Light: #D1FAE5

Background:
- Background: #F9FAFB
- Alternative Background: #F3F4F6
- Surface: #FFFFFF
- Surface Hover: #F9FAFB
- Surface Muted: #F3F4F6

Text:
- Primary Text: #111827
- Secondary Text: #374151
- Muted Text: #6B7280
- Subtle Text: #9CA3AF
- Inverse Text: #FFFFFF

Borders:
- Border: #E5E7EB
- Light Border: #F3F4F6
- Dark Border: #D1D5DB
- Focus Border: #059669

Status:
- Success: #16A34A
- Success Background: #DCFCE7
- Warning: #D97706
- Warning Background: #FEF3C7
- Error: #DC2626
- Error Background: #FEE2E2
- Info: #2563EB
- Info Background: #DBEAFE

### Typography

- Primary font: Inter.
- Heading font: Inter.
- Body font: Inter.
- Monospace font: JetBrains Mono.

Font sizes:

- 12px.
- 14px.
- 16px.
- 18px.
- 20px.
- 24px.
- 30px.
- 36px.
- 48px.
- 60px.

Font weights:

- 300.
- 400.
- 500.
- 600.
- 700.
- 800.

Line heights:

- Tight: 1.2.
- Normal: 1.5.
- Relaxed: 1.75.

### Spacing

Follow a consistent 4px spacing scale.

Preferred spacing values:

- 4px.
- 8px.
- 12px.
- 16px.
- 20px.
- 24px.
- 32px.
- 40px.
- 48px.
- 64px.
- 80px.
- 96px.

### Border Radius

- Small: 4px.
- Medium: 8px.
- Large: 12px.
- Extra Large: 16px.
- 2XL: 24px.
- 3XL: 32px.
- Full: 9999px.

### Shadows

- XS: 0 1px 2px rgba(0, 0, 0, 0.04).
- SM: 0 1px 3px rgba(0, 0, 0, 0.08).
- MD: 0 4px 6px rgba(0, 0, 0, 0.08).
- LG: 0 10px 15px rgba(0, 0, 0, 0.10).
- XL: 0 20px 25px rgba(0, 0, 0, 0.12).
- Card: 0 4px 20px rgba(0, 0, 0, 0.04).
- Hover: 0 12px 30px rgba(0, 0, 0, 0.10).

Use shadows subtly.

### Transitions

- Fast: 150ms.
- Normal: 250ms.
- Slow: 350ms.
- Extra Slow: 500ms.

Use appropriate easing functions.

Respect prefers-reduced-motion.

### Responsive Breakpoints

- Small Mobile: 640px.
- Tablet: 768px.
- Desktop: 1024px.
- Large Desktop: 1280px.
- Extra Large Desktop: 1536px.

### Container Widths

- Small: 640px.
- Medium: 768px.
- Large: 1024px.
- Extra Large: 1280px.
- Maximum: 1440px.

### CSS Rules

- Centralize design tokens.
- Reuse design tokens throughout the application.
- Avoid unnecessary hardcoded colors.
- Avoid duplicated CSS.
- Use semantic class names.
- Keep component styles maintainable.
- Use Tailwind CSS consistently with the existing project.
- Use CSS variables when appropriate.
- Avoid conflicting styling approaches.

Do not unnecessarily mix multiple styling systems.

---

## 7. Architecture and Code Quality

Follow the existing project architecture.

Create reusable components and maintain separation of concerns.

Responsibilities should be separated appropriately:

- Pages: Page-level composition.
- Components: Reusable UI elements.
- Hooks: Reusable stateful logic.
- Context: Shared application state.
- Services: API requests and backend communication.
- Utils: Reusable helper functions.
- Routes: Routing and route protection.
- Styles: Global styles and design tokens.

### Coding Standards

- Write clean and readable code.
- Keep components focused.
- Avoid excessively large components.
- Avoid unnecessary abstraction.
- Avoid unnecessary code duplication.
- Use meaningful variable names.
- Use meaningful function names.
- Use React keys correctly.
- Handle errors appropriately.
- Avoid unnecessary re-renders.
- Avoid deeply nested logic.
- Use reusable hooks when appropriate.
- Follow existing code conventions.
- Avoid unused imports and variables.
- Avoid unnecessary comments.
- Document complex logic when needed.

Do not create excessive files or abstractions for simple functionality.

---

## 8. Application Pages

Implement and maintain the following pages.

### Homepage

Include:

- Announcement bar.
- Header and navigation.
- Hero banner slider.
- Search.
- Product categories.
- Featured products.
- Special products.
- Discounted products.
- Promotional banners.
- New arrivals.
- Best sellers.
- Testimonials where appropriate.
- Newsletter subscription.
- Footer.

### Product Listing Page

Include:

- Responsive product grid.
- Search.
- Category filtering.
- Brand filtering.
- Price filtering.
- Color filtering.
- Size filtering when applicable.
- Rating filtering.
- Sorting.
- Pagination or infinite scrolling.
- Product cards.
- Wishlist.
- Add-to-cart.
- Loading state.
- Empty state.
- Error state.

### Product Details Page

Include:

- Product image gallery.
- Product thumbnails.
- Product name.
- Price.
- Discount information.
- Rating and reviews.
- Description.
- Specifications.
- Size selection.
- Color selection.
- Quantity selection.
- Stock information.
- Add-to-cart.
- Buy-now.
- Wishlist.
- Shipping information.
- Return policy.
- Related products.
- Recently viewed products when appropriate.

### Shopping Cart Page

Include:

- Cart items.
- Product images.
- Product information.
- Selected size and color.
- Quantity controls.
- Remove item.
- Subtotal.
- Discounts.
- Shipping.
- Taxes where applicable.
- Total.
- Promo code.
- Continue shopping.
- Checkout.
- Empty cart state.

### Checkout Page

Include:

- Customer information.
- Email.
- Phone.
- Shipping address.
- City.
- Province or state.
- Postal code.
- Country.
- Shipping methods.
- Order summary.
- Payment method.
- Validation.
- Error handling.
- Order submission.
- Order confirmation.

Integrate with existing payment functionality.

Never replace an existing payment provider without analyzing the implementation and compatibility.

### Authentication Pages

Login:

- Email.
- Password.
- Show/hide password.
- Remember me if supported.
- Forgot password.
- Validation.
- Loading state.
- Error handling.
- Redirect.
- Registration link.

Registration:

- First name.
- Last name.
- Email.
- Password.
- Confirm password.
- Password validation.
- Terms acceptance if appropriate.
- Loading state.
- Error handling.
- Success feedback.
- Login link.

Use the existing authentication system.

### User Profile Page

Include:

- Profile information.
- Profile editing.
- Password management.
- Address management.
- Order history.
- Order details.
- Order status.
- Wishlist.
- Logout.

Protect authenticated pages using the existing authentication architecture.

---

## 9. Reusable Components

Reuse existing components where possible.

Examples:

- Header.
- Navbar.
- MobileMenu.
- Footer.
- SearchBar.
- HeroSlider.
- PromotionalBannerSlider.
- CategoryCard.
- CategorySection.
- ProductCard.
- ProductGrid.
- ProductCarousel.
- ProductFilter.
- ProductSort.
- ProductGallery.
- ProductDetails.
- QuantitySelector.
- AddToCartButton.
- WishlistButton.
- CartItem.
- CartSummary.
- CheckoutForm.
- InputField.
- SelectField.
- Button.
- Modal.
- ToastNotification.
- LoadingSpinner.
- SkeletonLoader.
- EmptyState.
- ErrorState.
- Pagination.
- Breadcrumbs.

Do not create duplicate components when an existing component can be extended appropriately.

---

## 10. State Management

Analyze the existing state management system first.

Reuse the existing state management architecture.

If there is no suitable state management solution, use React Context API or another lightweight solution appropriate for the application.

Manage application state appropriately:

- Authentication.
- User information.
- Products.
- Categories.
- Shopping cart.
- Wishlist.
- Search.
- Filters.
- Checkout.
- Notifications.

Avoid unnecessary global state.

Keep local UI state local whenever possible.

Persist state appropriately.

Do not store sensitive authentication information insecurely.

Follow the backend authentication and session architecture.

---

## 11. API and Backend Integration

Preserve existing backend functionality.

Before implementing API integration:

- Inspect existing API endpoints.
- Inspect backend controllers.
- Inspect database models.
- Inspect authentication middleware.
- Inspect API services.
- Inspect request and response formats.
- Inspect error handling.
- Inspect existing payment integration.

### API Rules

- Reuse existing API endpoints.
- Reuse existing services.
- Follow existing API contracts.
- Do not fake successful API responses.
- Do not silently replace backend functionality with frontend-only logic.
- Do not hardcode production API URLs.
- Use existing environment variables.
- Handle network errors.
- Handle loading states.
- Handle validation errors.
- Handle authentication errors.
- Handle unexpected responses.

If an API does not exist:

1. Clearly identify the missing backend functionality.
2. Implement a frontend interface only when appropriate.
3. Do not pretend data was saved or submitted.
4. Document the required backend endpoint or functionality.
5. Keep the implementation compatible with future integration.

---

## 12. Dummy Data

Create or maintain a dummy_data.json file for development and testing when appropriate.

Use realistic, consistent sample data.

Include product data such as:

- Product ID.
- Name.
- Slug.
- Description.
- Price.
- Original price.
- Discount percentage.
- Images.
- Category.
- Subcategory.
- Brand.
- Colors.
- Sizes.
- Stock quantity.
- Rating.
- Review count.
- Featured status.
- New arrival status.
- Best seller status.
- Creation date.
- Specifications.

Include additional sample data when appropriate:

- Categories.
- Brands.
- Reviews.
- Promotional banners.
- Testimonials.
- Discount campaigns.

### Dummy Data Rules

- Use realistic product names.
- Use realistic prices.
- Maintain consistent data structures.
- Ensure IDs are unique.
- Ensure image references are valid.
- Avoid randomly generated data on every render.
- Do not use dummy data as a substitute for existing backend APIs.
- Clearly separate dummy data from production data.
- Do not claim dummy data was retrieved from the backend.

Use the existing data structure whenever possible.

---

## 13. Shopping Functionality

Implement functional shopping interactions.

- Product search.
- Product filtering.
- Product sorting.
- Pagination.
- Product details.
- Wishlist.
- Add to cart.
- Remove from cart.
- Update quantity.
- Cart calculations.
- Discount calculations.
- Shipping calculations.
- Tax calculations.
- Promo code validation if supported.
- Checkout validation.
- Order submission if supported.
- Order confirmation.

Ensure cart calculations are consistent.

Validate quantities and product availability.

Prevent invalid product selections.

Use backend validation for authoritative pricing, inventory, discounts, and orders.

Never trust frontend prices or totals when submitting an order.

---

## 14. Interaction and UI Behavior

All interactive elements must work.

Implement:

- Navigation.
- Mobile menu.
- Dropdowns.
- Search.
- Filters.
- Sorting.
- Product selection.
- Quantity controls.
- Add-to-cart.
- Wishlist.
- Slider navigation.
- Pagination.
- Form validation.
- Modal dialogs.
- Toast notifications.
- Loading states.
- Error states.
- Confirmation dialogs where appropriate.

Do not create buttons that only look functional.

Do not create broken links.

Provide clear feedback for user actions.

---

## 15. Loading, Empty and Error States

Implement appropriate states for data-driven functionality.

### Loading

- Product skeletons.
- Page loading.
- Button loading.
- Checkout loading.
- API loading.

### Empty

- Empty cart.
- Empty wishlist.
- No products.
- No search results.
- Empty category.
- No order history.

### Error

- Network errors.
- API errors.
- Authentication errors.
- Validation errors.
- Checkout errors.
- Unexpected errors.

Use clear and user-friendly messages.

Avoid displaying raw backend errors directly to users.

---

## 16. Security

Follow secure development practices.

- Never expose secret keys.
- Never expose private backend credentials.
- Never commit sensitive environment variables.
- Follow existing authentication architecture.
- Validate user input.
- Handle authorization properly.
- Protect authenticated routes.
- Follow secure payment integration practices.
- Avoid trusting frontend calculations.
- Avoid unsafe HTML rendering.
- Avoid insecure token storage.
- Follow existing backend security standards.

Do not weaken existing security mechanisms for convenience.

---

## 17. SEO

Implement appropriate SEO practices.

Use:

- Semantic HTML.
- Meaningful page titles.
- Meta descriptions.
- Canonical URLs when appropriate.
- Open Graph metadata.
- Appropriate heading hierarchy.
- Descriptive image alt text.
- Product metadata.
- Structured data where appropriate.
- SEO-friendly URLs.
- Sitemap support when applicable.
- Robots.txt where applicable.
- Appropriate indexing behavior for private pages.

Consider React-specific SEO limitations.

If the existing application is a client-side rendered SPA, evaluate the appropriate SEO approach without unnecessarily changing the architecture.

Do not promise SEO rankings.

---

## 18. Performance

Optimize the application appropriately.

- Lazy-load images.
- Optimize image sizes.
- Use responsive images where appropriate.
- Lazy-load routes when beneficial.
- Avoid unnecessary re-renders.
- Avoid unnecessary dependencies.
- Optimize product lists.
- Use pagination.
- Use reusable hooks.
- Avoid excessive API calls.
- Use caching when supported.
- Keep components focused.
- Avoid oversized assets.

Do not introduce premature optimization.

---

## 19. Accessibility

Follow accessibility best practices.

- Semantic HTML.
- Accessible labels.
- Keyboard navigation.
- Focus-visible styles.
- Accessible forms.
- Proper error messages.
- Screen-reader-friendly notifications.
- Accessible dropdowns.
- Accessible modal dialogs.
- Appropriate contrast.
- Meaningful alt text.
- Proper button labels.
- Keyboard-accessible navigation.
- Respect reduced-motion preferences.

Do not rely only on color to communicate information.

---

## 20. Testing

Test the relevant functionality after making changes.

Use the existing testing framework.

If testing tools already exist, use them.

Test appropriate areas:

- Navigation.
- Search.
- Product filtering.
- Sorting.
- Pagination.
- Product details.
- Wishlist.
- Add-to-cart.
- Cart quantity.
- Cart calculations.
- Authentication.
- Registration.
- Profile.
- Checkout.
- Form validation.
- API integration.
- Responsive layouts.
- Loading states.
- Empty states.
- Error states.

Run existing tests before major changes when practical.

Run relevant tests after implementation.

Do not claim tests passed if they were not executed.

If testing is not possible, clearly explain why.

---



## 22. Final Implementation Report

After completing a task, provide a concise report.

Include:

### Implemented

Describe the completed functionality.

### Files Created

List new files.

### Files Modified

List modified files.

### Testing

Describe tests and verification performed.

### Backend Requirements

Identify missing backend functionality, if any.

### Remaining Issues

Identify unfinished work, limitations, or potential improvements.

Do not claim functionality is complete when it has not been implemented or tested.

---

## 23. Final Project Goal

Maintain a professional, premium-quality, fully responsive e-commerce web application.

The application should have:

- Professional UI/UX.
- Consistent design system.
- Responsive layouts.
- Reusable React components.
- Functional shopping experience.
- Product search and filtering.
- Product details.
- Shopping cart.
- Wishlist.
- Checkout.
- Authentication.
- User profile.
- Backend integration.
- Accessible interfaces.
- SEO optimization.
- Performance optimization.
- Secure implementation.
- Maintainable code.
- Reliable functionality.

Always prioritize design quality, functionality, maintainability, compatibility, security, and user experience.

Build the entire application, not only the homepage.