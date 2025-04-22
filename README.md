# Brainrot Dictionary App

A modern slang dictionary app built with React Native and Expo.

## Features

- Search for slang words and terms
- View definitions, examples, and usage
- User profiles and favorites
- Quizzes to test your knowledge
- Trending words section

## Algolia Search Integration

This app uses Algolia for lightning-fast, typo-tolerant search capabilities through Firebase Extensions.

### Setup Instructions

1. **Install the Firebase Algolia Extension**:
   - Go to your Firebase console
   - Navigate to Extensions
   - Install the "Algolia Search" extension
   - Follow the extension setup process

2. **Configure Algolia Index Settings**:
   - In your Algolia dashboard, go to your index
   - Set up searchable attributes (usually "word", "definition", "example")
   - Configure custom ranking (e.g., by popularity or date)
   - Set up synonyms if needed

3. **Add Algolia Credentials to Your App**:
   - Update the `app.json` extra section with your Algolia app ID and search key
   ```json
   "extra": {
     "EXPO_PUBLIC_ALGOLIA_APP_ID": "your-algolia-app-id",
     "EXPO_PUBLIC_ALGOLIA_SEARCH_KEY": "your-algolia-search-key"
   }
   ```

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

## Tech Stack

- React Native
- Expo Router
- Firebase (Authentication, Firestore)
- Algolia (Search)
- NativeWind (TailwindCSS for React Native)

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/brainrot-app.git
cd brainrot-app
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm start
# or
yarn start
```

4. Open the app on your device using the Expo Go app or run it on an emulator

## Design

The app features a light theme with mint green and white as the primary colors, creating a fresh and modern look. The UI is designed to be clean, intuitive, and easy to navigate.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 