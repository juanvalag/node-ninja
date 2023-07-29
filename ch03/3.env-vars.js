#!/usr/bin/env node

/* 
    process.env es un objeto conteniendo las variables de ambiente del
    sistema donde se esta corriendo el script actual:
    Linux y macOS ponen el nombre de usuario en la variable USER
    Windows lo pone en la variable USERNAME
*/

const nameArg = capitalize(process.argv[2] || process.env.USER || process.env.USERNAME || 'visitante no identificado');
console.log(`Hola ${nameArg}!`);


function capitalize(str) {
    return str
        .trim()
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}