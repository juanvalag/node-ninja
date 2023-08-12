const
    /**
     * Define todos los caracteres que puede tener una url de un juego.
     * ignora los caracteres que pueden ser confusos como o y 0
     */
    decodeChars = '2346789acdefghkmnpqrtvwxy',
/**
* = 25.
* 
* La base es el número de digitos y/o letras del abecedario desde los que se pueden crear más números.
* En los números naturales la base es 10 (están 0123456789 que forman todos los demás números de 10 en 10).
*
* En los número hexadecimales la base es 16 (están 0123456789abcdef que forman todos los números, como ejemplos
* el 10 es a, el 11 es b... el 16 es 10, el 17 es 11... el 26 es 1a, el 27 es 1b, etc).
*/
    base = decodeChars.length,
    numOffset = base ** 2,
    numMult = 7,
/**
 * @constant {Object.<string,string>} encodeMap Objeto que contiene para cada index de decodeChars en base 25
 * un caracter de decodeChars
 */
    encodeMap = {},
/**
 * @constant {Object.<string,string>} decodeMap Objeto que contiene para cada caracter de decodeChars un index de decodeChars en base 25
 */
    decodeMap = {};

decodeChars.split('').map((d, i) => {
    const e = i.toString(base);
    encodeMap[e] = d;
    decodeMap[d] = e;
});

// encode a number to a GUID string
export function encode(num) {

    return charConvert((num * numMult + numOffset).toString(base), encodeMap);

}


// decode a GUID string to a number
export function decode(code) {

    const codeConv = charConvert(code.toLowerCase(), decodeMap);
    if (code.length !== codeConv.length) return null;

    const codeNum = parseInt(codeConv, base);
    if (isNaN(codeNum)) return null;

    const num = (codeNum - numOffset) / numMult;
    return num === Math.floor(num) ? num : null;

}


// clean a string to alphanumerics only
export function clean(str, length = 10) {

    return str
        .trim()
        .replace(/[^A-Za-z0-9]/g, '')
        .slice(0, length);

}


// convert between character sets
/**
 * Pasa una cadena de indexes de una base a una cadena caracteres del charset
 * @param {string} str indexes en una base que coincide con la de charset
 * @param {Object.<string,string>} charSet pares de clave/valor donde es indexes en la base nueva/caracteres de esa base
 * @returns {string}
 */
function charConvert(str, charSet) {
    return str
        .split('')
        .reverse()
        .map(char => charSet[char] || '')
        .join('');
}