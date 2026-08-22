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

new Notice("🤖 Generating AI Rating & Alias via OpenRouter...");

// 3. Construct the prompt
const prompt = `Read this journal entry and provide two things:
1. An overall rating for the day on a scale of 1 to 10 (where 1 is terrible and 10 is excellent).
2. A catchy, memorable title (alias) for the day in 7 words or less.

Return ONLY a raw JSON object (no markdown formatting, no code blocks) with the exact keys "rating" (an integer) and "alias" (a string). Do not include any other text.

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
  const rawText = data.choices[0].message.content.trim();
  
  // Clean up any potential markdown code fence wrapping from LLMs
  const cleanedJson = rawText.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
  
  let result;
  try {
      result = JSON.parse(cleanedJson);
  } catch (parseError) {
       console.error("Failed to parse JSON. Raw AI output:", rawText);
       throw new Error("AI did not return a valid JSON format.");
  }

  // Validate the data
  const ratingNum = parseInt(result.rating, 10);
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 10) {
      throw new Error(`Invalid rating received from AI: "${result.rating}"`);
  }
  
  const aliasText = result.alias ? result.alias.replace(/^["']|["']$/g, '') : "No Alias Generated";


  // 5. Update the frontmatter metadata on today's note
  await app.fileManager.processFrontMatter(activeFile, (fm) => {
    fm["rating"] = ratingNum;
    fm["alias"] = aliasText;
  });

  new Notice(`✅ AI Complete! Rating: ${ratingNum}/10 | Alias: "${aliasText}"`);

} catch (error) {
  console.error("OpenRouter Error:", error);
  new Notice("❌ AI Rating & Alias failed. Check the developer console (Ctrl+Shift+I).");
}
-%>