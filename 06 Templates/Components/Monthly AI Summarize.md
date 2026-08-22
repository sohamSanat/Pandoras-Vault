<%*
// 1. Set your OpenRouter API Key and preferred model
// 1. Pull OpenRouter Config globally from the Time Garden main.js
const OPENROUTER_API_KEY = window.customAI.apiKey; 
const MODEL = window.customAI.model;

// 2. Get the current active file (the Monthly Note)
const activeFile = tp.config.target_file || app.workspace.getActiveFile();
const fileName = activeFile.basename;

// Extract the year and month (e.g., "2026-07") from the filename
const dateMatch = fileName.match(/^(\d{4}-\d{2})/);
const monthPrefix = dateMatch ? dateMatch[1] : "";

// 3. Gather daily note entries for this month
let combinedJournalText = "";
if (monthPrefix) {
  const allFiles = app.vault.getMarkdownFiles();
  // Filter to only grab files in the Daily folder that match this month
  const dailyFiles = allFiles.filter(f => f.path.includes("01 Daily") && f.name.startsWith(monthPrefix));
  
  let monthEntries = [];
  for (const file of dailyFiles) {
    const text = await app.vault.read(file);
    // Grab the first 800 characters of each day to prevent massive token limits, while keeping core context
    if (text.trim()) {
      monthEntries.push(`--- ${file.basename} ---\n${text.slice(0, 800)}`);
    }
  }
  
  if (monthEntries.length > 0) {
    combinedJournalText = monthEntries.join("\n\n");
  }
}

if (!combinedJournalText.trim()) {
  new Notice("⚠️ No daily entries found for this month to summarize!");
  return;
}

new Notice("🤖 Generating Monthly Summary via OpenRouter...");

// 4. Construct prompt
const prompt = `You are a helpful personal journaling assistant. Read the following daily entries for the month. Write a concise, thoughtful summary of the month's key events, themes, challenges, and overall progress. 
Write it in the first person ("I") as if I am reflecting on my own month. 
Return ONLY the summary paragraph. Do not include markdown headers, bullet points, or introductory text like "Here is your summary".

Monthly Data:
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
  const summaryText = data.choices[0].message.content.trim();

  // 6. Update the 'summary' frontmatter property
  await app.fileManager.processFrontMatter(activeFile, (fm) => {
    fm["summary"] = summaryText; 
  });

  new Notice("✅ Monthly Summary Generated & Saved!");

} catch (error) {
  console.error("OpenRouter Error:", error);
  new Notice("❌ Monthly Summary failed. Check the developer console (Ctrl+Shift+I).");
}
-%>