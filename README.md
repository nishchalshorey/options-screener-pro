# Options Income Screener Pro

A production-ready mobile-friendly web application for analyzing options chains and ranking the best candidates for income strategies (Cash Secured Puts and Covered Calls).

## Features

✅ **Upload & Auto-Detection**
- Drag-and-drop CSV upload
- Automatic column header detection
- Manual column mapping when needed
- Supports various CSV formats from different brokers

✅ **Strategy Analysis**
- Cash Secured Put analysis
- Covered Call analysis
- Customizable filters for DTE, Delta, Liquidity
- Event risk detection (earnings, ex-dividend)

✅ **Advanced Scoring Algorithm**
- Transparent scoring with detailed breakdown
- Penalty system for spread, liquidity, delta, events, volatility
- Annualized ROC calculations
- Probability of profit estimates

✅ **Mobile-First Design**
- Responsive card view for mobile
- Desktop table view with sorting
- Works perfectly on iPhone Safari
- PWA support (add to home screen)

✅ **No External Dependencies**
- No API keys required
- No live market data fetching
- All calculations performed locally
- Works completely offline after initial load

## CSV Format

### Required Columns
Your CSV must contain these columns (names are flexible):

- **Strike** (or Strike Price)
- **Bid** (or Bid Price)
- **Ask** (or Ask Price)
- **Expiration** (or Expiry, Expiration Date)

### Optional Columns
These enhance analysis but aren't required:

- **Delta**
- **Open Interest** (or OI)
- **Volume** (or Vol)
- **Implied Volatility** (or IV)
- **Ticker** (or Symbol)
- **Earnings Date**
- **Ex-Dividend Date**
- **Theta**
- **Vega**

### Sample CSV

A sample CSV file is included at `/public/sample-options.csv`. Download it to test the application.

Example format:
```csv
Strike,Bid,Ask,Expiration,Delta,Open Interest,Volume,Implied Volatility,Ticker
95,1.25,1.35,2026-04-17,-0.25,2500,450,0.32,AAPL
100,2.50,2.65,2026-04-17,-0.35,3200,820,0.35,AAPL
```

## How the Scoring Works

### Base Score
```
Base Score = Annualized ROC × 100 × Probability of Profit
```

Where:
- **Annualized ROC** = ROC × (365 / DTE)
- **Probability of Profit** ≈ 1 - |Delta|

### Penalties

1. **Spread Penalty** = Spread % × 100
2. **Liquidity Penalty**
   - +5 if Open Interest < 1000
   - +5 if Volume < 100
3. **Delta Penalty** = (|Delta| - 0.30) × 50 (if |Delta| > 0.30)
4. **Event Penalty**
   - +25 if earnings occurs before expiration
   - +25 if ex-dividend occurs before expiration (covered calls only)
5. **Volatility Penalty** = +10 if IV > 1.75× median IV

### Final Score
```
Final Score = Base Score - All Penalties
```

## Key Metrics Explained

### For Cash Secured Puts
- **Capital Required** = Strike × 100
- **Breakeven** = Strike - Premium Received
- **ROC** = Premium / Capital Required

### For Covered Calls
- **Capital Reference** = Stock Price × 100
- **Call Away Price** = Strike + Premium Received
- **Premium Cushion** = Premium Received
- **ROC** = Premium / Capital Reference

### Common Calculations
- **Mid** = (Bid + Ask) / 2
- **Spread** = Ask - Bid
- **Spread %** = Spread / Mid
- **Estimated Fill** = Max(0, Mid - 0.25 × Spread)
- **Premium Dollars** = Estimated Fill × 100
- **DTE** = Days to Expiration

## Installation & Development

### Prerequisites
- Node.js 18+ and npm

### Local Development

1. **Clone or download the repository**

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

4. **Open in browser**
Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

## Deployment to Vercel

### Quick Deploy

1. **Install Vercel CLI** (optional)
```bash
npm i -g vercel
```

2. **Deploy**
```bash
vercel
```

Or simply:
- Push to GitHub
- Import in Vercel dashboard
- Deploy automatically

### Environment Variables
None required! The app runs entirely client-side.

## Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **CSV Parsing:** PapaParse
- **Fonts:** Crimson Pro, Work Sans, JetBrains Mono

## Browser Support

- ✅ Chrome/Edge (desktop & mobile)
- ✅ Safari (desktop & mobile)
- ✅ Firefox (desktop & mobile)
- ✅ iOS Safari (iPhone/iPad)
- ✅ Samsung Internet

## PWA Features

The app can be installed as a Progressive Web App:

1. Open the app in Safari on iPhone
2. Tap the Share button
3. Select "Add to Home Screen"
4. The app will function like a native app

## File Structure

```
options-screener-pro/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout with metadata
│   └── page.tsx             # Main application page
├── components/
│   ├── FileUpload.tsx       # CSV upload component
│   ├── ColumnMapping.tsx    # Column mapping interface
│   ├── FilterControls.tsx   # Filter configuration
│   └── ResultsTable.tsx     # Results display
├── types/
│   └── index.ts             # TypeScript type definitions
├── utils/
│   ├── columnDetection.ts   # Auto-detect CSV columns
│   ├── csvParser.ts         # Parse CSV rows
│   ├── dateUtils.ts         # Date parsing and DTE
│   ├── formatting.ts        # Display formatting
│   └── optionsAnalysis.ts   # Core calculation engine
├── public/
│   ├── manifest.json        # PWA manifest
│   └── sample-options.csv   # Sample data file
└── package.json
```

## Usage Tips

1. **Export from your broker** - Most brokers allow CSV export of option chains
2. **Check column names** - The app will auto-detect most formats
3. **Start with conservative filters** - Use min OI of 100, min volume of 10
4. **Pay attention to spread** - Wide spreads reduce fill quality
5. **Check event risk** - Enable earnings/dividend filters for safety
6. **Sort by different metrics** - Click column headers in desktop view
7. **View details** - Click any option to see full scoring breakdown

## Limitations

- No real-time data (upload only)
- No portfolio tracking
- No backtesting
- Calculations are estimates, not guarantees

## Disclaimer

**Options involve risk and are not suitable for all investors.**

This tool is for research and educational purposes only. It does not constitute investment advice. Past performance does not guarantee future results. All calculations are estimates based on uploaded data and theoretical models. Actual trading results may differ.

Always:
- Do your own research
- Understand the risks
- Consult with a financial advisor
- Never invest more than you can afford to lose

## Support

For issues or questions:
- Check the CSV format requirements
- Try the sample CSV file
- Review the scoring methodology
- Ensure all required columns are mapped

## License

MIT License - Free for personal and commercial use

---

**Built with ❤️ for options traders**
