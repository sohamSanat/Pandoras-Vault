<%*
// 1. Set your OpenRouter API Key and preferred model
// 1. Pull OpenRouter Config globally from the Time Garden main.js
const OPENROUTER_API_KEY = window.customAI.apiKey; 
const MODEL = window.customAI.model;

// 2. Get the current active monthly note file
const activeFile = tp.config.target_file || app.workspace.getActiveFile();
const currentNoteContent = await app.vault.read(activeFile);

// Extract date prefix from file name (e.g., "2026-07")
const fileName = activeFile.basename;
const dateMatch = fileName.match(/^(\d{4}-\d{2})/);
const monthPrefix = dateMatch ? dateMatch[1] : "";

// 3. Gather daily note entries for this month to give the AI context
let combinedJournalText = currentNoteContent;

if (monthPrefix) {
  const allFiles = app.vault.getMarkdownFiles();
  const dailyFiles = allFiles.filter(f => f.path.includes("01 Daily") && f.name.startsWith(monthPrefix));
  
  let monthEntries = [];
  for (const file of dailyFiles) {
    const text = await app.vault.read(file);
    const cache = app.metadataCache.getFileCache(file);
    const alias = cache?.frontmatter?.alias ? `[Alias: ${cache.frontmatter.alias}]` : "";
    
    if (text.trim()) {
      monthEntries.push(`--- ${file.basename} ${alias} ---\n${text.slice(0, 500)}`);
    }
  }

  if (monthEntries.length > 0) {
    combinedJournalText += "\n\n### Daily Entries from this Month:\n" + monthEntries.join("\n\n");
  }
}

if (!combinedJournalText.trim()) {
  new Notice("Note and daily entries are empty! Write some entries first.");
  return;
}

new Notice("🤖 Generating Monthly AI Alias via OpenRouter...");

// 4. Construct prompt
const prompt = `Read these monthly journal notes and daily entries, then create a catchy, memorable title (alias) for the ENTIRE MONTH in 7 words or less. Return ONLY the title text, nothing else, no quotes.

Month Journal Data:
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
  let aliasText = data.choices[0].message.content.trim();
  aliasText = aliasText.replace(/^["']|["']$/g, '');

  // 6. Update frontmatter metadata on the monthly note
  await app.fileManager.processFrontMatter(activeFile, (fm) => {
    fm["alias"] = aliasText;
  });

  new Notice(`✅ Monthly AI Alias Complete: "${aliasText}"`);

} catch (error) {
  console.error("OpenRouter Error:", error);
  new Notice("❌ Monthly AI Alias failed. Check developer console (Ctrl+Shift+I).");
}
-%>