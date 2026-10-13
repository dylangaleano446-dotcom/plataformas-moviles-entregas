var listaPersonasEjemplo = [
    {
        "apellido": "Perez",
        "nombre": "Juan",
        "edad": 20,
        "documento": 12345
    },
    {
        "apellido": "Lopez",
        "nombre": "Luis",
        "edad": 20,
        "documento": 23456
    },
    {
        "apellido": "Zapata",
        "nombre": "Pablo",
        "edad": 10,
        "documento": 34567
    },
    {
        "apellido": "Acuña",
        "nombre": "Ana",
        "edad": 30,
        "documento": 45678
    },
];


function ordenarPorApellido(listaDePersonas) {
    return listaDePersonas.sort((a, b) => a.apellido.localeCompare(b.apellido));
}
console.log("ordenarPorApellido()", ordenarPorApellido(listaPersonasEjemplo));


function soloNombres(listaDePersonas) {
    return listaDePersonas.map(persona => persona.nombre);
}
console.log("soloNombres()", soloNombres(listaPersonasEjemplo));


function promedioEdades(listaDePersonas) {
    if (listaDePersonas.length === 0) return 0;
    var sumaEdades = listaDePersonas.reduce((acumulador, persona) => acumulador + persona.edad, 0);
    return sumaEdades / listaDePersonas.length;
}
console.log("promedioEdades()", promedioEdades(listaPersonasEjemplo));


function cumplirAños(listaDePersonas) {
    return listaDePersonas.map(persona => ({
        ...persona,
        edad: persona.edad + 1
    }));
}
console.log("cumplirAños()", cumplirAños(listaPersonasEjemplo));


function soloMayoresDeEdad(listaDePersonas) {
    return listaDePersonas.filter(persona => persona.edad > 18);
}
console.log("soloMayoresDeEdad()", soloMayoresDeEdad(listaPersonasEjemplo));


function laPersonaMayor(listaDePersonas) {
    if (listaDePersonas.length === 0) return null;
    return listaDePersonas.reduce((personaMayor, personaActual) => {
        return (personaActual.edad > personaMayor.edad) ? personaActual : personaMayor;
    });
}
console.log("laPersonaMayor()", laPersonaMayor(listaPersonasEjemplo));


function agregarHeladoFavorito(listaDePersonas, listaDeHelados) {
    return listaDePersonas.map((persona, indice) => {
        var helado = (listaDeHelados && listaDeHelados[indice] !== undefined) 
            ? listaDeHelados[indice] 
            : "vainilla";
        
        return {
            ...persona,
            heladoFavorito: helado
        };
    });
}
console.log("agregarHeladoFavorito()", agregarHeladoFavorito(listaPersonasEjemplo, ["chocolate", "limon", "frutilla"]));
