# KLM Emma — Virtual Journey Guide

## Setup

1. Copy `emma-video.mp4` into the `/public` folder
2. Create `.env.local` with your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```
3. Install and run:
   ```
   npm install
   npm run dev
   ```

## Deploy to Vercel

1. Push this folder to a GitHub repo
2. Go to vercel.com → New Project → Import your repo
3. In Environment Variables, add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your Anthropic API key
4. Deploy — done

**Important:** Also upload `emma-video.mp4` to your repo inside `/public/`
so Vercel serves it. Keep the file under 100MB.
