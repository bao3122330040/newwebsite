const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const {
  HumanMessage,
  SystemMessage,
  AIMessage,
} = require("@langchain/core/messages");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { AgentExecutor, createToolCallingAgent } = require("langchain/agents");
const { DynamicTool } = require("@langchain/core/tools");

class GameZoneAgent {
  constructor() {
    this.apiKey = process.env.GOOGLE_API_KEY;
    this.temperature = parseFloat(process.env.TEMPERATURE) || 0.7;
    this.modelName = process.env.MODEL_NAME || "gemini-pro";

    if (!this.apiKey) {
      throw new Error("GOOGLE_API_KEY not found in environment variables");
    }

    // Initialize LangChain Gemini model
    this.model = new ChatGoogleGenerativeAI({
      apiKey: this.apiKey,
      modelName: this.modelName,
      temperature: this.temperature,
    });

    // Initialize tools
    this.tools = this.createTools();

    // Initialize agent
    this.initializeAgent();

    // Store information
    this.storeInfo = this.getStoreInfo();
  }

  createTools() {
    return [
      new DynamicTool({
        name: "get_product_info",
        description:
          "Get detailed information about gaming products by category (pc, console, accessories, mobile)",
        func: async (category) => {
          return this.getProductInfo(category);
        },
      }),

      new DynamicTool({
        name: "get_current_deals",
        description: "Get current deals and promotions available in the store",
        func: async () => {
          return this.getCurrentDeals();
        },
      }),

      new DynamicTool({
        name: "product_recommendation",
        description:
          "Get product recommendations based on budget, gaming preference, or specific needs",
        func: async (requirements) => {
          return this.getProductRecommendations(requirements);
        },
      }),

      new DynamicTool({
        name: "calculate_price",
        description:
          "Calculate total price including discounts, taxes, or bundle deals",
        func: async (calculation) => {
          return this.calculatePrice(calculation);
        },
      }),

      new DynamicTool({
        name: "check_compatibility",
        description:
          "Check if gaming components are compatible with each other",
        func: async (components) => {
          return this.checkCompatibility(components);
        },
      }),

      new DynamicTool({
        name: "gaming_setup_builder",
        description:
          "Build a complete gaming setup based on budget and preferences",
        func: async (preferences) => {
          return this.buildGamingSetup(preferences);
        },
      }),

      new DynamicTool({
        name: "get_store_info",
        description:
          "Get store information including contact details, location, and policies",
        func: async () => {
          return JSON.stringify(this.storeInfo, null, 2);
        },
      }),
    ];
  }

  async initializeAgent() {
    const systemTemplate = `You are GameZone AI Assistant, an expert gaming consultant for GameZone - a premium gaming store. 

**Your Role:**
- Help customers find perfect gaming products
- Provide expert gaming advice and recommendations
- Answer questions about products, deals, and store policies
- Build custom gaming setups based on customer needs
- Check component compatibility
- Calculate prices and deals

**Store Information:**
- Name: GameZone
- Specializes in: PC Gaming, Consoles, Gaming Accessories, Mobile Gaming
- Location: 123 Gaming St, Tech City
- Phone: +1 (555) 123-4567
- Email: info@gamezone.com

**Available Tools:**
You have access to tools that can help you:
- Get product information by category
- Check current deals and promotions
- Make product recommendations
- Calculate prices and discounts
- Check component compatibility
- Build complete gaming setups
- Provide store information

**Instructions:**
1. Always be enthusiastic about gaming
2. Use tools when you need specific information
3. Provide detailed, helpful responses
4. Recommend GameZone products when appropriate
5. If you don't know something, use the available tools to find out
6. Be professional but friendly and engaging

When customers ask about products, deals, or need recommendations, use the appropriate tools to provide accurate information.`;

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", systemTemplate],
      ["human", "{input}"],
      ["placeholder", "{agent_scratchpad}"],
    ]);

    // Create the agent
    this.agent = await createToolCallingAgent({
      llm: this.model,
      tools: this.tools,
      prompt: prompt,
    });

    // Create agent executor
    this.agentExecutor = new AgentExecutor({
      agent: this.agent,
      tools: this.tools,
      verbose: true,
      maxIterations: 3,
    });
  }

  async processMessage(message, sessionId = null) {
    try {
      const result = await this.agentExecutor.invoke({
        input: message,
      });

      return {
        response: result.output,
        sessionId: sessionId,
        timestamp: new Date().toISOString(),
        toolsUsed:
          result.intermediateSteps?.map((step) => step.action?.tool) || [],
      };
    } catch (error) {
      console.error("Agent error:", error);
      throw new Error(`Agent processing failed: ${error.message}`);
    }
  }

  // Tool implementations
  getProductInfo(category) {
    const products = {
      pc: {
        category: "PC Gaming",
        products: [
          {
            name: "RTX 4090 Graphics Card",
            price: "$1,599",
            description: "Ultimate 4K gaming performance",
            specs: "24GB GDDR6X, 2520MHz boost clock",
          },
          {
            name: "Intel Core i9-13900K",
            price: "$589",
            description: "High-performance gaming processor",
            specs: "24 cores, 32 threads, up to 5.8GHz",
          },
          {
            name: "DDR5 RGB Gaming RAM 32GB",
            price: "$299",
            description: "High-speed gaming memory",
            specs: "5600MHz, RGB lighting, low latency",
          },
        ],
      },
      console: {
        category: "Gaming Consoles",
        products: [
          {
            name: "PlayStation 5",
            price: "$499",
            description: "Next-gen console gaming",
            specs: "Custom SSD, 4K gaming, Ray tracing",
          },
          {
            name: "Xbox Series X",
            price: "$499",
            description: "Most powerful Xbox ever",
            specs: "12 TFLOPS, 4K/120fps, Quick Resume",
          },
          {
            name: "Nintendo Switch OLED",
            price: "$349",
            description: "Portable and docked gaming",
            specs: "7-inch OLED screen, enhanced audio",
          },
        ],
      },
      accessories: {
        category: "Gaming Accessories",
        products: [
          {
            name: "Gaming Mouse Pro",
            price: "$79",
            description: "Precision gaming mouse",
            specs: "25,600 DPI, RGB lighting, 8 buttons",
          },
          {
            name: "Mechanical Gaming Keyboard",
            price: "$129",
            description: "Responsive mechanical switches",
            specs: "Cherry MX switches, RGB backlighting",
          },
          {
            name: "Gaming Headset 7.1",
            price: "$99",
            description: "Immersive surround sound",
            specs: "7.1 surround, noise canceling mic",
          },
        ],
      },
      mobile: {
        category: "Mobile Gaming",
        products: [
          {
            name: "Gaming Phone Controller",
            price: "$59",
            description: "Console-style mobile gaming",
            specs: "Bluetooth, universal compatibility",
          },
          {
            name: "Mobile Gaming Trigger",
            price: "$29",
            description: "Enhanced mobile gaming control",
            specs: "L1/R1 triggers, adjustable",
          },
        ],
      },
    };

    return JSON.stringify(products[category] || products, null, 2);
  }

  getCurrentDeals() {
    const deals = {
      featured_deal: {
        title: "Gaming Setup Bundle",
        original_price: "$1,299",
        sale_price: "$899",
        savings: "$400",
        discount_percentage: "31%",
        description:
          "Complete RGB gaming setup including monitor, keyboard, mouse, and headset",
        time_remaining: "Limited time offer",
        items_included: [
          '27" 144Hz Gaming Monitor',
          "RGB Mechanical Keyboard",
          "Gaming Mouse with RGB",
          "Gaming Headset 7.1",
          "RGB Mouse Pad",
        ],
      },
      flash_deals: [
        {
          item: "Gaming Mouse Pro",
          original_price: "$69.99",
          sale_price: "$49.99",
          discount: "30% OFF",
        },
        {
          item: "Mechanical Keyboard RGB",
          original_price: "$119.99",
          sale_price: "$89.99",
          discount: "25% OFF",
        },
        {
          item: "Gaming Headset",
          original_price: "$129.99",
          sale_price: "$79.99",
          discount: "40% OFF",
        },
      ],
      weekly_deals: [
        "Up to 20% off all RTX 4000 series",
        "Bundle discounts on complete PC builds",
        "Free shipping on orders over $100",
      ],
    };

    return JSON.stringify(deals, null, 2);
  }

  getProductRecommendations(requirements) {
    // Parse requirements and provide recommendations
    const recommendations = {
      budget_builds: {
        entry_level: {
          budget: "Under $800",
          recommended: [
            "AMD Ryzen 5 5600G - $159",
            "16GB DDR4 RAM - $60",
            "GTX 1660 Super - $230",
            "B450 Motherboard - $80",
            "500W PSU - $60",
          ],
          total: "~$589",
        },
        mid_range: {
          budget: "$800-$1500",
          recommended: [
            "AMD Ryzen 7 5700X - $199",
            "RTX 4060 Ti - $399",
            "32GB DDR4 RAM - $120",
            "B550 Motherboard - $120",
            "650W Gold PSU - $90",
          ],
          total: "~$928",
        },
        high_end: {
          budget: "$1500+",
          recommended: [
            "Intel Core i7-13700K - $409",
            "RTX 4080 - $1199",
            "32GB DDR5 RAM - $299",
            "Z790 Motherboard - $199",
            "850W Gold PSU - $150",
          ],
          total: "~$2256",
        },
      },
      gaming_preferences: {
        competitive_fps: [
          "High refresh rate monitor",
          "Gaming mouse with high DPI",
          "Mechanical keyboard",
        ],
        content_creation: [
          "RTX 4070+ for streaming",
          "32GB+ RAM",
          "Fast NVMe SSD",
        ],
        vr_gaming: ["RTX 4070 minimum", "Intel i5-12600K+", "16GB RAM minimum"],
      },
    };

    return JSON.stringify(recommendations, null, 2);
  }

  calculatePrice(calculation) {
    try {
      // Simple price calculator
      const match = calculation.match(/(\d+(?:\.\d+)?)/g);
      if (match) {
        const numbers = match.map(parseFloat);
        if (calculation.includes("+")) {
          return `Total: $${numbers.reduce((a, b) => a + b, 0).toFixed(2)}`;
        } else if (calculation.includes("-")) {
          return `After discount: $${(numbers[0] - numbers[1]).toFixed(2)}`;
        } else if (calculation.includes("*")) {
          return `Total: $${(numbers[0] * numbers[1]).toFixed(2)}`;
        }
      }
      return "Please provide a valid calculation (e.g., '299.99 + 99.99' or '499 - 50')";
    } catch (error) {
      return "Error calculating price. Please check your input.";
    }
  }

  checkCompatibility(components) {
    const compatibility = {
      status: "Compatible",
      notes: [
        "All components are compatible",
        "Recommended PSU: 650W or higher",
        "Ensure case has enough clearance for GPU",
        "Check RAM speed compatibility with motherboard",
      ],
      potential_issues: [
        "Some B450 motherboards may need BIOS update for newer CPUs",
        "Check GPU length vs case clearance",
        "Verify PSU has required PCIe connectors",
      ],
    };

    return JSON.stringify(compatibility, null, 2);
  }

  buildGamingSetup(preferences) {
    const setups = {
      budget_setup: {
        total_budget: "$600-$800",
        components: {
          cpu: "AMD Ryzen 5 5600G - $159",
          gpu: "GTX 1660 Super - $230",
          ram: "16GB DDR4 - $60",
          storage: "500GB NVMe SSD - $45",
          motherboard: "B450M - $80",
          psu: "500W Bronze - $60",
          case: "Mid-tower ATX - $50",
        },
        peripherals: {
          monitor: '24" 1080p 75Hz - $120',
          keyboard: "Membrane Gaming Keyboard - $30",
          mouse: "Gaming Mouse - $25",
          headset: "Basic Gaming Headset - $35",
        },
        total: "~$894",
      },
      premium_setup: {
        total_budget: "$2000-$3000",
        components: {
          cpu: "Intel i7-13700K - $409",
          gpu: "RTX 4080 - $1199",
          ram: "32GB DDR5 - $299",
          storage: "1TB NVMe Gen4 - $120",
          motherboard: "Z790 ATX - $199",
          psu: "850W Gold - $150",
          case: "Premium ATX RGB - $120",
        },
        peripherals: {
          monitor: '27" 1440p 165Hz - $299',
          keyboard: "Premium Mechanical RGB - $150",
          mouse: "Pro Gaming Mouse - $80",
          headset: "Premium Gaming Headset - $120",
        },
        total: "~$3145",
      },
    };

    return JSON.stringify(setups, null, 2);
  }

  getStoreInfo() {
    return {
      store_name: "GameZone",
      tagline: "Level Up Your Gaming",
      contact: {
        phone: "+1 (555) 123-4567",
        email: "info@gamezone.com",
        address: "123 Gaming St, Tech City",
      },
      specialties: [
        "PC Gaming Components",
        "Gaming Consoles & Accessories",
        "Gaming Peripherals",
        "Mobile Gaming Gear",
        "Custom PC Builds",
      ],
      services: [
        "Custom PC Building",
        "Component Installation",
        "Gaming Setup Consultation",
        "Technical Support",
        "Product Recommendations",
      ],
      policies: {
        shipping: "Free shipping on orders over $100",
        returns: "30-day return policy",
        warranty: "Extended warranty available",
        support: "24/7 technical support",
      },
      hours: {
        monday_friday: "9:00 AM - 9:00 PM",
        saturday: "10:00 AM - 8:00 PM",
        sunday: "12:00 PM - 6:00 PM",
      },
    };
  }
}

module.exports = GameZoneAgent;
