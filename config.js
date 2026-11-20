/* Configura estos datos antes de publicar. */
window.MI_ALMACEN = {
  // Número de WhatsApp en formato internacional, sin + ni espacios.
  whatsapp: "573161646220",

  // Correo de soporte que aparecerá en la página.
  correo: "soporte@mialmacen.com",

  // Precio de referencia (se muestra en la tarjeta superior si se usa).
  precio: "Desde $119.000 COP",

  // Plans que se muestran en la página.
  // wompi: pega el link de pago de ESE plan. Si queda vacío, el botón de tarjeta
  // manda a WhatsApp para que el cliente pida el enlace.
  planes: [
    {
      nombre: "Plan Local",
      precio: "$119.000",
      destacado: false,
      incluye: [
        "1 computador",
        "1 usuario",
        "Actualizaciones 6 meses",
        "Soporte por WhatsApp 30 días",
        "Licencia permanente"
      ],
      wompi: "https://checkout.wompi.co/l/ZpqyPY"
    },
    {
      nombre: "Plan Negocio",
      precio: "$179.000",
      destacado: true,
      incluye: [
        "1 computador",
        "Hasta 2 usuarios",
        "Actualizaciones 1 año",
        "Soporte prioritario 1 año",
        "Licencia permanente"
      ],
      wompi: "https://checkout.wompi.co/l/NGscZp"
    }
  ],

  // Enlace general de Wompi (opcional, si usas uno solo para ambos planes).
  wompi: "",

  // --- Pago por transferencia (0% comisión para ti) ---
  // Llena solo lo que quieras mostrar. Lo que quede vacío no aparece.
  pagos: {
    nequi: "",
    llaveBreB: "316 164 6220",        // tu celular con Bre-B
    banco: "Bancolombia",
    tipoCuenta: "Ahorros",
    cuenta: "",                        // número de cuenta (opcional)
    titular: "",                       // tu nombre como aparece en la cuenta de Bancolombia
    nit: "",                           // NIT (opcional)
    nota: "Al pagar, envía el comprobante por WhatsApp. Recibes tu código de activación apenas se confirme el pago."
  },

  mensajeTransferencia: "Hola, voy a pagar MI ALMACÉN por transferencia/Bre-B. Te envío el comprobante por aquí.",

  // Nombre del instalador que se descarga desde la página.
  instalador: "Instalador-Almacen-1.7.0.exe",

  // Días de la demo.
  diasDemo: 10,

  // Mensajes de WhatsApp.
  mensaje: "Hola, quiero la demo de 10 días de MI ALMACÉN.",
  mensajeCompra: "Hola, quiero comprar MI ALMACÉN. ¿Cómo hago el pago?"
};
