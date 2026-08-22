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
      // Grab a solid 1500 character chunk from each month
      yearEntries.push(`--- ${file.basename} ---\n${text.slice(0, 1500)}`);
    }
  }

  if (yearEntries.length > 0) {
    combinedJournalText = yearEntries.join("\n\n");
  }
}

if (!combinedJournalText.trim()) {
  new Notice("⚠️ No monthly entries found for this year to review!");
  return;
}

new Notice("🤖 Generating Yearly AI Review via OpenRouter...");

// 4. Construct prompt
const prompt = `You are a helpful personal journaling assistant. Read the following monthly summaries for the year. Write a comprehensive, detailed, and thoughtful yearly review of the year's key events, overarching themes, major challenges overcome, and overall personal growth. 
Write it in the first person ("I") as if I am reflecting on my own year. 
Return ONLY the review text. Do not include markdown headers, bullet points, or introductory filler like "Here is your review".

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
  
  const reviewText = data.choices[0].message.content.trim();

  // 6. Update frontmatter metadata on the yearly note
  await app.fileManager.processFrontMatter(activeFile, (fm) => {
    fm["summary"] = reviewText; 
  });

  new Notice("✅ Yearly AI Review Complete & Saved!");

} catch (error) {
  console.error("OpenRouter Error:", error);
  new Notice("❌ Yearly AI Review failed. Check developer console.");
}
-%>