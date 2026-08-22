<%*
// 1. Set your OpenRouter API Key and preferred model
// 1. Pull OpenRouter Config globally from the Time Garden main.js
const OPENROUTER_API_KEY = window.customAI.apiKey; 
const MODEL = window.customAI.model;

// 2. Get the current active yearly note file
const activeFile = tp.config.target_file || app.workspace.getActiveFile();
const fileName = activeFile.basename; // e.g., "2026"

// 3. Extract the year from the filename
const dateMatch = fileName.match(/^(\d{4})/);
let combinedJournalText = "";

if (dateMatch) {
  const year = dateMatch[1];
  const allFiles = app.vault.getMarkdownFiles();
  
  // Find the monthly notes for this year to use as context
  const monthlyFiles = allFiles.filter(f => 
    f.path.includes("03 Monthly") && 
    f.name.startsWith(`${year}-`)
  );
  
  // Sort chronologically so the timeline makes sense to the AI
  monthlyFiles.sort((a, b) => a.name.localeCompare(b.name));
  
  let yearEntries = [];
  for (const file of monthlyFiles) {
    const text = await app.vault.read(file);
    if (text.trim()) {
      // Grab a solid 1000 character chunk from each month
      yearEntries.push(`--- ${file.basename} ---\n${text.slice(0, 1000)}`);
    }
  }

  if (yearEntries.length > 0) {
    combinedJournalText = yearEntries.join("\n\n");
  }
}

if (!combinedJournalText.trim()) {
  new Notice("⚠️ No monthly entries found for this year to summarize!");
  return;
}

new Notice("🤖 Generating Yearly AI Summary via OpenRouter...");

// 4. Construct prompt - Asking for a concise summary
const prompt = `You are a helpful personal journaling assistant. Read the following monthly summaries for the year. Write a concise, brief summary (1-2 paragraphs) of the year's main highlights and overall trajectory. 
Write it in the first person ("I") as if I am reflecting on my own year. 
Return ONLY the summary paragraph. Do not include markdown headers, bullet points, or introductory text like "Here is your summary".

Yearly Data:
${combinedJournalText}`;

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
  
  if (data.error) {
     throw new Error(data.error.message || "Unknown API Error");
  }
  
  const summaryText = data.choices[0].message.content.trim();

  // 6. Update frontmatter metadata on the yearly note
  await app.fileManager.processFrontMatter(activeFile, (fm) => {
    fm["summary"] = summaryText; 
  });

  new Notice("✅ Yearly AI Summary Complete & Saved!");

} catch (error) {
  console.error("OpenRouter Error:", error);
  new Notice("❌ Yearly AI Summary failed. Check developer console.");
}
-%>