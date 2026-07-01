// ===================================================================
// branding.js — La "identidad" del residencial (personalizable por cliente).
//
// 👉 ANTES DE UN DEMO: cambia estos datos por los del residencial del cliente.
//    - nombre:     el nombre del residencial (aparece en el login y en la barra superior).
//    - subtitulo:  una frase corta debajo del nombre.
//    - logoTexto:  iniciales que se muestran si NO hay imagen de logo (ej. "LC").
//    - logoUrl:    ruta a una imagen de logo. Pon el archivo en la carpeta "public/"
//                  y usa la ruta "/mi-logo.png". Si lo dejas en null, se usa logoTexto.
//    - portadaUrl: ruta a una foto de portada para el login (ej. "/portada.jpg" en "public/").
//                  Si lo dejas en null, se usa un fondo verde elegante por defecto.
// ===================================================================

export const branding = {
  nombre: "Mi Aguja",
  subtitulo: "Residencial privado",
  logoTexto: "A",
  logoUrl: "/logo.webp",
  portadaUrl: "/portada.webp",
};
