<%*
// 1. Set your OpenRouter API Key and preferred model
// 1. Pull OpenRouter Config globally from the Time Garden main.js
const OPENROUTER_API_KEY = window.customAI.apiKey; 
const MODEL = window.customAI.model;

// 2. Get the current active yearly file
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

new Notice("🤖 Answering Yearly QA via OpenRouter...");

// 5. Gather Monthly notes for this year to provide context
const fileName = activeFile.basename; // e.g., "2026"
const dateMatch = fileName.match(/^(\d{4})/);
let combinedJournalText = currentNoteContent;

if (dateMatch) {
  const year = dateMatch[1];
  const allFiles = app.vault.getMarkdownFiles();
  
  // Find the monthly notes for this year
  const monthlyFiles = allFiles.filter(f => 
    f.path.includes("03 Monthly") && 
    f.name.startsWith(`${year}-`)
  );
  
  // Sort chronologically 
  monthlyFiles.sort((a, b) => a.name.localeCompare(b.name));
  
  let yearEntries = [];
  for (const file of monthlyFiles) {
    const text = await app.vault.read(file);
    if (text.trim()) {
      yearEntries.push(`--- ${file.basename} ---\n${text.slice(0, 1500)}`);
    }
  }
  
  if (yearEntries.length > 0) {
    combinedJournalText += "\n\n### Monthly Notes for Context:\n" + yearEntries.join("\n\n");
  }
}

// 6. Construct the prompt
const prompt = `You are a helpful personal reflective assistant. Below is the user's yearly journal overview and the monthly summaries that make up this year. Answer their question thoughtfully based on this context. Keep the answer clear, concise, and empathetic. Do not include markdown headers in your response.

Year Context:
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

  new Notice("✅ Yearly Q&A Answered!");

} catch (error) {
  console.error("OpenRouter Error:", error);
  new Notice(`❌ Error: ${error.message}`);
  
  // 9. Update frontmatter with error message if it fails
  await app.fileManager.processFrontMatter(activeFile, fm => {
    fm.aiAnswer = `Error: ${error.message}. Please try again with a different question.`;
  });
}
-%>