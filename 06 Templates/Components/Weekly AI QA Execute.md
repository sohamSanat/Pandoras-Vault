<%*
// 1. Set your OpenRouter API Key and preferred model
// 1. Pull OpenRouter Config globally from the Time Garden main.js
const OPENROUTER_API_KEY = window.customAI.apiKey; 
const MODEL = window.customAI.model;

// 2. Get the current active file (Weekly Note)
const activeFile = tp.config.target_file || app.workspace.getActiveFile();
const currentNoteContent = await app.vault.read(activeFile);
const cache = app.metadataCache.getFileCache(activeFile);

// 3. Extract the question from frontmatter
const question = cache?.frontmatter?.aiQuestion || "";

if (!question.trim()) {
  new Notice("⚠️ Please enter a question in the text box first.");
  return;
}

// 4. Clear the query from frontmatter so the input box resets
await app.fileManager.processFrontMatter(activeFile, (fm) => {
  delete fm['aiQuestion'];
});

new Notice("🤖 Answering Weekly QA via OpenRouter...");

// 5. Gather daily notes for this week to provide context
const fileName = activeFile.basename; // e.g., "2026-W30"
let combinedJournalText = currentNoteContent;

const weekStart = moment(fileName, "gggg-[W]ww");

if (weekStart.isValid()) {
  const allFiles = app.vault.getMarkdownFiles();
  let weeklyEntries = [];

  for (let i = 0; i < 7; i++) {
    // Format to match standard daily notes: "YYYY-MM-DD"
    const currentDay = weekStart.clone().add(i, 'days').format("YYYY-MM-DD");
    const dailyFile = allFiles.find(f => f.name.includes(currentDay) && f.path.includes("01 Daily"));
    
    if (dailyFile) {
      const text = await app.vault.read(dailyFile);
      if (text.trim()) {
        weeklyEntries.push(`--- ${dailyFile.basename} ---\n${text.slice(0, 800)}`);
      }
    }
  }
  
  if (weeklyEntries.length > 0) {
    combinedJournalText += "\n\n### Daily Entries for Context:\n" + weeklyEntries.join("\n\n");
  }
}

// 6. Construct the prompt
const prompt = `You are a helpful personal reflective assistant. Below is the user's weekly journal overview and the daily entries for this week. Answer their question thoughtfully based on this context. Keep the answer clear, concise, and empathetic. Do not include markdown headers in your response.

Week Context:
${combinedJournalText}

Question:
${question}`;

try {
  // 7. Call OpenRouter API
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
  
  if (data.error) {
     throw new Error(data.error.message || "Unknown API Error");
  }
  
  const answer = data.choices[0].message.content.trim();

  // 8. Update frontmatter with the successful answer
  await app.fileManager.processFrontMatter(activeFile, (fm) => {
    fm.aiAnswer = answer;
  });

  new Notice("✅ Weekly Q&A Answered!");

} catch (error) {
  console.error("OpenRouter Error:", error);
  new Notice(`❌ Error: ${error.message}`);
  
  // 9. Update frontmatter with error message if it fails so the UI displays it
  await app.fileManager.processFrontMatter(activeFile, fm => {
    fm.aiAnswer = `Error: ${error.message}. Please try again with a different question.`;
  });
}
-%>