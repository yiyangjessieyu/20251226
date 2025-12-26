# Instagram Post Summary Extractor

A web application that extracts and summarizes Instagram posts from HTML files.

## Features

- **Upload HTML Files**: Upload HTML files containing Instagram post data
- **Automatic Detection**: Automatically detects Instagram post links with patterns like `href="/p/POST_ID/"`
- **Post Summaries**: Extracts and displays summaries of all posts found
- **Instagram Links**: Provides direct links to view posts on Instagram
- **Download Summary**: Generate and download a clean HTML summary file
- **Responsive Design**: Works on desktop and mobile devices

## How to Use

1. **Open the Website**: Open `index.html` in your web browser
2. **Upload HTML File**: Click "Choose HTML File" and select your HTML file (like the cars.html example)
3. **Extract Posts**: Click "Extract Posts" to analyze the file
4. **View Results**: Browse through the extracted post summaries
5. **Download Summary**: Click "Download Summary" to save a clean HTML report

## Supported Post Types

- **Regular Posts**: Links with pattern `/p/POST_ID/`
- **Reels**: Links with pattern `/reel/REEL_ID/` or `/reels/REEL_ID/`

## Example

The application will convert Instagram post links like:
```
href="/p/DSfIVexDKRe/"
```

Into full Instagram URLs:
```
https://www.instagram.com/p/DSfIVexDKRe/
```

## File Structure

```
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
├── README.md           # This file
└── examples/
    └── cars.html       # Example HTML file with Instagram posts
```

## Technical Details

- **Pure JavaScript**: No external dependencies required
- **Client-Side Processing**: All processing happens in your browser
- **File Reading**: Uses FileReader API to process uploaded files
- **DOM Parsing**: Parses HTML content to extract Instagram links
- **Responsive Design**: Mobile-friendly interface

## Browser Compatibility

Works in all modern browsers that support:
- FileReader API
- ES6 Classes
- CSS Grid/Flexbox

## Privacy

- All processing is done locally in your browser
- No data is sent to external servers
- Files are processed entirely client-side