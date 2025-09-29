# Brand Deck Sorter

A lightweight web application for sorting branding adjectives into four piles: **You Are**, **You Are Not**, **Indecisive**, and **Doesn't Apply**. Features drag & drop functionality, keyboard shortcuts, search & filters, and export/import capabilities.

## 🚀 Features

### Core Functionality
- **Four Sorting Piles**: You Are, You Are Not, Indecisive, Doesn't Apply
- **Unsorted Tray**: All cards start here for initial organization
- **Drag & Drop**: Move cards between piles and reorder within piles
- **Keyboard Shortcuts**: Quick sorting with number keys (1-4, 0)
- **Search & Filter**: Find cards by text or filter by pile
- **Language Toggle**: Switch between English and Italian text display

### Data Management
- **Auto-save**: Changes automatically saved to localStorage
- **Import/Export**: CSV and JSON format support
- **Session Management**: Name and manage multiple sessions
- **Undo/Redo**: Full history with keyboard shortcuts (⌘/Ctrl+Z)
- **URL Sharing**: Share sessions via compressed URLs

### Accessibility & UX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Keyboard Navigation**: Full keyboard support with focus indicators
- **ARIA Labels**: Screen reader friendly
- **Print Support**: Clean layout for printing/PDF generation

## 🎯 Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd branddeck

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### First Use

1. **Import Cards**: Click "Import/Export" → "Import" → Upload a CSV file or paste content
2. **Start Sorting**: Drag cards from the Unsorted tray to the appropriate piles
3. **Use Keyboard Shortcuts**: Focus a card and press 1-4 to move to piles, 0 for unsorted
4. **Save Your Work**: Everything auto-saves, but you can export for backup

## 📋 CSV Format

The app accepts CSV files with the following format:

```csv
text_en,text_it
confident,sicuro
playful,giocoso
professional,professionale
creative,creativo
reliable,affidabile
```

- **text_en**: English text (required)
- **text_it**: Italian text (required)
- **Encoding**: UTF-8 (supports accents and special characters)

## ⌨️ Keyboard Shortcuts

### Card Sorting (when card is focused)
- **1**: Move to "You Are" pile
- **2**: Move to "You Are Not" pile  
- **3**: Move to "Indecisive" pile
- **4**: Move to "Doesn't Apply" pile
- **0**: Move to "Unsorted" tray
- **Delete/Backspace**: Remove card

### Global Shortcuts
- **⌘/Ctrl + Z**: Undo last action
- **⌘/Ctrl + Shift + Z**: Redo last undone action
- **Tab**: Navigate between elements
- **Enter**: Confirm actions in dialogs

## 🔧 Technical Details

### Built With
- **Next.js 14** (App Router) with TypeScript
- **Tailwind CSS** for styling
- **Zustand** for state management
- **@dnd-kit** for drag & drop functionality
- **Papa Parse** for CSV processing
- **lz-string** for URL compression

### Project Structure
```
src/
├── app/                 # Next.js app router
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Main page
│   └── globals.css     # Global styles
├── components/         # React components
│   ├── Card.tsx        # Individual card component
│   ├── Column.tsx      # Pile column component
│   ├── UnsortedTray.tsx # Unsorted cards tray
│   ├── Toolbar.tsx     # Top toolbar
│   ├── ImportExportDialog.tsx # Import/export modal
│   └── AddCardsDialog.tsx # Add cards modal
├── lib/               # Utility functions
│   ├── types.ts       # TypeScript type definitions
│   ├── storage.ts     # localStorage utilities
│   ├── csv.ts         # CSV import/export
│   └── urlshare.ts    # URL sharing utilities
└── store/             # State management
    └── useDeckStore.ts # Zustand store
```

### Data Model

```typescript
interface Card {
  id: string;           // Unique identifier
  text_en: string;      // English text
  text_it: string;      // Italian text
  pile: Pile;           // Current pile assignment
  order: number;        // Sort order within pile
}

type Pile = 'UNSORTED' | 'YOU_ARE' | 'YOU_ARE_NOT' | 'INDECISIVE' | 'DOES_NOT_APPLY';
```

## 📤 Import/Export

### Export Formats

**CSV Export** (`cards.csv`):
```csv
text_en,text_it,pile,order
confident,sicuro,YOU_ARE,0
playful,giocoso,UNSORTED,1
```

**JSON Export** (`session.json`):
```json
{
  "session": {
    "id": "session-id",
    "name": "My Session",
    "cards": [...],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "language": "en",
  "exportedAt": "2024-01-01T00:00:00.000Z"
}
```

### URL Sharing

Sessions can be shared via URL with compressed data:
```
https://your-domain.com/#compressed-session-data
```

## 🎨 Customization

### Styling
- Modify `tailwind.config.js` for theme customization
- Update `src/app/globals.css` for global styles
- Component styles use Tailwind utility classes

### Adding Features
- New pile types: Update `types.ts` and `PILE_LABELS`
- Custom keyboard shortcuts: Modify `Card.tsx` and `Toolbar.tsx`
- Additional export formats: Extend `csv.ts` and `storage.ts`

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables if needed
vercel env add
```

### Other Platforms
- **Netlify**: Connect GitHub repository
- **Railway**: Deploy with `railway up`
- **Docker**: Use included Dockerfile

## 🐛 Troubleshooting

### Common Issues

**Cards not loading**: Check CSV format and encoding (must be UTF-8)

**Drag & drop not working**: Ensure JavaScript is enabled and no browser extensions are blocking

**Data not saving**: Check localStorage is available and not full

**Import errors**: Verify CSV has `text_en,text_it` headers

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting section above
- Review the keyboard shortcuts and CSV format requirements

---

**Happy Sorting! 🎯**