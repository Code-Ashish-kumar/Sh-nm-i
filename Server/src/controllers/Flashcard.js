import { query } from '../config/db.js';
import { chatCompletion } from '../services/llmProvider.js';

export const generateFlashcards = async (req, res) => {
    try {
        const { id: subjectId } = req.params;
        const { documentId } = req.query; // Optional: filter to a specific document

        // Check if there are any documents at all for this subject
        const docCheck = await query('SELECT id FROM documents WHERE subject_id = $1 LIMIT 1', [subjectId]);
        if (docCheck.rowCount === 0) {
            return res.status(404).json({ error: 'No documents found for this subject. Please upload notes first.' });
        }

        // 1. Fetch random chunks — filtered by documentId if provided
        // Keep chunk count low to stay within Groq free-tier 6000 TPM limit
        let sql, params;
        if (documentId) {
            sql = `
                SELECT dc.content 
                FROM document_chunks dc
                JOIN documents d ON dc.document_id = d.id
                WHERE dc.document_id = $1 AND d.status = 'completed'
                ORDER BY RANDOM()
                LIMIT 5
            `;
            params = [documentId];
        } else {
            sql = `
                SELECT dc.content 
                FROM document_chunks dc
                JOIN documents d ON dc.document_id = d.id
                WHERE d.subject_id = $1 AND d.status = 'completed'
                ORDER BY RANDOM()
                LIMIT 4
            `;
            params = [subjectId];
        }
        const result = await query(sql, params);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Documents are still processing. Please try again in a moment.' });
        }

        // Cap context to ~3000 chars (~750 tokens) to avoid rate limits on free tier
        let contextText = result.rows.map(row => row.content).join('\n\n');
        if (contextText.length > 3000) {
            contextText = contextText.slice(0, 3000);
        }

        // 2. Ask LLM to generate flashcards
        const systemPrompt = `You are an expert study assistant. Generate 5 flashcards from the notes below.
Output valid JSON ONLY in this format: [{"question":"...","answer":"..."}]
No markdown, no commentary. Just the JSON array.`;

        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Generate flashcards:\n\n${contextText}` }
        ];

        // Call the LLM (no tools needed)
        const llmResponse = await chatCompletion(messages, null);
        let content = llmResponse.content.trim();

        // 3. Aggressively clean up any markdown wrapping the LLM might add
        // Remove ```json ... ``` or ``` ... ``` blocks
        content = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();

        // If there's still a leading [ missing (rare cases where LLM prepends text), extract the JSON array
        const arrayStart = content.indexOf('[');
        const arrayEnd = content.lastIndexOf(']');
        if (arrayStart !== -1 && arrayEnd !== -1 && arrayStart < arrayEnd) {
            content = content.slice(arrayStart, arrayEnd + 1);
        }

        let flashcards;
        try {
            flashcards = JSON.parse(content);
            if (!Array.isArray(flashcards)) {
                throw new Error('Response is not an array');
            }
        } catch (parseError) {
            console.error('[Flashcard] Failed to parse LLM JSON output:', content);
            return res.status(500).json({ error: 'Failed to parse flashcard response. Please try again.' });
        }

        res.status(200).json({ flashcards });

    } catch (error) {
        console.error('[Flashcard] Generate Flashcards Error:', error?.message || error);
        console.error('[Flashcard] Full error stack:', error?.stack || 'no stack');
        
        // Handle rate limiting from LLM providers
        if (error?.message?.includes('429') || error?.status === 429) {
            return res.status(429).json({ error: 'LLM rate limited. Please wait 30 seconds and try again.' });
        }
        
        res.status(500).json({ error: `Failed to generate flashcards: ${error?.message || 'Unknown error'}` });
    }
};
