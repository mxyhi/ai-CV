const response = await fetch("http://localhost/v1/chat-messages", {
  method: "POST",
  headers: {
    Authorization: "Bearer app-hc5LzD15icPDE3qJVUCcFlLP",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    inputs: {},
    query: "发货时间",
    response_mode: "streaming",
    conversation_id: "",
    user: "abc-123",
  }),
});
const reader = response.body.getReader();
while (true) {
  const { value, done } = await reader.read();
  if (done) break;

  const text = new TextDecoder().decode(value);
  const lines = text.split("\n").filter((line) => line.trim());

  for (const line of lines) {
    try {
      if (line.startsWith("data: ")) {
        const data = JSON.parse(line.replace(/^data: /, ""));
        // console.log("事件类型:", data.event); // 调试用，查看实际的事件类型

        // 处理不同类型的事件
        if (data.event === "message" && data.answer) {
          process.stdout.write(data.answer);
        } else if (data.event === "message_delta" && data.data?.delta?.answer) {
          process.stdout.write(data.data.delta.answer);
        } else if (data.event === "message_start") {
          console.log("开始接收消息...");
        }
      }
    } catch (e) {
      console.error("解析错误:", e.message);
    }
  }
}

// curl -X POST 'http://localhost/v1/chat-messages' --header 'Authorization: Bearer app-hc5LzD15icPDE3qJVUCcFlLP' --header 'Content-Type: application/json' --data-raw '{"inputs": {},"query": "下单后多久发货？","response_mode": "streaming","conversation_id": "","user": "abc-123"}'
