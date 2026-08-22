<%*
// 1. Set your OpenRouter API Key and preferred model
// 1. Pull OpenRouter Config globally from the Time Garden main.js
const OPENROUTER_API_KEY = window.customAI.apiKey; 
const MODEL = window.customAI.model;

// 2. Get the current active file
const activeFile = tp.config.target_file || app.workspace.getActiveFile();
const currentNoteContent = await app.vault.read(activeFile);
const cache = app.metadataCache.getFileCache(activeFile);

// 3. Extract the question from frontmatter
const question = cache?.frontmatter?.aiQuestion || "";

if (!question.trim()) {
  new Notice("⚠️ Please enter a question in the aiQuestion property first.");
  return;
}

// 4. Clear the query from frontmatter
await app.fileManager.processFrontMatter(activeFile, (fm) => {
  delete fm['aiQuestion'];
});

new Notice("🤖 Answering Monthly QA via OpenRouter...");

// 5. Gather daily note entries for this month for context
const fileName = activeFile.basename;
const dateMatch = fileName.match(/^(\d{4}-\d{2})/);
const monthPrefix = dateMatch ? dateMatch[1] : "";

let combinedJournalText = currentNoteContent;
if (monthPrefix) {
  const allFiles = app.vault.getMarkdownFiles();
  const dailyFiles = allFiles.filter(f => f.path.includes("01 Daily") && f.name.startsWith(monthPrefix));
  
  let monthEntries = [];
  for (const file of dailyFiles) {
    const text = await app.vault.read(file);
    if (text.trim()) {
      monthEntries.push(`--- ${file.basename} ---\n${text.slice(0, 500)}`);
    }
  }
  if (monthEntries.length > 0) {
    combinedJournalText += "\n\n### Daily Entries from this Month:\n" + monthEntries.join("\n\n");
  }
}

// 6. Construct prompt
const prompt = `You are a helpful personal reflective assistant. Below is the user's monthly journal overview and daily entries for the month. Answer their question thoughtfully based on this context. Keep the answer clear, concise, and empathetic. Do not include markdown headers in your response.

Month Context:
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
  const answer = data.choices[0].message.content.trim();

  // 8. Update frontmatter with the answer
  await app.fileManager.processFrontMatter(activeFile, (fm) => {
    fm.aiAnswer = answer;
  });

  new Notice("✅ Monthly Q&A Answered!");

} catch (error) {
  console.error("OpenRouter Error:", error);
  new Notice(`❌ Error: ${error.message}`);
  
  // 9. Update frontmatter with error message if it fails
  await app.fileManager.processFrontMatter(activeFile, fm => {
    fm.aiAnswer = `Error: ${error.message}. Please try again.`;
  });
}
-%>