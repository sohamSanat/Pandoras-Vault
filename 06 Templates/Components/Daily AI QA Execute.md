<%*
// 1. Set your OpenRouter API Key and preferred model
// 1. Pull OpenRouter Config globally from the Time Garden main.js
const OPENROUTER_API_KEY = window.customAI.apiKey; 
const MODEL = window.customAI.model;

// 2. Get the current active note content
const activeFile = tp.config.target_file || app.workspace.getActiveFile();
let content = await app.vault.read(activeFile);

// 3. Check for a question in frontmatter, or prompt the user
let question = "";
const cache = app.metadataCache.getFileCache(activeFile);
if (cache?.frontmatter?.question) {
  question = cache.frontmatter.question;
} else {
  question = await tp.system.prompt("What question would you like to ask about today?", "", false);
}

if (!question || !question.trim()) {
  new Notice("⚠️ No question provided.");
  return;
}

new Notice("🤖 Asking AI via OpenRouter...");

// 4. Construct the prompt with daily note context
const prompt = `You are a helpful personal reflective assistant. Below is the user's journal entry for today, followed by their question. Answer the question thoughtfully based on their journal entry and general insights. Keep the answer clear, concise, and empathetic.

Journal Entry:
${content}

Question:
${question}`;

try {
  // 5. Call OpenRouter API
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await response.json();
  const answer = data.choices[0].message.content.trim();

  // 6. Format Q&A block and append to note
  const qaBlock = `\n\n### ❓ Q&A\n**Q:** ${question}\n\n**A:** ${answer}\n`;
  
  // Re-read file to avoid race conditions
  content = await app.vault.read(activeFile);
  await app.vault.modify(activeFile, content + qaBlock);

  new Notice("✅ Q&A Answered!");

} catch (error) {
  console.error("OpenRouter Error:", error);
  new Notice("❌ Q&A failed. Check developer console (Ctrl+Shift+I).");
}
-%>