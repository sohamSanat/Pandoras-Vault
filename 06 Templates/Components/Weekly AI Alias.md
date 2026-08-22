<%*
// 1. Set your OpenRouter API Key and preferred model
// 1. Pull OpenRouter Config globally from the Time Garden main.js
const OPENROUTER_API_KEY = window.customAI.apiKey; 
const MODEL = window.customAI.model;

// 2. Get the current active weekly file
const activeFile = tp.config.target_file || app.workspace.getActiveFile();
const currentNoteContent = await app.vault.read(activeFile);
const fileName = activeFile.basename; // e.g., "2026-W30"

let combinedJournalText = currentNoteContent;
let weeklyEntries = [];

// 3. Use Obsidian's built-in moment.js to parse the week and find the 7 daily notes
// Assumes your weekly notes are named like "YYYY-Www" (e.g., 2026-W30)
const weekStart = moment(fileName, "gggg-[W]ww");

if (weekStart.isValid()) {
  const allFiles = app.vault.getMarkdownFiles();
  
  for (let i = 0; i < 7; i++) {
    // Format to match standard daily notes: "YYYY-MM-DD"
    const currentDay = weekStart.clone().add(i, 'days').format("YYYY-MM-DD");
    
    // Find the daily file for this specific day
    const dailyFile = allFiles.find(f => f.name.includes(currentDay) && f.path.includes("01 Daily"));
    
    if (dailyFile) {
      const text = await app.vault.read(dailyFile);
      const cache = app.metadataCache.getFileCache(dailyFile);
      const alias = cache?.frontmatter?.alias ? `[Alias: ${cache.frontmatter.alias}]` : "";
      
      // Grab a chunk of each day
      if (text.trim()) {
        weeklyEntries.push(`--- ${dailyFile.basename} ${alias} ---\n${text.slice(0, 800)}`);
      }
    }
  }

  if (weeklyEntries.length > 0) {
    combinedJournalText += "\n\n### Daily Entries for this Week:\n" + weeklyEntries.join("\n\n");
  }
} else {
  new Notice("⚠️ Could not parse week from filename. Generating alias based only on current note text.");
}

if (!combinedJournalText.trim()) {
  new Notice("Note and daily entries are empty! Need some data to generate an alias.");
  return;
}

new Notice("🤖 Generating Weekly AI Alias via OpenRouter...");

// 4. Construct prompt
const prompt = `Read these daily journal entries for the week and create a catchy, memorable title (alias) for the ENTIRE WEEK in 7 words or less. Return ONLY the title text, nothing else, no quotes.

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
  
  let aliasText = data.choices[0].message.content.trim();
  
  // Clean up any stray quotes
  aliasText = aliasText.replace(/^["']|["']$/g, '');

  // 6. Update frontmatter metadata on the weekly note
  await app.fileManager.processFrontMatter(activeFile, (fm) => {
    fm["alias"] = aliasText;
  });

  new Notice(`✅ Weekly AI Alias Complete: "${aliasText}"`);

} catch (error) {
  console.error("OpenRouter Error:", error);
  new Notice("❌ Weekly AI Alias failed. Check developer console.");
}
-%>