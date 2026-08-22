<%*
// 1. Set your OpenRouter API Key and preferred model
// 1. Pull OpenRouter Config globally from the Time Garden main.js
const OPENROUTER_API_KEY = window.customAI.apiKey; 
const MODEL = window.customAI.model;

// 2. Get the current active quarterly note file
const activeFile = tp.config.target_file || app.workspace.getActiveFile();
const currentNoteContent = await app.vault.read(activeFile);
const fileName = activeFile.basename; // e.g., "2026-Q3"

// 3. Extract the year and quarter number
const dateMatch = fileName.match(/^(\d{4})-Q(\d)/);
let combinedJournalText = currentNoteContent;

if (dateMatch) {
  const year = dateMatch[1];
  const quarter = parseInt(dateMatch[2], 10);
  
  // Map the quarter to its corresponding months
  const monthMap = {
    1: ['01', '02', '03'],
    2: ['04', '05', '06'],
    3: ['07', '08', '09'],
    4: ['10', '11', '12']
  };
  const targetMonths = monthMap[quarter];

  if (targetMonths) {
    const allFiles = app.vault.getMarkdownFiles();
    // Find the monthly notes that match this quarter's months
    const monthlyFiles = allFiles.filter(f => 
      f.path.includes("03 Monthly") && 
      targetMonths.some(m => f.name.startsWith(`${year}-${m}`))
    );
    
    let quarterEntries = [];
    for (const file of monthlyFiles) {
      const text = await app.vault.read(file);
      const cache = app.metadataCache.getFileCache(file);
      const alias = cache?.frontmatter?.alias ? `[Alias: ${cache.frontmatter.alias}]` : "";
      
      // Grab a good chunk of each monthly note
      if (text.trim()) {
        quarterEntries.push(`--- ${file.basename} ${alias} ---\n${text.slice(0, 1500)}`);
      }
    }

    if (quarterEntries.length > 0) {
      combinedJournalText += "\n\n### Monthly Summaries for this Quarter:\n" + quarterEntries.join("\n\n");
    }
  }
}

if (!combinedJournalText.trim()) {
  new Notice("Note and monthly entries are empty! Need some data to generate an alias.");
  return;
}

new Notice("🤖 Generating Quarterly AI Alias via OpenRouter...");

// 4. Construct prompt
const prompt = `Read these monthly journal summaries and create a catchy, memorable title (alias) for the ENTIRE QUARTER in 7 words or less. Return ONLY the title text, nothing else, no quotes.

Quarterly Data:
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
  
  // Clean up any stray quotes
  aliasText = aliasText.replace(/^["']|["']$/g, '');

  // 6. Update frontmatter metadata on the quarterly note
  await app.fileManager.processFrontMatter(activeFile, (fm) => {
    fm["alias"] = aliasText;
  });

  new Notice(`✅ Quarterly AI Alias Complete: "${aliasText}"`);

} catch (error) {
  console.error("OpenRouter Error:", error);
  new Notice("❌ Quarterly AI Alias failed. Check developer console.");
}
-%>