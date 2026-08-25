var listaNumerosEjemplo = [2, 4, 6, -1, 5, -4, 0];

/**
 * 01 - invertirLista
 */
function invertirLista(listaDeNumeros) {
    return [...listaDeNumeros].reverse();
}
console.log("invertirLista([2,3,4]): ", invertirLista([2, 3, 4]));

/**
 * 02 - sumarLista
 */
function sumarLista(listaDeNumeros) {
   let suma = 0;  

    for (let i = 0; i <
         listaDeNumeros.length; i++) {
        suma = suma +
         listaDeNumeros[i];
}
    return suma;
}
console.log("sumarLista([2,3,4]): ", sumarLista([2, 3, 4]));

/**
 * 03 - contarElementosLista
 */
function contarElementosLista(listaDeNumeros) {
    return listaDeNumeros.length;
}
console.log("contarElementosLista([2,3,4]): ", contarElementosLista([2, 3, 4]));

/**
 * 04 - calcularPromedio
 */
function calcularPromedio(listaDeNumeros) {
      let suma = 0;
    for (let i = 0; i <
    if (listaDeNumeros.length; i++) {
        suma = suma +
            listaDeNumeros[i];
    }
    return sumarLista(listaDeNumeros) / contarElementosLista(listaDeNumeros);
}
console.log("calcularPromedio([2,3,4]): ", calcularPromedio([2, 3, 4]));
console.log("calcularPromedio(listaNumerosEjemplo): ", calcularPromedio(listaNumerosEjemplo));

/**
 * 05 - triplicarLista
 */
function triplicarLista(listaDeNumeros) {
    let nuevaLista = [];

    for (let i = 0; i<
     listaDeNumeros.length; i++) {

    nuevaLista.push(listaDeNumeros[i]* 3);
    return nuevaLista;
}
console.log("triplicarLista([1, 2, 3]): ", triplicarLista([1, 2, 3]));

/**
 * 06 - crearListaDeNumeros
 */
function crearListaDeNumeros(inicio, fin) {

       let lista = [];

       for (let i = inicio; i<=
            fin; i++ {
           lista.push(i);
   
    }
    return lista;
}
console.log("crearListaDeNumeros(2,5): ", crearListaDeNumeros(2, 5));

/**
 * 07 - ordenarDeMayorAMenor
 */
function ordenarDeMayorAMenor(listaDeNumeros) {
    return [...listaDeNumeros].sort((a, b) {
        return b - a;
    });
}
console.log("ordenarDeMayorAMenor([2,3,4]): ", ordenarDeMayorAMenor([2, 3, 4]));
console.log("ordenarDeMayorAMenor(listaNumerosEjemplo): ", ordenarDeMayorAMenor(listaNumerosEjemplo));

/**
 * 08 - encontrarNumeroMayor
 */
function encontrarNumeroMayor(listaDeNumeros) {
    let mayor =
        listaDeNumeros[0];
    for (let i = 1; i <
         listaDeNumeros.length; i++) {
              if (listaDeNumeros[i] > mayor) {
                  mayor =
            listaDeNumeros[i];
              }
}
       return mayor;
} 
console.log("encontrarNumeroMayor([2,3,4]): ", encontrarNumeroMayor([2, 3, 4]));
console.log("encontrarNumeroMayor(listaNumerosEjemplo): ", encontrarNumeroMayor(listaNumerosEjemplo));

/**
 * 09 - ordenarPalabrasPorLongitud
 */
function ordenarPalabrasPorLongitud(listaDePalabras) {
    return [...listaDePalabras].sort((a, b) => a.length - b.length);
}
console.log("ordenarPalabrasPorLongitud(['abc', 'a', 'ab']): ", ordenarPalabrasPorLongitud(['abc', 'a', 'ab']));

/**
 * 10 - encontrarPalabraMasCorta
 */
function encontrarPalabraMasCorta(listaDePalabras) {
        let palabraMasCorta = 
    listaDePalabras[0];

       for (let i = 1; i < 
    listaDePalabras.length; i++) {
       if
    (listaDePalabras[i].length <
     palabraMasCorta.length) {
              palabraMasCorta =
     listaDePalabras[i];
       }
    return palabraMasCorta;

       }
}
console.log("encontrarPalabraMasCorta(['abc', 'a', 'ab']): ", encontrarPalabraMasCorta(['abc', 'a', 'ab']));

/**
 * 11 - filtrarSoloPositivos
 */
function filtrarSoloPositivos(listaDeNumeros) {
          let positivos = [];

          for (let i = 0; i <
        listaDeNumeros.length; i++) {
            if (listaDeNumeros[i] > 0) {
                positivos.push(listaDeNumeros[i]);
            }
          }
                
    return positivos;
}
console.log("filtrarSoloPositivos([1,-1,0]): ", filtrarSoloPositivos([1, -1, 0]));
console.log("filtrarSoloPositivos(listaNumerosEjemplo): ", filtrarSoloPositivos(listaNumerosEjemplo));

/**
 * 12 - contarAprobados
 */
function contarAprobados(listaDeNotas) {
          let aprobados = 0;
          for (let i = 0, i <
        listaDeNotas.length; i++) {
               if (listaDeNotas[i] >= 6)
               {
                   aprobados++;
               }
          }
    return aprobados;
}
console.log("contarAprobados([10, 4, 6, 7, 1, 9]): ", contarAprobados([10, 4, 6, 7, 1, 9]));

/**
 * 13 - filtrarSoloTruthy
 */
function filtrarSoloTruthy(listaDeValores) {
    let valoresTruthy = [];

    for (let i = 0; i <
listaDeValores.length; i++) {
        if(listaDeValores[i]) {

valoresTruthy.push(listaDeValores[i]);
        }
    }
    return valoresTruthy;
}
console.log("filtrarSoloTruthy(): ", filtrarSoloTruthy(["Hola", "", null, 1, 0, -1, undefined, [], {}]));

/**
 * 14 - enumerarLista
 */
function enumerarLista(listaDePalabras) {
    if (listaDePalabras.length === 0) return "";
    if (listaDePalabras.length === 1) return listaDePalabras[0] + ".";
    
    var ultimos = listaDePalabras.slice(-1);
    var primeros = listaDePalabras.slice(0, -1);
    
    return primeros.join(", ") + " y " + ultimos[0] + ".";
}
console.log("enumerarLista(): ", enumerarLista(["Han", "Leia", "Luke", "Yoda"]));
