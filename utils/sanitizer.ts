const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');


const windowInstance = new JSDOM('').windowInstance;
const dompurify = DOMPurify(windowInstance as unknown as Window);

exports.sanitizeHTML = (html:string): string => {
    return dompurify.sanitize(html);
};
