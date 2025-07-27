const environment = require("../config/environment");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const {
  HumanMessage,
  SystemMessage,
  AIMessage,
} = require("@langchain/core/messages");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { RunnableSequence } = require("@langchain/core/runnables");
const { v4: uuidv4 } = require("uuid");

class LangChainGeminiService {
  constructor() {
    this.apiKey = environment.env.GOOGLE_API_KEY;
    this.maxTokens = parseInt(environment.env.MAX_TOKENS) || 8192;
    this.temperature = parseFloat(environment.env.TEMPERATURE) || 0.7;
    this.modelName = environment.env.MODEL_NAME || "gemini-2.5-flash";

    console.log("LangChainGeminiService initialization:");
    console.log("- API Key exists:", !!this.apiKey);
    console.log("- Model name:", this.modelName);
    console.log("- Max tokens:", this.maxTokens);

    if (!this.apiKey) {
      throw new Error("GOOGLE_API_KEY not found in environment variables");
    }

    // Initialize LangChain Gemini model
    this.model = new ChatGoogleGenerativeAI({
      apiKey: this.apiKey,
      modelName: this.modelName,
      temperature: this.temperature,
      maxOutputTokens: this.maxTokens,
    });

    // Gaming store system prompt
    this.systemPrompt = `You are GameZone AI Assistant, a knowledgeable and enthusiastic gaming expert working for GameZone - a professional gaming store. Your role is to:

1. **Product Expert**: Help customers find the perfect gaming products (PC components, consoles, accessories, mobile gaming gear)
2. **Gaming Advisor**: Provide gaming recommendations, setup advice, and technical support
3. **Store Assistant**: Answer questions about deals, shipping, returns, and store policies
4. **Gaming Enthusiast**: Discuss gaming trends, new releases, and gaming culture

**Store Information:**
- Store Name: GameZone
- Specialties: PC Gaming, Consoles, Gaming Accessories, Mobile Gaming
- Current Hot Deal: Gaming Setup Bundle for $899 (originally $1,299)
- Contact: +1 (555) 123-4567, info@gamezone.com
- Location: 123 Gaming St, Tech City

**Personality:**
- Enthusiastic about gaming
- Knowledgeable and helpful
- Friendly and professional
- Uses gaming terminology appropriately
- Focuses on customer satisfaction

Always be helpful, stay within gaming/tech topics, and promote GameZone products when relevant. If asked about non-gaming topics, politely redirect to gaming-related assistance.`;

    // Initialize conversation memory
    this.conversations = new Map();

    // Initialize the chain
    this.initializeChain();
  }

  initializeChain() {
    // Create prompt template
    this.promptTemplate = ChatPromptTemplate.fromMessages([
      ["system", this.systemPrompt],
      ["human", "{input}"],
    ]);

    // Create the chain
    this.chain = RunnableSequence.from([
      this.promptTemplate,
      this.model,
      new StringOutputParser(),
    ]);
  }

  // Generate response using LangChain
  async generateResponse(userMessage, sessionId = null, chatHistory = []) {
    try {
      // Generate or use provided session ID
      const currentSessionId = sessionId || uuidv4();

      // Get or create conversation history
      let conversation = this.conversations.get(currentSessionId) || [];

      // Add context from previous messages if chat history is provided
      if (chatHistory.length > 0 && conversation.length === 0) {
        conversation = this.convertChatHistoryToMessages(chatHistory);
      }

      // Create context string from conversation history
      let contextInput = userMessage;
      if (conversation.length > 0) {
        const recentMessages = conversation.slice(-10); // Last 10 messages for context
        const contextString = recentMessages
          .map(
            (msg) =>
              `${msg.type === "human" ? "User" : "Assistant"}: ${msg.content}`
          )
          .join("\n");
        contextInput = `Previous conversation:\n${contextString}\n\nCurrent message: ${userMessage}`;
      }

      // Generate response
      const response = await this.chain.invoke({
        input: contextInput,
      });

      // Update conversation history
      conversation.push(new HumanMessage(userMessage));
      conversation.push(new AIMessage(response));

      // Keep only last 20 messages to manage memory
      if (conversation.length > 20) {
        conversation = conversation.slice(-20);
      }

      // Store updated conversation
      this.conversations.set(currentSessionId, conversation);

      return {
        response: response.trim(),
        sessionId: currentSessionId,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("LangChain Gemini error:", error);
      throw this.handleError(error);
    }
  }

  // Stream response (for real-time chat)
  async generateStreamResponse(userMessage, sessionId = null, onChunk = null) {
    try {
      const currentSessionId = sessionId || uuidv4();
      let conversation = this.conversations.get(currentSessionId) || [];

      let contextInput = userMessage;
      if (conversation.length > 0) {
        const recentMessages = conversation.slice(-10);
        const contextString = recentMessages
          .map(
            (msg) =>
              `${msg.type === "human" ? "User" : "Assistant"}: ${msg.content}`
          )
          .join("\n");
        contextInput = `Previous conversation:\n${contextString}\n\nCurrent message: ${userMessage}`;
      }

      // Stream the response
      const stream = await this.chain.stream({
        input: contextInput,
      });

      let fullResponse = "";
      for await (const chunk of stream) {
        fullResponse += chunk;
        if (onChunk) {
          onChunk(chunk);
        }
      }

      // Update conversation history
      conversation.push(new HumanMessage(userMessage));
      conversation.push(new AIMessage(fullResponse));

      if (conversation.length > 20) {
        conversation = conversation.slice(-20);
      }

      this.conversations.set(currentSessionId, conversation);

      return {
        response: fullResponse.trim(),
        sessionId: currentSessionId,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("LangChain streaming error:", error);
      throw this.handleError(error);
    }
  }

  // Gaming-specific tools and functions
  getGamingProducts() {
    return {
      pc_components: [
        "Graphics Cards (RTX 4090, RTX 4080, RX 7900 XTX)",
        "Processors (Intel Core i9, AMD Ryzen 9)",
        "Gaming RAM (DDR5, RGB)",
        "SSDs (NVMe, Gaming optimized)",
        "Gaming Motherboards",
      ],
      peripherals: [
        "Gaming Mice (Logitech, Razer, SteelSeries)",
        "Mechanical Keyboards (Cherry MX, RGB)",
        "Gaming Headsets (7.1 Surround)",
        "Gaming Monitors (4K, 144Hz, OLED)",
        "Gaming Chairs",
      ],
      consoles: [
        "PlayStation 5",
        "Xbox Series X/S",
        "Nintendo Switch OLED",
        "Steam Deck",
        "Console Accessories",
      ],
    };
  }

  getCurrentDeals() {
    return {
      featured_deal: {
        name: "Gaming Setup Bundle",
        original_price: "$1,299",
        sale_price: "$899",
        discount: "31% OFF",
        description: "Complete gaming setup with RGB lighting",
        time_left: "Limited Time",
      },
      other_deals: [
        { item: "Gaming Mouse", discount: "30% OFF", price: "$49.99" },
        { item: "Mechanical Keyboard", discount: "25% OFF", price: "$89.99" },
        { item: "Gaming Headset", discount: "40% OFF", price: "$79.99" },
      ],
    };
  }

  // Convert chat history format
  convertChatHistoryToMessages(chatHistory) {
    return chatHistory.map((msg) => {
      if (msg.role === "user") {
        return new HumanMessage(msg.content);
      } else {
        return new AIMessage(msg.content);
      }
    });
  }

  // Error handling
  handleError(error) {
    if (error.message.includes("API_KEY_INVALID")) {
      return new Error(
        "Invalid Google API key. Please check your configuration."
      );
    } else if (error.message.includes("QUOTA_EXCEEDED")) {
      return new Error("API quota exceeded. Please try again later.");
    } else if (error.message.includes("RATE_LIMIT")) {
      return new Error(
        "Rate limit exceeded. Please wait a moment and try again."
      );
    } else {
      return new Error("Failed to generate response. Please try again.");
    }
  }

  // Get conversation history for a session
  getConversationHistory(sessionId) {
    return this.conversations.get(sessionId) || [];
  }

  // Clear conversation history for a session
  clearConversationHistory(sessionId) {
    this.conversations.delete(sessionId);
  }

  // Get all active sessions
  getActiveSessions() {
    return Array.from(this.conversations.keys());
  }

  // Clean up old conversations (call periodically)
  cleanupOldConversations(maxAgeHours = 24) {
    const now = Date.now();
    const maxAge = maxAgeHours * 60 * 60 * 1000;

    for (const [sessionId, conversation] of this.conversations.entries()) {
      if (conversation.length > 0) {
        const lastMessage = conversation[conversation.length - 1];
        const messageTime = new Date(lastMessage.timestamp || now - maxAge - 1);

        if (now - messageTime.getTime() > maxAge) {
          this.conversations.delete(sessionId);
        }
      }
    }
  }
}

module.exports = LangChainGeminiService;
