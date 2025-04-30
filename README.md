# Brand AI

Generate brand concepts with AI. Create names, slogans, and logo images in minutes.

## Features

- Create brand concepts with AI-generated names and slogans
- Edit and approve concepts
- Generate high-quality logo images using DALL-E 3
- Save and view your generated brands

## Getting Started

### Prerequisites

- Node.js 18+
- OpenAI API key

### Installation

1. Clone this repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Usage

1. **Create a Brand Brief**: Enter your brand requirements, desired vibe, and keywords.
2. **Review Concepts**: Edit and approve the generated concepts.
3. **Generate Images**: Create logo images for your approved concepts.
4. **View Library**: Access all your previously generated brands.

## Cost Considerations

This application uses OpenAI's APIs which have associated costs:
- GPT-4o Mini for text generation: ~$0.15 per brand brief
- DALL-E 3 for image generation: ~$0.04 per image (high quality)

Plan your usage accordingly to manage costs.

## Tech Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- Zustand for state management
- OpenAI API

## License

[MIT](LICENSE)