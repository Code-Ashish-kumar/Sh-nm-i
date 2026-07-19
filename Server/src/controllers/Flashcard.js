import { query } from '../config/db.js';
import { chatCompletion } from '../services/llmProvider.js';

export const generateFlashcards = async (req, res) => {
    try {
        const { id: subjectId } = req.params;

        // Check if there are any documents at all for this subject
        const docCheck = await query('SELECT id FROM documents WHERE subject_id = $1 LIMIT 1', [subjectId]);
        if (docCheck.rowCount === 0) {
            return res.status(404).json({ error: 'No documents found for this subject. Please upload notes first.' });
        }

        // 1. Fetch random chunks from documents in this subject
        // We limit to 10 chunks to avoid massive context windows while ensuring variety.
        const sql = `
            SELECT dc.content 
            FROM document_chunks dc
            JOIN documents d ON dc.document_id = d.id
            WHERE d.subject_id = $1 AND d.status = 'completed'
            ORDER BY RANDOM()
            LIMIT 10
        `;
        const result = await query(sql, [subjectId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Documents are still processing. Please try again in a moment.' });
        }

        const contextText = result.rows.map(row => row.content).join('\n\n');

        // 2. Ask LLM to generate flashcards
        const systemPrompt = `You are an expert study assistant. Your task is to generate 5 to 10 flashcards based on the provided notes.
Extract key concepts, definitions, or important facts.
You MUST output valid JSON ONLY, in the following format:
[
  { "question": "...", "answer": "..." },
  { "question": "...", "answer": "..." }
]
Do not include markdown code blocks like \`\`\`json or any other conversational text. Just the raw JSON array.`;

        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Generate flashcards from the following text:\n\n${contextText}` }
        ];

        // Call the LLM (no tools needed)
        const llmResponse = await chatCompletion(messages, null);
        let content = llmResponse.content.trim();

        // 3. Clean up the response if the LLM hallucinated markdown
        if (content.startsWith('```json')) content = content.slice(7);
        if (content.startsWith('```')) content = content.slice(3);
        if (content.endsWith('```')) content = content.slice(0, -3);
        content = content.trim();

        let flashcards;
        try {
            flashcards = JSON.parse(content);
        } catch (parseError) {
            console.error("Failed to parse LLM JSON output:", content);
            return res.status(500).json({ error: 'Failed to generate flashcards. Please try again.' });
        }

        res.status(200).json({ flashcards });

    } catch (error) {
        console.error("Generate Flashcards Error:", error);
        res.status(500).json({ error: 'Failed to generate flashcards' });
    }
};
