# Mental Math App - Frontend

A beautiful, modern mental math practice application with stunning 3D graphics and smooth animations.

## Features

- 🎨 **Stunning 3D Background**: Shimmering, rotating 3D boxes in the background using Three.js
- 📊 **Statistics Dashboard**: Track your progress with detailed statistics
- 🎯 **Practice Mode**: Solve mental math problems with adjustable difficulty levels
- 🔐 **User Authentication**: Sign up and sign in pages (ready for backend integration)
- ✨ **Modern UI**: Glassmorphism design with smooth animations using Framer Motion
- 📱 **Responsive Design**: Works beautifully on all screen sizes

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Three.js** - 3D graphics
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for react-three/fiber
- **Framer Motion** - Animation library
- **React Router** - Client-side routing

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Background3D.jsx # 3D animated background
│   └── Navigation.jsx   # Navigation bar
├── pages/               # Page components
│   ├── Home.jsx        # Landing page
│   ├── Login.jsx       # Sign in page
│   ├── SignUp.jsx      # Registration page
│   ├── Practice.jsx    # Math practice game
│   └── Stats.jsx       # Statistics dashboard
├── App.jsx             # Main app component with routing
├── App.css             # Global app styles
└── index.css           # Base styles
```

## Features Overview

### 3D Background
- 20 floating, shimmering boxes with metallic materials
- Smooth rotation and floating animations
- Dynamic lighting with colored point lights
- Auto-rotating camera for immersive experience

### Practice Mode
- Three difficulty levels: Easy, Medium, Hard
- Real-time score tracking
- Timer for each problem
- Visual feedback for correct/incorrect answers
- Automatic problem generation

### Statistics Dashboard
- Total problems solved
- Accuracy percentage
- Current streak
- Average time per problem
- Progress bars and visualizations

## Backend Integration (Future)

The frontend is designed to be easily integrated with a backend. The following areas are ready for API connections:

- **Authentication**: Login and SignUp pages have form handlers ready
- **Statistics**: Stats page uses mock data that can be replaced with API calls
- **User Progress**: Practice mode can save results to backend

## Development

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Notes

- The app currently uses mock data for statistics
- Authentication forms are functional but don't connect to a backend yet
- All styling is done with inline styles for simplicity
- The 3D background is optimized for performance

## Next Steps

- [ ] Integrate backend API for authentication
- [ ] Connect statistics to backend database
- [ ] Add user profile management
- [ ] Implement leaderboards
- [ ] Add more problem types (division, exponents, etc.)
- [ ] Add sound effects and haptic feedback

## License

MIT
