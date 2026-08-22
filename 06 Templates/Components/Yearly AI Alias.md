<%*
// 1. Set your OpenRouter API Key and preferred model
// 1. Pull OpenRouter Config globally from the Time Garden main.js
const OPENROUTER_API_KEY = window.customAI.apiKey; 
const MODEL = window.customAI.model;

// 2. Get the current active yearly note file
const activeFile = tp.config.target_file || app.workspace.getActiveFile();
const currentNoteContent = await app.vault.read(activeFile);
const fileName = activeFile.basename; // e.g., "2026"

// 3. Extract the year from the filename
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
  
  // Sort chronologically just to keep the AI's context structured
  monthlyFiles.sort((a, b) => a.name.localeCompare(b.name));
  
  let yearEntries = [];
  for (const file of monthlyFiles) {
    const text = await app.vault.read(file);
    const cache = app.metadataCache.getFileCache(file);
    const alias = cache?.frontmatter?.alias ? `[Alias: ${cache.frontmatter.alias}]` : "";
    
    // Grab a solid chunk of each monthly note
    if (text.trim()) {
      yearEntries.push(`--- ${file.basename} ${alias} ---\n${text.slice(0, 1500)}`);
    }
  }

  if (yearEntries.length > 0) {
    combinedJournalText += "\n\n### Monthly Summaries for this Year:\n" + yearEntries.join("\n\n");
  }
}

if (!combinedJournalText.trim()) {
  new Notice("Note and monthly entries are empty! Need some data to generate an alias.");
  return;
}

new Notice("🤖 Generating Yearly AI Alias via OpenRouter...");

// 4. Construct prompt
const prompt = `Read these monthly journal summaries and create a catchy, memorable title (alias) for the ENTIRE YEAR in 7 words or less. Return ONLY the title text, nothing else, no quotes.

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
  
  let aliasText = data.choices[0].message.content.trim();
  
  // Clean up any stray quotes
  aliasText = aliasText.replace(/^["']|["']$/g, '');

  // 6. Update frontmatter metadata on the yearly note
  await app.fileManager.processFrontMatter(activeFile, (fm) => {
    fm["alias"] = aliasText;
  });

  new Notice(`✅ Yearly AI Alias Complete: "${aliasText}"`);

} catch (error) {
  console.error("OpenRouter Error:", error);
  new Notice("❌ Yearly AI Alias failed. Check developer console.");
}
-%>