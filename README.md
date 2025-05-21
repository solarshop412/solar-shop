# Solar Shop

A modern e-commerce application for solar products built with Angular 19.

## Technologies Used

- **Angular 19**: The latest version of Angular framework
- **Tailwind CSS 4**: For styling and responsive design
- **Supabase**: For authentication and storage
- **NgRx**: For state management

## Features

- User authentication (login, signup, logout)
- Protected routes with authentication guards
- Responsive UI with Tailwind CSS
- State management with NgRx

## Getting Started

### Prerequisites

- Node.js 18+ and npm installed
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Configure Supabase:
   - Create a Supabase project
   - Update the Supabase URL and key in `src/environments/environment.ts` and `src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: false, // or true for production
  supabase: {
    url: 'YOUR_SUPABASE_URL',
    anon_key: 'YOUR_SUPABASE_ANON_KEY'
  }
};
```

### Running the Application

```bash
npm start
```

The application will be available at http://localhost:4200.

### Building for Production

```bash
npm run build
```

## Project Structure

- **components**: Angular components
  - **auth**: Authentication components (login, signup)
  - **home**: Home page component
- **services**: Application services
  - **supabase.service.ts**: Supabase authentication and storage service
- **state**: NgRx state management
  - **auth**: Authentication state (actions, effects, reducer, state)
- **guards**: Route guards
  - **auth.guard.ts**: Authentication guard

## Supabase Setup

1. Create a new Supabase project
2. Set up authentication
   - Enable Email/Password provider
   - Configure email templates if needed
3. Set up storage buckets for file uploads

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
