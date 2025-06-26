// End-to-end test for GameZone Chatbot Agent
const fetch = require("node-fetch");

const API_URL =
  process.env.CHATBOT_URL || "http://localhost:5000/api/agent/chat";
const testCases = [
  { input: "Xin chào", expect: /chào|hello|hi/i },
  {
    input: "Tư vấn build PC gaming tầm 20 triệu",
    expect: /cpu|gpu|ram|main|card/i,
  },
  { input: "Có deal nào hot không?", expect: /deal|giảm|bundle|flash/i },
  {
    input: "Chính sách đổi trả thế nào?",
    expect: /đổi trả|return|policy|30 ngày/i,
  },
  { input: "GameZone ở đâu?", expect: /Tech City|123 Gaming St/i },
  { input: "Tôi muốn hỏi về bảo hành", expect: /bảo hành|warranty/i },
  { input: "Bạn biết nấu ăn không?", expect: /gaming|sản phẩm|trợ giúp/i },
];

(async () => {
  let pass = 0;
  for (const tc of testCases) {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: tc.input }),
    });
    const data = await res.json();
    const ok = tc.expect.test(data.response);
    console.log(
      `Q: ${tc.input}\nA: ${data.response}\n=> ${ok ? "✅ Pass" : "❌ Fail"}\n`
    );
    if (ok) pass++;
  }
  console.log(`\nTổng kết: ${pass}/${testCases.length} test case đạt yêu cầu.`);
  process.exit(pass === testCases.length ? 0 : 1);
})();
