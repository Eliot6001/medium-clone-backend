const { sanitizeHTML } = require('../utils/sanitizer');
const { saveArticleToDatabase } = require('../services/supabaseService');

exports.submitArticle = async (req:any , res:any ) => {
    const { htmlContent } = req.body;

    if (!htmlContent) {
        return res.status(400).json({ error: 'No content provided' });
    }

    // Sanitize the HTML content
    const sanitizedHTML = sanitizeHTML(htmlContent);

    // Save to database (implement Supabase logic in the service layer)
    try {
        const result = await saveArticleToDatabase(sanitizedHTML);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to save article' });
    }
};
