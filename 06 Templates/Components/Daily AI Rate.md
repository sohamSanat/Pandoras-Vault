<%*
// 1. Set your OpenRouter API Key and preferred model
// 1. Pull OpenRouter Config globally from the Time Garden main.js
const OPENROUTER_API_KEY = window.customAI.apiKey; 
const MODEL = window.customAI.model;

// 2. Get the current active note content
const activeFile = tp.config.target_file || app.workspace.getActiveFile();
const content = await app.vault.read(activeFile);

if (!content.trim()) {
  new Notice("Note is empty! Write your journal entry first.");
  return;
}

new Notice("🤖 Generating AI Rating via OpenRouter...");

// 3. Construct the prompt
const prompt = `Read this journal entry and evaluate how the day went. Return ONLY a single integer from 1 to 10 representing the overall rating for the day (where 1 is terrible and 10 is excellent). Do not include any text, quotes, punctuation, or explanations—just the raw number.

Entry:
${content}`;

try {
  // 4. Call OpenRouter API directly
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
  const rawRating = data.choices[0].message.content.trim();
  
  // Extract number from response
  const ratingNum = parseInt(rawRating.replace(/\D/g, ''), 10);

  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 10) {
    throw new Error(`Invalid rating received from AI: "${rawRating}"`);
  }

  // 5. Update the frontmatter metadata on today's note
  await app.fileManager.processFrontMatter(activeFile, (fm) => {
    fm["rating"] = ratingNum;
  });

  new Notice(`✅ AI Rating Complete: ${ratingNum}/10`);

} catch (error) {
  console.error("OpenRouter Error:", error);
  new Notice("❌ AI Rating failed. Check developer console (Ctrl+Shift+I).");
}
-%>