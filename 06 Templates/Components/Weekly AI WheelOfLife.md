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
    const currentDay = weekStart.clone().add(i, 'days').format("YYYY-MM-DD");
    const dailyFile = allFiles.find(f => f.name.includes(currentDay) && f.path.includes("01 Daily"));
    
    if (dailyFile) {
      const text = await app.vault.read(dailyFile);
      // Grab a snapshot of each day for context
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
  new Notice("⚠️ No daily entries found to evaluate the Wheel of Life!");
  return;
}

new Notice("🤖 Generating Wheel of Life Scores via OpenRouter...");

// 4. Construct prompt to enforce JSON output
const prompt = `Read these daily journal entries for the week. Evaluate how the week went based on the "Wheel of Life" framework. 
Rate the following 6 categories on a scale of 1 to 10 (where 1 is terrible and 10 is excellent) based strictly on the sentiment, events, and focus in the entries:
1. health (Physical and mental wellbeing)
2. work (Career, studies, and productivity)
3. relationships (Family, friends, and social life)
4. growth (Learning and personal development)
5. fun (Hobbies, recreation, and relaxation)
6. environment (Living space, finances, and organization)

Return ONLY a raw JSON object with these exact lowercase keys and integer values. Do not include any other text, markdown formatting, or explanations.
Example format: {"health": 7, "work": 8, "relationships": 6, "growth": 9, "fun": 5, "environment": 7}

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
  
  const rawText = data.choices[0].message.content.trim();
  
  // 6. Clean up potential markdown blocks the LLM might add and parse JSON
  const cleanedJson = rawText.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
  let wheelData;
  try {
      wheelData = JSON.parse(cleanedJson);
  } catch (e) {
      console.error("Raw AI Output:", rawText);
      throw new Error("AI did not return valid JSON.");
  }

  // 7. Update frontmatter properties with the new scores
  await app.fileManager.processFrontMatter(activeFile, (fm) => {
    fm["wol_health"] = wheelData.health || 0;
    fm["wol_work"] = wheelData.work || 0;
    fm["wol_relationships"] = wheelData.relationships || 0;
    fm["wol_growth"] = wheelData.growth || 0;
    fm["wol_fun"] = wheelData.fun || 0;
    fm["wol_environment"] = wheelData.environment || 0;
  });

  new Notice("✅ Wheel of Life Scores Generated & Saved!");

} catch (error) {
  console.error("OpenRouter Error:", error);
  new Notice("❌ Wheel of Life failed. Check the developer console (Ctrl+Shift+I).");
}
-%>