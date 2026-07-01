import { create } from "zustand";

export interface ChatFile {
  name: string;
  size: string;
  type: string;
  dataUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  files?: ChatFile[];
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface Conversation {
  id: string;
  title: string;
  model: string;
  temperature: number;
  messages: ChatMessage[];
  tokenUsage: TokenUsage;
  createdAt: string;
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isStreaming: boolean;
  streamingContent: string;
  abortController: AbortController | null;
  
  selectConversation: (id: string | null) => void;
  startNewConversation: (model?: string) => string;
  deleteConversation: (id: string) => void;
  updateConversationSettings: (id: string, settings: Partial<Pick<Conversation, "model" | "temperature">>) => void;
  
  sendMessage: (content: string, files?: ChatFile[]) => Promise<void>;
  stopGeneration: () => void;
  regenerateMessage: (messageId: string) => Promise<void>;
}

const mockConversations: Conversation[] = [
  {
    id: "conv_1",
    title: "Vite Deployment on AWS Amplify",
    model: "Gemini 1.5 Pro",
    temperature: 0.4,
    createdAt: "2026-06-27T10:00:00Z",
    tokenUsage: { promptTokens: 420, completionTokens: 980, totalTokens: 1400 },
    messages: [
      { id: "msg_1", role: "user", content: "How do I configure a custom build command for a Vite + React project deployed on AWS Amplify?", timestamp: "2026-06-27T10:01:00Z" },
      {
        id: "msg_2",
        role: "assistant",
        content: `To deploy a Vite-based React project on AWS Amplify, you must modify the build settings (\`amplify.yml\`) to point to Vite's default output directory, which is \`dist\` (rather than \`build\`).

Here is a standard \`amplify.yml\` build specification:

\`\`\`yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
\`\`\`

### Steps to Apply:
1. Open the AWS Amplify Console.
2. Select your application and navigate to **App Settings** > **Build Settings**.
3. Edit the build YAML config to match the snippet above, ensuring \`baseDirectory\` is set to \`dist\`.
4. Click **Save** and trigger a new deployment.`,
        timestamp: "2026-06-27T10:02:00Z"
      }
    ]
  },
  {
    id: "conv_2",
    title: "Tailwind Grid vs Flexbox Layouts",
    model: "Gemini 1.5 Flash",
    temperature: 0.7,
    createdAt: "2026-06-26T14:00:00Z",
    tokenUsage: { promptTokens: 150, completionTokens: 310, totalTokens: 460 },
    messages: [
      { id: "msg_3", role: "user", content: "When should I use CSS Grid over Flexbox in Tailwind?", timestamp: "2026-06-26T14:01:00Z" },
      {
        id: "msg_4",
        role: "assistant",
        content: `As a general rule, use **CSS Grid** for two-dimensional layouts (rows AND columns) and **Flexbox** for one-dimensional layouts (rows OR columns).

### Use CSS Grid when:
- You need a structured grid of items (like a Dashboard widgets grid, a photogallery, or an interactive Kanban board).
- You want to specify gap sizes between columns and rows easily (e.g., \`grid grid-cols-1 md:grid-cols-3 gap-6\`).
- You need precise alignment for elements in both horizontal and vertical directions.

### Use Flexbox when:
- You are building header navbars, list cards, or badges containers.
- The size of elements should dictate their spacing (dynamic widths).
- You need to easily reverse alignment (\`flex-row-reverse\`) or stack vertical items (\`flex-col\`).`,
        timestamp: "2026-06-26T14:02:00Z"
      }
    ]
  }
];

const mockAnswers = [
  "I can certainly help you set that up. Let's walk through the configuration options.",
  "Here is a complete code block representing the solution you requested:\n\n```typescript\nimport React from 'react';\n\ninterface CardProps {\n  title: string;\n  description: string;\n}\n\nexport const PremiumCard: React.FC<CardProps> = ({ title, description }) => {\n  return (\n    <div className=\"p-6 rounded-2xl bg-white dark:bg-card border border-border/80 shadow-md hover:shadow-xl transition-all duration-300\">\n      <h3 className=\"text-lg font-semibold text-foreground\">{title}</h3>\n      <p className=\"mt-2 text-sm text-muted-foreground\">{description}</p>\n    </div>\n  );\n};\n```\nLet me know if you would like me to add extra animations or variants to this component.",
  "Based on the analysis of your files, the main error is caused by a missing import statement at the top of your index file. Ensure you import the styling packages before loading components.",
  "Great question. Let's analyze the performance metrics. When querying large databases, introducing indexes on foreign keys dramatically accelerates lookups by up to 10x.",
  "Here is how you can write a test case to validate the custom hook output:\n\n```javascript\ndescribe('useWorkspace', () => {\n  it('should return initial projects', () => {\n    const { result } = renderHook(() => useWorkspaceStore());\n    expect(result.current.projects.length).toBeGreaterThan(0);\n  });\n});\n```"
];

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: mockConversations,
  activeConversationId: "conv_1",
  isStreaming: false,
  streamingContent: "",
  abortController: null,
  
  selectConversation: (id) => set({ activeConversationId: id, isStreaming: false, streamingContent: "" }),
  
  startNewConversation: (model = "Gemini 1.5 Pro") => {
    const newId = `conv_${Math.random().toString(36).substr(2, 9)}`;
    const newConv: Conversation = {
      id: newId,
      title: "New AI Session",
      model,
      temperature: 0.7,
      createdAt: new Date().toISOString(),
      tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      messages: []
    };
    
    set((state) => ({
      conversations: [newConv, ...state.conversations],
      activeConversationId: newId
    }));
    return newId;
  },
  
  deleteConversation: (id) => set((state) => {
    const filtered = state.conversations.filter((c) => c.id !== id);
    let nextActive = state.activeConversationId;
    if (state.activeConversationId === id) {
      nextActive = filtered.length > 0 ? filtered[0].id : null;
    }
    return {
      conversations: filtered,
      activeConversationId: nextActive,
      isStreaming: false,
      streamingContent: ""
    };
  }),

  updateConversationSettings: (id, settings) => set((state) => ({
    conversations: state.conversations.map((c) => c.id === id ? { ...c, ...settings } : c)
  })),

  sendMessage: async (content, files) => {
    const { conversations, activeConversationId, isStreaming } = get();
    if (isStreaming || !activeConversationId) return;

    const controller = new AbortController();
    
    // Create user message
    const userMsg: ChatMessage = {
      id: `msg_${Math.random().toString(36).substr(2, 9)}`,
      role: "user",
      content,
      timestamp: new Date().toISOString(),
      files
    };

    // Add user message to active conversation
    set((state) => ({
      conversations: state.conversations.map((c) => {
        if (c.id !== activeConversationId) return c;
        const newTitle = c.messages.length === 0 ? content.substring(0, 30) : c.title;
        return {
          ...c,
          title: newTitle,
          messages: [...c.messages, userMsg],
          tokenUsage: {
            ...c.tokenUsage,
            promptTokens: c.tokenUsage.promptTokens + Math.floor(content.length / 4) + (files ? files.length * 100 : 0)
          }
        };
      })
    }));

    // Trigger AI response streaming
    set({ isStreaming: true, streamingContent: "", abortController: controller });

    const fullResponse = mockAnswers[Math.floor(Math.random() * mockAnswers.length)];
    const words = fullResponse.split(" ");
    let tempContent = "";
    
    for (let i = 0; i < words.length; i++) {
      if (controller.signal.aborted) {
        break;
      }
      // Wait for a simulated output tick
      await new Promise((resolve) => setTimeout(resolve, 60 + Math.random() * 50));
      tempContent += (i === 0 ? "" : " ") + words[i];
      set({ streamingContent: tempContent });
    }

    if (!controller.signal.aborted) {
      const assistantMsg: ChatMessage = {
        id: `msg_${Math.random().toString(36).substr(2, 9)}`,
        role: "assistant",
        content: tempContent,
        timestamp: new Date().toISOString()
      };

      set((state) => ({
        isStreaming: false,
        streamingContent: "",
        abortController: null,
        conversations: state.conversations.map((c) => {
          if (c.id !== activeConversationId) return c;
          const outTokens = Math.floor(tempContent.length / 4);
          return {
            ...c,
            messages: [...c.messages, assistantMsg],
            tokenUsage: {
              ...c.tokenUsage,
              completionTokens: c.tokenUsage.completionTokens + outTokens,
              totalTokens: c.tokenUsage.promptTokens + c.tokenUsage.completionTokens + outTokens
            }
          };
        })
      }));
    }
  },

  stopGeneration: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
    }
    set({ isStreaming: false, streamingContent: "", abortController: null });
  },

  regenerateMessage: async (messageId) => {
    const { conversations, activeConversationId, isStreaming } = get();
    if (isStreaming || !activeConversationId) return;

    // Filter out messages after the target message (if user wants to regenerate)
    const conv = conversations.find((c) => c.id === activeConversationId);
    if (!conv) return;

    const messageIndex = conv.messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1) return;

    // Remove the message and subsequent ones
    const newMessages = conv.messages.slice(0, messageIndex);
    const lastUserMessage = newMessages[newMessages.length - 1];
    
    if (!lastUserMessage || lastUserMessage.role !== "user") return;

    // Set conversations messages without the assistant response
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === activeConversationId ? { ...c, messages: newMessages } : c
      )
    }));

    // Trigger send flow again
    await get().sendMessage(lastUserMessage.content, lastUserMessage.files);
  }
}));
