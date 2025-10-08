# AGENTS.md

This file provides guidance to any LLM model when working with code in this repository.

## Project Overview

Agent Chat UI is a Next.js 15 application that provides a chat interface for LangGraph servers. It uses React 19, TypeScript, and Tailwind CSS v4. The app connects to any LangGraph server with a `messages` key and enables real-time streaming conversations with LangGraph agents.

Key integration points:
- **LangGraph SDK**: Uses `@langchain/langgraph-sdk` for streaming and state management
- **AWS Cognito**: Authentication via AWS Amplify with OAuth (Google)
- **API Passthrough**: Uses `langgraph-nextjs-api-passthrough` for production deployments

## Development Commands

```bash
# Install dependencies (uses pnpm)
pnpm install

# Run development server (runs on port 4200, not 3000)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint
pnpm lint

# Lint with auto-fix
pnpm lint:fix

# Format code
pnpm format

# Check formatting
pnpm format:check
```

## Architecture

### Core Provider Pattern

The app uses a nested provider architecture wrapping the entire application:

1. **AuthProvider** (`src/providers/Auth.tsx`): AWS Amplify authentication wrapper using Cognito
2. **ThreadProvider** (`src/providers/Thread.tsx`): Manages thread list and thread operations
3. **StreamProvider** (`src/providers/Stream.tsx`): Core LangGraph streaming connection

The StreamProvider is particularly important as it:
- Initializes the `useStream` hook from LangGraph SDK
- Manages connection to LangGraph server via `apiUrl`, `apiKey`, and `assistantId`
- Handles JWT authentication by fetching from AWS Amplify session
- Manages UI message state with `uiMessageReducer`
- Shows setup form if environment variables are not configured

### Authentication Flow

1. App checks for AWS Amplify session and retrieves JWT token
2. JWT is passed as `Authorization: Bearer ${jwt}` header in all LangGraph requests
3. StreamProvider waits for JWT before rendering chat interface (shows skeleton while loading)
4. API passthrough in `src/app/api/[..._path]/route.ts` handles proxying to LangGraph

### State Management

- **Thread state**: Managed by `ThreadProvider` with list of conversations
- **Stream state**: Managed by `useStream` hook with shape `{ messages: Message[], ui?: UIMessage[] }`
- **UI messages**: Special messages for rendering custom UI components, reduced via `uiMessageReducer`

### Message Rendering

Messages support:
- Standard text with markdown (using `react-markdown`, `remark-gfm`, `remark-math`, `rehype-katex`)
- Tool calls display
- Multimodal content (images, files)
- Artifacts (side panel rendering via `thread.meta.artifact`)
- Message filtering via `do-not-render-` ID prefix and `langsmith:nostream` tag

### Agent Inbox / Interrupts

The app supports LangGraph interrupts via the Agent Inbox pattern (`src/components/thread/agent-inbox/`). When a LangGraph agent sends a `HumanInterrupt`:
- Detection happens via `isAgentInboxInterruptSchema` in `src/lib/agent-inbox-interrupt.ts`
- UI renders `ThreadView` component with action buttons (respond, accept, edit, ignore)
- State and description views available in side panel
- Uses `useInterruptedActions` hook to manage interrupt state

## Environment Variables

Required for local development (see `.env.example`):

```bash
# LangGraph connection
NEXT_PUBLIC_API_URL=http://localhost:2024
NEXT_PUBLIC_ASSISTANT_ID=agent

# AWS Cognito authentication
NEXT_PUBLIC_COGNITO_USER_POOL_ID=
NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID=
NEXT_PUBLIC_COGNITO_DOMAIN=
NEXT_PUBLIC_COGNITO_RESPONSE_TYPE=token
```

For production with API passthrough:
```bash
LANGGRAPH_API_URL=https://my-agent.default.us.langgraph.app
LANGSMITH_API_KEY=lsv2_...
NEXT_PUBLIC_API_URL=https://my-website.com/api
```

## Docker Deployment

The Dockerfile uses multi-stage builds:
1. **deps**: Installs dependencies
2. **builder**: Builds Next.js app with `output: 'standalone'`
3. **runner**: Production image exposing port 80

Build args needed:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_ASSISTANT_ID`
- `NEXT_PUBLIC_COGNITO_USER_POOL_ID`
- `NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID`
- `NEXT_PUBLIC_COGNITO_DOMAIN`
- `NEXT_PUBLIC_COGNITO_RESPONSE_TYPE`

## Key Files to Modify

- **Stream connection logic**: `src/providers/Stream.tsx` (modify `useTypedStream` call for custom headers/auth)
- **API proxy**: `src/app/api/[..._path]/route.ts` (customize passthrough behavior)
- **Message rendering**: `src/components/thread/messages/` (add custom message types)
- **Authentication**: `src/providers/Auth.tsx` (modify Cognito config or switch auth providers)

## Common Patterns

### Adding Custom UI Messages

1. Define UI message type extending `UIMessage` from `@langchain/langgraph-sdk/react-ui`
2. Add handler in `StreamProvider`'s `onCustomEvent` callback
3. Create component in `src/components/thread/` that uses `useStreamContext()`
4. Emit from LangGraph server as custom event

### Modifying Authentication

If not using AWS Cognito:
1. Replace `AuthProvider` in `src/providers/Auth.tsx`
2. Update JWT fetching logic in `StreamProvider` (`fetchAuthSession` call)
3. Update `defaultHeaders` in `useTypedStream` with your auth token

### Hiding Messages

- **During streaming**: Add `langsmith:nostream` tag to chat model config
- **Permanently**: Prefix message ID with `do-not-render-` before saving to state
