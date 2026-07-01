// ===================================================================
// EscanerQR.jsx — Escáner de códigos QR con la cámara del dispositivo.
//
// Cómo funciona (sin hardware especial, solo el navegador):
//   1. Pide permiso para usar la cámara (getUserMedia). En el teléfono usa
//      la cámara trasera ("environment").
//   2. Muestra el video en vivo y, varias veces por segundo, "fotografía" un
//      cuadro en un canvas invisible y le pide a la librería jsQR que busque
//      un código QR en esa imagen.
//   3. Cuando encuentra uno, llama a onCodigo(texto) y deja de escanear.
//
// IMPORTANTE: los navegadores solo permiten la cámara en páginas seguras
// (https:// o localhost). Si se abre por http:// con una IP, no funcionará.
//
// Uso:
//   <EscanerQR onCodigo={(texto) => validar(texto)} />
// ===================================================================

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { CameraOff } from "lucide-react";

const MILISEGUNDOS_ENTRE_INTENTOS = 200; // ~5 intentos por segundo

export default function EscanerQR({ onCodigo }) {
  const videoRef = useRef(null);
  const [errorCamara, setErrorCamara] = useState("");

  useEffect(() => {
    let stream = null;       // la conexión con la cámara
    let intervalo = null;    // el ciclo de escaneo
    let encontrado = false;  // para avisar solo UNA vez

    // Canvas invisible donde "fotografiamos" cada cuadro del video.
    const canvas = document.createElement("canvas");
    const contexto = canvas.getContext("2d", { willReadFrequently: true });

    async function iniciar() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }, // cámara trasera en teléfonos
          audio: false,
        });
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        intervalo = setInterval(() => {
          if (encontrado || video.readyState !== video.HAVE_ENOUGH_DATA) return;

          // Copiamos el cuadro actual del video al canvas y buscamos un QR.
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          contexto.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imagen = contexto.getImageData(0, 0, canvas.width, canvas.height);
          const qr = jsQR(imagen.data, imagen.width, imagen.height);

          if (qr && qr.data) {
            encontrado = true;
            onCodigo(qr.data.trim());
          }
        }, MILISEGUNDOS_ENTRE_INTENTOS);
      } catch {
        setErrorCamara(
          "No se pudo abrir la cámara. Revisa el permiso de cámara del navegador " +
          "(y que la página sea https:// o localhost)."
        );
      }
    }

    iniciar();

    // Limpieza: al cerrar el escáner, apagamos la cámara y el ciclo.
    return () => {
      if (intervalo) clearInterval(intervalo);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [onCodigo]);

  if (errorCamara) {
    return (
      <div className="rounded-2xl bg-black/5 p-6 text-center text-texto-suave">
        <CameraOff className="w-8 h-8 mx-auto mb-2" />
        <p className="text-sm">{errorCamara}</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black">
      {/* El video en vivo de la cámara */}
      <video ref={videoRef} playsInline muted className="w-full aspect-square object-cover" />

      {/* Marco guía: un recuadro con esquinas doradas al centro */}
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <div className="relative w-3/5 aspect-square">
          <span className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-oro rounded-tl-xl" />
          <span className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-oro rounded-tr-xl" />
          <span className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-oro rounded-bl-xl" />
          <span className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-oro rounded-br-xl" />
        </div>
      </div>

      <p className="absolute bottom-3 inset-x-0 text-center text-white/90 text-sm">
        Apunta la cámara al código QR del pase
      </p>
    </div>
  );
}
