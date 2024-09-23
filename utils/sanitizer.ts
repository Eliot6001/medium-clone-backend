import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

const jsdomWindow = new JSDOM('').window;
const dompurify = DOMPurify(jsdomWindow);

const sanitizeHTML = (html:string): string => {
    return dompurify.sanitize(html);
};
export {sanitizeHTML}
