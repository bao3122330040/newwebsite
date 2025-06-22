const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiService {
  constructor() {
    this.apiKey = process.env.GOOGLE_API_KEY;

    if (!this.apiKey) {
      throw new Error("GOOGLE_API_KEY not found in environment variables");
    }

    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

    // System prompt to define chatbot behavior
    this.systemPrompt = `You are a helpful and friendly AI assistant. You can:
        - Answer questions on various topics
        - Help with problem-solving
        - Provide explanations and tutorials
        - Assist with coding and technical questions
        - Have casual conversations
        
        Please be concise, helpful, and maintain a friendly tone. If you're unsure about something, please say so.`;
  }

  async generateResponse(userMessage, chatHistory = []) {
    try {
      // Build conversation context
      let conversationContext = this.systemPrompt + "\n\n";

      // Add recent chat history for context
      if (chatHistory.length > 0) {
        conversationContext += "Recent conversation:\n";
        chatHistory.slice(-6).forEach((msg) => {
          conversationContext += `${msg.role}: ${msg.content}\n`;
        });
        conversationContext += "\n";
      }

      conversationContext += `User: ${userMessage}\nAssistant:`;

      // Generate response
      const result = await this.model.generateContent(conversationContext);
      const response = await result.response;
      const text = response.text();

      return text.trim();
    } catch (error) {
      console.error("Gemini API error:", error);

      if (error.message.includes("API_KEY_INVALID")) {
        throw new Error(
          "Invalid Google API key. Please check your configuration."
        );
      } else if (error.message.includes("QUOTA_EXCEEDED")) {
        throw new Error("API quota exceeded. Please try again later.");
      } else {
        throw new Error("Failed to generate response. Please try again.");
      }
    }
  }

  async generateStreamResponse(userMessage, chatHistory = []) {
    try {
      // Build conversation context
      let conversationContext = this.systemPrompt + "\n\n";

      if (chatHistory.length > 0) {
        conversationContext += "Recent conversation:\n";
        chatHistory.slice(-6).forEach((msg) => {
          conversationContext += `${msg.role}: ${msg.content}\n`;
        });
        conversationContext += "\n";
      }

      conversationContext += `User: ${userMessage}\nAssistant:`;

      // Generate streaming response
      const result = await this.model.generateContentStream(
        conversationContext
      );
      return result.stream;
    } catch (error) {
      console.error("Gemini streaming error:", error);
      throw new Error("Failed to generate streaming response.");
    }
  }

  // Tool functions for enhanced capabilities
  getAvailableTools() {
    return [
      {
        name: "calculator",
        description: "Perform mathematical calculations",
        function: this.calculate,
      },
      {
        name: "current_time",
        description: "Get current date and time",
        function: this.getCurrentTime,
      },
    ];
  }

  calculate(expression) {
    try {
      // Simple calculator - be careful with eval in production
      const result = Function(`"use strict"; return (${expression})`)();
      return `The result of ${expression} is ${result}`;
    } catch (error) {
      return "Invalid mathematical expression";
    }
  }

  getCurrentTime() {
    const now = new Date();
    return `Current date and time: ${now.toLocaleString()}`;
  }
}

module.exports = GeminiService;
