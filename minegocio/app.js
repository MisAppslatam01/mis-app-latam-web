(function () {
  const cfg = window.MI_NEGOCIO || {};
  const numero = String(cfg.whatsapp || "").replace(/\D/g, "");
  const configurado = numero.length >= 10 && !String(cfg.whatsapp).includes("X");

  const anio = document.getElementById("year");
  if (anio) anio.textContent = new Date().getFullYear();

  function enlaceWhatsApp(texto) {
    return "https://wa.me/" + numero + "?text=" + encodeURIComponent(texto);
  }

  function abrirWhatsApp(texto) {
    if (!configurado) {
      alert("Falta configurar el número de WhatsApp en config.js.");
      return;
    }
    window.open(enlaceWhatsApp(texto), "_blank", "noopener,noreferrer");
  }

  ["wa-header", "wa-float"].forEach(function (id) {
    const boton = document.getElementById(id);
    if (!boton) return;
    boton.addEventListener("click", function (e) {
      e.preventDefault();
      abrirWhatsApp(cfg.mensaje || "Hola, quiero Mi Negocio.");
    });
  });

  const btnDescarga = document.getElementById("btn-descarga");
  if (btnDescarga && cfg.instalador) {
    btnDescarga.setAttribute("href", cfg.instalador);
    btnDescarga.setAttribute("download", "");
  }

  const waLicencia = document.getElementById("wa-licencia");
  if (waLicencia) {
    waLicencia.addEventListener("click", function (e) {
      e.preventDefault();
      abrirWhatsApp(cfg.mensajeLicencia || "Hola, necesito ayuda con Mi Negocio.");
    });
  }

  const contenedorPlanes = document.getElementById("planes");
  const planes = Array.isArray(cfg.planes) ? cfg.planes : [];
  if (contenedorPlanes && planes.length) {
    contenedorPlanes.innerHTML = planes.map(function (p, index) {
      const incluye = (p.incluye || []).map(function (x) { return "<li>" + x + "</li>"; }).join("");
      return (
        '<article class="plan' + (p.destacado ? " plan-destacado" : "") + '">' +
          (p.destacado ? '<span class="plan-badge">Todo incluido</span>' : "") +
          '<span class="plan-nombre">' + p.nombre + '</span>' +
          '<strong class="plan-precio">' + p.precio + ' <small>COP</small></strong>' +
          '<ul class="plan-lista">' + incluye + '</ul>' +
          '<button class="btn primary full plan-accion" type="button" data-plan-index="' + index + '">Comprar licencia</button>' +
        '</article>'
      );
    }).join("");

    contenedorPlanes.querySelectorAll(".plan-accion").forEach(function (boton) {
      boton.addEventListener("click", function () {
        abrirPago(Number(boton.getAttribute("data-plan-index")));
      });
    });
  }

  function abrirPago(index) {
    const plan = planes[index] || planes[0];
    if (!plan) return;
    const pagos = cfg.pagos || {};
    const filas = [];
    if (pagos.nequi) filas.push(["Nequi", pagos.nequi]);
    if (pagos.llaveBreB) filas.push(["Llave Bre-B", pagos.llaveBreB]);
    if (pagos.banco && pagos.cuenta) filas.push([pagos.banco + " " + (pagos.tipoCuenta || ""), pagos.cuenta]);
    if (pagos.titular) filas.push(["Titular", pagos.titular]);

    const datos = filas.length
      ? filas.map(function (f) { return "<div><dt>" + f[0] + "</dt><dd>" + f[1] + "</dd></div>"; }).join("")
      : '<div><dt>Datos</dt><dd>Escríbenos por WhatsApp</dd></div>';

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
          '<h3>Pagar por transferencia / Bre-B</h3>' +
          '<p>Copia la llave o usa los datos de abajo. Después envía el comprobante por WhatsApp.</p>' +
          '<dl class="pago-datos">' + datos + '</dl>' +
          (pagos.llaveBreB ? '<button class="btn ghost full" id="pago-copiar" type="button">📋 Copiar llave Bre-B</button>' : '') +
          '<p class="pago-aviso">Si tu banco permite escanear QR, pide el QR por WhatsApp. La llave Bre-B también sirve para transferir desde tu banco.</p>' +
          '<button class="btn primary full" id="pago-comprobante" type="button">📲 Ya pagué: enviar comprobante</button>' +
          '<p class="pago-nota">' + (pagos.nota || '') + '</p>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);
    document.body.classList.add("pago-abierto");

    modal.querySelector(".pago-cerrar").addEventListener("click", cerrarPago);
    modal.addEventListener("click", function (e) { if (e.target === modal) cerrarPago(); });
    const copiar = modal.querySelector("#pago-copiar");
    if (copiar) copiar.addEventListener("click", function () { copiarLlave(pagos.llaveBreB, copiar); });
    modal.querySelector("#pago-comprobante").addEventListener("click", function () {
      abrirWhatsApp("Hola, ya pagué " + plan.nombre + " de Mi Negocio (" + plan.precio + " COP). Te envío el comprobante.");
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

  document.querySelectorAll("[data-legal]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      alert("Documento pendiente: agrega la página legal correspondiente antes de publicar.");
    });
  });
})();
