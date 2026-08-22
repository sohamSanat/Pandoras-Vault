<%*
// 1. Set your OpenRouter API Key and preferred model
// 1. Pull OpenRouter Config globally from the Time Garden main.js
const OPENROUTER_API_KEY = window.customAI.apiKey; 
const MODEL = window.customAI.model;

// 2. Get the current active quarterly file
const activeFile = tp.config.target_file || app.workspace.getActiveFile();
const fileName = activeFile.basename; // e.g., "2026-Q3"

// 3. Extract the year and quarter number to find the right months
const dateMatch = fileName.match(/^(\d{4})-Q(\d)/);
let combinedJournalText = "";

if (dateMatch) {
  const year = dateMatch[1];
  const quarter = parseInt(dateMatch[2], 10);
  
  // Map the quarter to its respective months
  const monthMap = {
    1: ['01', '02', '03'],
    2: ['04', '05', '06'],
    3: ['07', '08', '09'],
    4: ['10', '11', '12']
  };
  const targetMonths = monthMap[quarter];

  if (targetMonths) {
    const allFiles = app.vault.getMarkdownFiles();
    // Filter to only grab files in the Monthly folder that match this quarter
    const monthlyFiles = allFiles.filter(f => 
      f.path.includes("03 Monthly") && 
      targetMonths.some(m => f.name.startsWith(`${year}-${m}`))
    );
    
    let quarterEntries = [];
    for (const file of monthlyFiles) {
      const text = await app.vault.read(file);
      // Grab the first 1500 characters of each monthly note
      if (text.trim()) {
        quarterEntries.push(`--- ${file.basename} ---\n${text.slice(0, 1500)}`);
      }
    }
    
    if (quarterEntries.length > 0) {
      combinedJournalText = quarterEntries.join("\n\n");
    }
  }
}

if (!combinedJournalText.trim()) {
  new Notice("⚠️ No monthly entries found for this quarter to summarize!");
  return;
}

new Notice("🤖 Generating Quarterly Summary via OpenRouter...");

// 4. Construct the prompt
const prompt = `You are a helpful personal journaling assistant. Read the following monthly summaries for the quarter. Write a concise, thoughtful summary of the quarter's key events, themes, challenges, and overall progress. 
Write it in the first person ("I") as if I am reflecting on my own quarter. 
Return ONLY the summary paragraph. Do not include markdown headers, bullet points, or introductory text like "Here is your summary".

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
  
  if (data.error) {
     throw new Error(data.error.message || "Unknown API Error");
  }
  
  const summaryText = data.choices[0].message.content.trim();

  // 6. Update the 'summary' frontmatter property
  await app.fileManager.processFrontMatter(activeFile, (fm) => {
    fm["summary"] = summaryText; 
  });

  new Notice("✅ Quarterly Summary Generated & Saved!");

} catch (error) {
  console.error("OpenRouter Error:", error);
  new Notice("❌ Quarterly Summary failed. Check the developer console (Ctrl+Shift+I).");
}
-%>