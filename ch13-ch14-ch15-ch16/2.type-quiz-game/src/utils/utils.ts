// format answers for sorting (True/False, numerical, or alphabetical)
export function formatAnswer(t: string) {
    if (t === 'True') return 0;
    if (t === 'False') return 1;
    if (isNaN(t)) return t;
    return parseInt(t, 10);
}


// simple string clean
export function cleanString(str: string) {
    return str
        .trim()
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/&#039;/g, '\'')
        .replace(/&quot;|&ldquo;|&rdquo;|&laquo;|&raquo;/g, `'`)
        .replace(/&\s+/g, '&amp; ')
        .replace(/\s+/g, ' ');
}