#!/usr/bin/env node
/* 
    process.argv es un array que contiene los argumentos de la linea de comandos
    process.argv[0] = 'node'
    process.argv[1] = '2.env-vars.js' nombre del script
    process.argv[2] = Primer argumento pasado al CLI
*/
const nameArg = (process.argv[2] || 'visitante no identificado');
console.log(`Hola ${nameArg}!`);