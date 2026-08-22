<%*
// 1. Set your OpenRouter API Key and preferred model
// 1. Pull OpenRouter Config globally from the Time Garden main.js
const OPENROUTER_API_KEY = window.customAI.apiKey; 
const MODEL = window.customAI.model;

// 2. Get the current active note content
const activeFile = tp.config.target_file || app.workspace.getActiveFile();
const content = await app.vault.read(activeFile);

if (!content.trim()) {
  new Notice("Note is empty! Write your journal entry first.");
  return;
}

new Notice("🤖 Generating AI Alias via OpenRouter...");

// 3. Construct the prompt
const prompt = `Read this journal entry and create a catchy, memorable title (alias) for the day in 7 words or less. Return ONLY the title text, nothing else, no quotes.

Entry:
${content}`;

try {
  // 4. Call OpenRouter API directly
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
  let aliasText = data.choices[0].message.content.trim();
  
  // Clean up any stray quotes the AI might accidentally add
  aliasText = aliasText.replace(/^["']|["']$/g, '');

  // 5. Update the frontmatter metadata on today's note
  await app.fileManager.processFrontMatter(activeFile, (fm) => {
    fm["alias"] = aliasText;
  });

  new Notice(`✅ AI Alias Complete: "${aliasText}"`);

} catch (error) {
  console.error("OpenRouter Error:", error);
  new Notice("❌ AI Alias failed. Check the developer console (Ctrl+Shift+I).");
}
-%>