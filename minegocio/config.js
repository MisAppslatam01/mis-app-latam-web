/* Configuración de la página de MI NEGOCIO */
window.MI_NEGOCIO = {
  whatsapp: "573161646220",
  correo: "soporte@mialmacen.com",

  // Precio de lanzamiento y precio normal.
  precio: "$60.000 COP",
  precioRegular: "$80.000 COP",

  // Paquete que se descarga.
  instalador: "app/index.html",

  planes: [
    {
      nombre: "Licencia única",
      precio: "$60.000",
      destacado: true,
      incluye: [
        "1 computador + 1 celular",
        "Instalación y configuración inicial",
        "Ventas, domicilios y propinas",
        "Costos, producción y utilidad",
        "Personal y congelador",
        "Licencia permanente",
        "Soporte por WhatsApp 30 días"
      ]
    }
  ],

  // Pago por transferencia / Bre-B.
  pagos: {
    nequi: "",
    llaveBreB: "316 164 6220",
    banco: "Bancolombia",
    tipoCuenta: "Ahorros",
    cuenta: "",
    titular: "",
    nit: "",
    nota: "Al pagar, envía el comprobante por WhatsApp. Recibes tu código de activación apenas se confirme el pago."
  },

  mensaje: "Hola, quiero Mi Negocio para mi negocio de comida. ¿Me ayudas con la descarga?",
  mensajeCompra: "Hola, quiero comprar Mi Negocio ($60.000 COP). Te envío el comprobante.",
  mensajeTransferencia: "Hola, voy a pagar Mi Negocio por transferencia/Bre-B. Te envío el comprobante.",
  mensajeLicencia: "Hola, ya compré Mi Negocio. Te envío el comprobante para recibir mi código de activación."
};
