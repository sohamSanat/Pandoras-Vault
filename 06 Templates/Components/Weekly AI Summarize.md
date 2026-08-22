<%*
// 1. Set your OpenRouter API Key and preferred model
// 1. Pull OpenRouter Config globally from the Time Garden main.js
const OPENROUTER_API_KEY = window.customAI.apiKey; 
const MODEL = window.customAI.model;

// 2. Get the current active file (the Weekly Note)
const activeFile = tp.config.target_file || app.workspace.getActiveFile();
const fileName = activeFile.basename; // e.g., "2026-W30"

// 3. Gather daily note entries for this week
let combinedJournalText = "";
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
      // Grab the first 800 characters of each day to prevent massive token limits
      if (text.trim()) {
        weeklyEntries.push(`--- ${dailyFile.basename} ---\n${text.slice(0, 800)}`);
      }
    }
  }

  if (weeklyEntries.length > 0) {
    combinedJournalText = weeklyEntries.join("\n\n");
  }
} else {
  new Notice("⚠️ Could not parse week from filename.");
}

if (!combinedJournalText.trim()) {
  new Notice("⚠️ No daily entries found for this week to summarize!");
  return;
}

new Notice("🤖 Generating Weekly Summary via OpenRouter...");

// 4. Construct prompt
const prompt = `You are a helpful personal journaling assistant. Read the following daily entries for the week. Write a concise, thoughtful summary of the week's key events, themes, challenges, and overall progress. 
Write it in the first person ("I") as if I am reflecting on my own week. 
Return ONLY the summary paragraph. Do not include markdown headers, bullet points, or introductory text like "Here is your summary".

Weekly Data:
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

  // 6. Update the 'summary' frontmatter property
  await app.fileManager.processFrontMatter(activeFile, (fm) => {
    fm["summary"] = summaryText; 
  });

  new Notice("✅ Weekly Summary Generated & Saved!");

} catch (error) {
  console.error("OpenRouter Error:", error);
  new Notice("❌ Weekly Summary failed. Check the developer console (Ctrl+Shift+I).");
}
-%>