# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Start Development Server:**
```bash
npm start           # Start Metro bundler
```

**Build and Run:**
```bash
npm run android     # Build and run on Android (automatically sets up adb reverse)
npm run ios         # Build and run on iOS
```

**iOS Setup (first time or after dependency updates):**
```bash
bundle install      # Install Ruby gems for CocoaPods
bundle exec pod install  # Install iOS dependencies
```

**Code Quality:**
```bash
npm run lint        # Run ESLint
npm test           # Run Jest tests
```

## Architecture Overview

This is a React Native app (v0.79.2) built with TypeScript for a social media platform called "zusa_app". The app features user authentication, post creation/discovery, player profiles, and seat management functionality.

### Core Structure

- **Navigation**: React Navigation 7 with native stack navigator
- **State Management**: React Context (UserProfileContext) for global user state
- **API Layer**: Custom ApiClient with automatic token refresh and request interceptors
- **Authentication**: JWT-based with automatic token management via tokenManager

### Key Directories

- `src/screens/` - All screen components organized by feature
  - `Post/` - Post creation, discovery, search, and detail screens
  - `Profile/` - User profile management screens  
  - `Info/` - Multi-step onboarding screens (Step1-6)
  - `Seller/` - Business/seller specific screens
- `src/contexts/` - React contexts for global state
- `src/services/` - API client, auth service, token management
- `src/components/` - Reusable UI components
- `src/types/` - TypeScript type definitions
- `src/theme/` - Styling and color definitions
- `src/utils/` - Utility functions

### Authentication Flow

1. App checks token validity on startup via tokenManager
2. Routes to Login/Register if unauthenticated, Dashboard if authenticated  
3. ApiClient automatically refreshes tokens when they expire
4. UserProfileContext loads and manages current user data

### Post System

The app has a comprehensive post system with:
- Multiple post types (text, images, video)
- Discovery feed with infinite scroll
- Search functionality
- Detailed post view with comments/replies
- Post creation with media upload support
- Automatic video thumbnail generation using FFmpeg backend integration

### API Integration

- Base API client with automatic token injection
- Automatic token refresh on 401 responses
- FormData support for file uploads
- Video upload with progress tracking
- Video cover generation (automatic thumbnail extraction from first frame)
- Error handling and retry logic

## Native Dependencies

Key native modules used:
- `react-native-reanimated` - Animations (requires babel plugin)
- `react-native-gesture-handler` - Touch gestures
- `react-native-vector-icons` - Icon fonts
- `react-native-fast-image` - Optimized image loading
- `react-native-video` - Video playback
- `react-native-image-picker` - Camera/gallery access
- `react-native-linear-gradient` - Gradient backgrounds

## Testing

- Jest configured for unit testing
- Test files in `__tests__/` directory
- React test renderer for component testing

## Video Features

### Video Cover Generation
- Automatic thumbnail extraction from video first frame using FFmpeg
- Backend integration with MediaService for cover generation
- Fallback to placeholder images if generation fails
- Real-time display in discovery feed with cache busting
- URLs properly formatted with `/static/uploads/` prefix and timestamp parameters