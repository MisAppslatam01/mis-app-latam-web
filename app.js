(function () {
  const cfg = window.MI_ALMACEN || {};
  const numero = String(cfg.whatsapp || "").replace(/\D/g, "");
  const configurado = numero.length >= 10 && !String(cfg.whatsapp).includes("X");

  const aviso = document.getElementById("config-warning");
  if (aviso && !configurado) aviso.hidden = false;

  const anio = document.getElementById("year");
  if (anio) anio.textContent = new Date().getFullYear();

  const precio = document.getElementById("precio-texto");
  if (precio && cfg.precio) precio.textContent = cfg.precio;

  function enlaceWhatsApp(texto) {
    return "https://wa.me/" + numero + "?text=" + encodeURIComponent(texto);
  }

  function abrirWhatsApp(texto) {
    if (!configurado) {
      alert("Falta configurar el número de WhatsApp en config.js antes de publicar.");
      return;
    }
    window.open(enlaceWhatsApp(texto), "_blank", "noopener,noreferrer");
  }

  // Botones de WhatsApp (encabezado y flotante si existe)
  ["wa-header", "wa-float"].forEach(function (id) {
    const boton = document.getElementById(id);
    if (!boton) return;
    boton.addEventListener("click", function (e) {
      e.preventDefault();
      abrirWhatsApp(cfg.mensaje || "Hola, quiero la demo de MI ALMACÉN.");
    });
  });

  // --- Formulario de demo: abre WhatsApp y habilita la descarga ---
  const form = document.getElementById("form-demo");
  const nota = document.getElementById("form-note");
  const bloqueDescarga = document.getElementById("descarga-demo");
  const btnDescarga = document.getElementById("btn-descarga");
  if (btnDescarga && cfg.instalador) btnDescarga.setAttribute("href", cfg.instalador);

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const nombre = form.nombre.value.trim();
      const empresa = form.empresa.value.trim();
      const correo = form.correo.value.trim();
      const whatsapp = form.whatsapp.value.trim();

      if (!nombre || !correo || !whatsapp) {
        alert("Completa nombre, correo y WhatsApp.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        alert("Revisa el correo.");
        return;
      }

      const texto =
        "Hola, quiero la demo de " + (cfg.diasDemo || 10) + " días de MI ALMACÉN.\n" +
        "Nombre: " + nombre + "\n" +
        "Empresa: " + (empresa || "No indicada") + "\n" +
        "Correo: " + correo + "\n" +
        "WhatsApp: " + whatsapp;

      abrirWhatsApp(texto);

      if (bloqueDescarga) {
        bloqueDescarga.hidden = false;
        bloqueDescarga.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      if (nota) {
        nota.textContent = configurado
          ? "Se abrió WhatsApp con tus datos y la descarga quedó habilitada."
          : "Descarga habilitada. Falta configurar el WhatsApp del negocio en config.js.";
      }
    });
  }

  // --- Planes y precios ---
  const contenedorPlanes = document.getElementById("planes");
  const planes = Array.isArray(cfg.planes) ? cfg.planes : [];

  if (contenedorPlanes && planes.length) {
    contenedorPlanes.innerHTML = planes.map(function (p, index) {
      const incluye = (p.incluye || []).map(function (x) {
        return "<li>" + x + "</li>";
      }).join("");
      return (
        '<article class="plan' + (p.destacado ? " plan-destacado" : "") + '">' +
          (p.destacado ? '<span class="plan-badge">Recomendado</span>' : "") +
          '<span class="plan-nombre">' + p.nombre + '</span>' +
          '<strong class="plan-precio">' + p.precio + ' <small>COP</small></strong>' +
          '<ul class="plan-lista">' + incluye + '</ul>' +
          '<button class="btn primary full plan-accion" type="button" data-plan-index="' + index + '">Comprar ' + p.nombre + '</button>' +
        '</article>'
      );
    }).join("");

    contenedorPlanes.querySelectorAll(".plan-accion").forEach(function (boton) {
      boton.addEventListener("click", function () {
        abrirPago(Number(boton.getAttribute("data-plan-index")));
      });
    });
  }

  // --- Modal de pago: una sola entrada, dos formas de pagar ---
  let pagoActual = null;

  function abrirPago(index) {
    const plan = planes[index] || planes[0];
    if (!plan) return;
    pagoActual = plan;
    const pagos = cfg.pagos || {};
    const filas = [];
    if (pagos.nequi) filas.push(["Nequi", pagos.nequi]);
    if (pagos.llaveBreB) filas.push(["Llave Bre-B", pagos.llaveBreB]);
    if (pagos.banco && pagos.cuenta) filas.push([pagos.banco + " " + (pagos.tipoCuenta || ""), pagos.cuenta]);
    if (pagos.titular) filas.push(["Titular", pagos.titular]);

    const datos = filas.length
      ? filas.map(function (f) { return "<div><dt>" + f[0] + "</dt><dd>" + f[1] + "</dd></div>"; }).join("")
      : '<div><dt>Datos</dt><dd>Escríbenos por WhatsApp</dd></div>';

    const qr = pagos.qr
      ? '<img class="pago-qr" src="' + pagos.qr + '" alt="QR para pagar por Bre-B">'
      : '<p class="pago-aviso">Copia la llave Bre-B y págala desde tu banco. Si tu banco permite escanear QR, pide el QR por WhatsApp.</p>';

    const modal = document.createElement("div");
    modal.className = "pago-overlay";
    modal.id = "pago-overlay";
    modal.innerHTML =
      '<div class="pago-card" role="dialog" aria-modal="true" aria-labelledby="pago-titulo">' +
        '<button class="pago-cerrar" type="button" aria-label="Cerrar">×</button>' +
        '<span class="pago-eyebrow">PAGO ÚNICO</span>' +
        '<h2 id="pago-titulo">' + plan.nombre + '</h2>' +
        '<div class="pago-precio">' + plan.precio + ' <small>COP</small></div>' +
        '<div class="pago-bloque">' +
          '<h3>Pagar con tarjeta</h3>' +
          '<p>Checkout seguro de Wompi. El código de activación llega por WhatsApp.</p>' +
          '<button class="btn primary full" id="pago-wompi" type="button">💳 Pagar con tarjeta</button>' +
        '</div>' +
        '<div class="pago-separador"><span>o transferencia / Bre-B</span></div>' +
        '<div class="pago-bloque">' +
          '<dl class="pago-datos">' + datos + '</dl>' +
          (pagos.llaveBreB ? '<button class="btn ghost full" id="pago-copiar" type="button">📋 Copiar llave Bre-B</button>' : '') +
          qr +
          '<button class="btn ghost full" id="pago-comprobante" type="button">📲 Ya pagué: enviar comprobante</button>' +
          '<p class="pago-nota">' + (pagos.nota || '') + '</p>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);
    document.body.classList.add("pago-abierto");

    modal.querySelector(".pago-cerrar").addEventListener("click", cerrarPago);
    modal.addEventListener("click", function (e) { if (e.target === modal) cerrarPago(); });
    modal.querySelector("#pago-wompi").addEventListener("click", function () {
      if (plan.wompi) {
        window.open(plan.wompi, "_blank", "noopener,noreferrer");
      } else {
        abrirWhatsApp("Hola, quiero pagar " + plan.nombre + " (" + plan.precio + " COP) con tarjeta. ¿Me compartes el enlace?");
      }
    });
    const copiar = modal.querySelector("#pago-copiar");
    if (copiar) copiar.addEventListener("click", function () { copiarLlave(pagos.llaveBreB, copiar); });
    modal.querySelector("#pago-comprobante").addEventListener("click", function () {
      const metodo = pagos.llaveBreB ? "Bre-B / transferencia" : "transferencia";
      abrirWhatsApp("Hola, ya pagué " + plan.nombre + " (" + plan.precio + " COP) por " + metodo + ". Te envío el comprobante.");
    });
  }

  function cerrarPago() {
    const modal = document.getElementById("pago-overlay");
    if (modal) modal.remove();
    document.body.classList.remove("pago-abierto");
  }

  function copiarLlave(texto, boton) {
    const valor = String(texto || "").replace(/\s+/g, "");
    if (!valor) return;
    const listo = function () {
      const original = boton.textContent;
      boton.textContent = "✅ Llave copiada";
      setTimeout(function () { boton.textContent = original; }, 2200);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(valor).then(listo).catch(function () { copiarConSeleccion(valor, listo); });
    } else {
      copiarConSeleccion(valor, listo);
    }
  }

  function copiarConSeleccion(valor, listo) {
    const input = document.createElement("textarea");
    input.value = valor;
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    try { document.execCommand("copy"); listo(); } catch (e) { alert("Copia manualmente: " + valor); }
    input.remove();
  }


  // --- Legales ---
  document.querySelectorAll("[data-legal]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      alert("Documento pendiente: agrega la página legal correspondiente antes de publicar.");
    });
  });
})();
