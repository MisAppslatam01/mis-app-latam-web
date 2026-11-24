'use strict';

/* ============================================================
   Mi Negocio · app de ventas, costos y domicilios
   ============================================================ */

const KEY = 'minegocio_v1';
const LICENCIA_PUBLICA = 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEQWmCeetbsGM7GYRrtX1Cx05kgngT0VMCB0G/6K5OHFlg+7ZDTqy6hN2oNYxvmwWBTQCqpIY789MWBbCk5BvG0g==';
const SERVER_MODE = location.protocol === 'http:' || location.protocol === 'https:';
let SERVER_API = false;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

const hoyISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const horaISO = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
const addDias = (iso, n) => {
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  const x = new Date(y, m - 1, d);
  x.setDate(x.getDate() + n);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};
const fmtFecha = (iso) => {
  if (!iso) return '';
  if (iso === hoyISO()) return 'Hoy';
  if (iso === addDias(hoyISO(), -1)) return 'Ayer';
  return new Date(`${iso}T12:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
};
const fmtFechaLarga = (iso = hoyISO()) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });

const money = (n) => '$' + Math.round(Number(n) || 0).toLocaleString('es-CO');
const num = (n) => {
  if (typeof n === 'number') return isFinite(n) ? n : 0;
  const x = Number(String(n == null ? '' : n).replace(/[^0-9.-]/g, ''));
  return isFinite(x) ? x : 0;
};
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const clone = (o) => JSON.parse(JSON.stringify(o));
const initials = (s) => String(s || '?').trim().split(/\s+/).slice(0, 2).map((x) => x[0]).join('').toUpperCase();
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

const ESTADOS = {
  nuevo: 'Nuevo',
  preparando: 'Preparando',
  en_camino: 'En camino',
  entregado: 'Entregado',
  cancelado: 'Cancelado'
};
const ESTADO_CLASE = { nuevo: 'new', preparando: 'prep', en_camino: 'road', entregado: 'done', cancelado: 'cancel' };
const PAGOS = { efectivo: 'Efectivo', nequi: 'Nequi', daviplata: 'Daviplata', qr: 'QR', tarjeta: 'Tarjeta' };
const TIPOS = { domicilio: 'Domicilio', recoger: 'Recoger', mesa: 'Mesa' };

const TIPOS_NEGOCIO = [
  {
    id: 'pasteleria',
    nombre: 'Pastelería',
    emoji: '🥟',
    desc: 'Pasteles, masas y rellenos',
    inventario: 'congelador',
    categorias: ['Pasteles', 'Bebidas', 'Otros'],
    sugeridos: [
      { nombre: 'Pastel de pollo', categoria: 'Pasteles', precio: 7000 },
      { nombre: 'Pastel de carne', categoria: 'Pasteles', precio: 7500 },
      { nombre: 'Pastel de cerdo', categoria: 'Pasteles', precio: 7500 },
      { nombre: 'Pastel mixto', categoria: 'Pasteles', precio: 8000 },
      { nombre: 'Gaseosa 400 ml', categoria: 'Bebidas', precio: 2500 },
      { nombre: 'Agua 600 ml', categoria: 'Bebidas', precio: 2000 }
    ]
  },
  {
    id: 'fritos',
    nombre: 'Fritos y arepas',
    emoji: '🌽',
    desc: 'Empanadas, deditos, arepas',
    inventario: 'simple',
    categorias: ['Fritos', 'Arepas', 'Bebidas', 'Otros'],
    sugeridos: [
      { nombre: 'Empanada de carne', categoria: 'Fritos', precio: 2500 },
      { nombre: 'Dedito de queso', categoria: 'Fritos', precio: 2000 },
      { nombre: 'Papa rellena', categoria: 'Fritos', precio: 3000 },
      { nombre: 'Arepa de huevo', categoria: 'Arepas', precio: 3500 },
      { nombre: 'Arepa de queso', categoria: 'Arepas', precio: 3000 },
      { nombre: 'Gaseosa 400 ml', categoria: 'Bebidas', precio: 2500 }
    ]
  },
  {
    id: 'rapidas',
    nombre: 'Comidas rápidas',
    emoji: '🍔',
    desc: 'Perros, hamburguesas, salchipapas',
    inventario: 'ninguno',
    categorias: ['Comidas rápidas', 'Bebidas', 'Otros'],
    sugeridos: [
      { nombre: 'Perro callejero', categoria: 'Comidas rápidas', precio: 5000 },
      { nombre: 'Hamburguesa sencilla', categoria: 'Comidas rápidas', precio: 8000 },
      { nombre: 'Salchipapa', categoria: 'Comidas rápidas', precio: 7000 },
      { nombre: 'Papas a la francesa', categoria: 'Comidas rápidas', precio: 4000 },
      { nombre: 'Gaseosa 400 ml', categoria: 'Bebidas', precio: 2500 }
    ]
  },
  {
    id: 'caseras',
    nombre: 'Comidas caseras',
    emoji: '🍲',
    desc: 'Almuerzos, sopas y jugos',
    inventario: 'simple',
    categorias: ['Almuerzos', 'Sopas', 'Bebidas', 'Otros'],
    sugeridos: [
      { nombre: 'Almuerzo del día', categoria: 'Almuerzos', precio: 8000 },
      { nombre: 'Sopa del día', categoria: 'Sopas', precio: 6000 },
      { nombre: 'Arepa', categoria: 'Almuerzos', precio: 2000 },
      { nombre: 'Jugo natural', categoria: 'Bebidas', precio: 2500 }
    ]
  },
  {
    id: 'cafeteria',
    nombre: 'Cafetería',
    emoji: '☕',
    desc: 'Café, panadería y bebidas',
    categorias: ['Bebidas calientes', 'Bebidas frías', 'Panadería', 'Otros'],
    sugeridos: [
      { nombre: 'Café', categoria: 'Bebidas calientes', precio: 2500 },
      { nombre: 'Capuchino', categoria: 'Bebidas calientes', precio: 4500 },
      { nombre: 'Pan', categoria: 'Panadería', precio: 2000 },
      { nombre: 'Jugo natural', categoria: 'Bebidas frías', precio: 3000 }
    ]
  },
  {
    id: 'mixto',
    nombre: 'Negocio mixto',
    emoji: '🍽️',
    desc: 'Un poco de todo',
    inventario: 'simple',
    categorias: ['Pasteles', 'Fritos', 'Arepas', 'Comidas rápidas', 'Bebidas', 'Otros'],
    sugeridos: [
      { nombre: 'Pastel de pollo', categoria: 'Pasteles', precio: 7000 },
      { nombre: 'Empanada de carne', categoria: 'Fritos', precio: 2500 },
      { nombre: 'Arepa de huevo', categoria: 'Arepas', precio: 3500 },
      { nombre: 'Perro callejero', categoria: 'Comidas rápidas', precio: 5000 },
      { nombre: 'Gaseosa 400 ml', categoria: 'Bebidas', precio: 2500 }
    ]
  }
];

const EMOJI_CATEGORIA = {
  'Pasteles': '🥟',
  'Fritos': '🍟',
  'Arepas': '🌽',
  'Comidas rápidas': '🍔',
  'Bebidas': '🥤',
  'Bebidas calientes': '☕',
  'Bebidas frías': '🧊',
  'Panadería': '🥖',
  'Almuerzos': '🍲',
  'Sopas': '🥣',
  'Combos': '🍱',
  'Otros': '🍽️'
};

/* ============================================================
   Datos iniciales
   ============================================================ */
const DEFAULTS = {
  cfg: {
    negocio: 'Mi Negocio',
    lema: 'Comida, costos y domicilios',
    whatsapp: '',
    nequi: '',
    direccion: '',
    ciudad: '',
    domicilio: 3000,
    propinas: [1000, 2000, 5000],
    qr: '',
    logo: '',
    licencia: { codigo: '', activa: false, equipo: '' },
    setupCompleto: false,
    modoInventario: 'simple',
    demoInicio: 0,
    demoHasta: 0,
    ultimaCopia: ''
  },
  productos: [],
  insumos: [
    { id: 'i1', nombre: 'Arroz', unidad: 'bulto', stock: 0, costoPromedio: 0, stockMinimo: 0 },
    { id: 'i2', nombre: 'Pollo', unidad: 'libra', stock: 0, costoPromedio: 0, stockMinimo: 0 },
    { id: 'i3', nombre: 'Cerdo', unidad: 'libra', stock: 0, costoPromedio: 0, stockMinimo: 0 },
    { id: 'i4', nombre: 'Verduras', unidad: 'libra', stock: 0, costoPromedio: 0, stockMinimo: 0 },
    { id: 'i5', nombre: 'Bijao', unidad: 'paquete', stock: 0, costoPromedio: 0, stockMinimo: 0 },
    { id: 'i6', nombre: 'Aceite', unidad: 'litro', stock: 0, costoPromedio: 0, stockMinimo: 0 },
    { id: 'i7', nombre: 'Masa', unidad: 'libra', stock: 0, costoPromedio: 0, stockMinimo: 0 },
    { id: 'i8', nombre: 'Queso', unidad: 'libra', stock: 0, costoPromedio: 0, stockMinimo: 0 },
    { id: 'i9', nombre: 'Papa', unidad: 'libra', stock: 0, costoPromedio: 0, stockMinimo: 0 },
    { id: 'i10', nombre: 'Empaques', unidad: 'paquete', stock: 0, costoPromedio: 0, stockMinimo: 0 }
  ],
  recetas: [],
  proveedores: [],
  compras: [],
  producciones: [],
  pedidos: [],
  clientes: [],
  domiciliarios: [],
  empleados: [],
  pagosPersonal: [],
  gastos: [],
  mermas: [],
  cierres: [],
  caja: { fecha: hoyISO(), abierta: false, base: 0 },
  seq: { pedido: 0 },
  ui: {}
};

/* ============================================================
   Estado
   ============================================================ */
function normalizar(d) {
  const base = clone(DEFAULTS);
  const s = Object.assign(base, d || {});
  s.cfg = Object.assign(clone(DEFAULTS.cfg), (d && d.cfg) || {});
  ['productos', 'insumos', 'recetas', 'proveedores', 'compras', 'producciones', 'pedidos', 'clientes', 'domiciliarios', 'empleados', 'pagosPersonal', 'gastos', 'mermas', 'cierres'].forEach((k) => {
    if (!Array.isArray(s[k])) s[k] = [];
  });
  s.seq = Object.assign({ pedido: 0 }, (d && d.seq) || {});
  s.caja = Object.assign({ fecha: hoyISO(), abierta: false, base: 0 }, (d && d.caja) || {});
  s.cfg.propinas = Array.isArray(s.cfg.propinas) ? s.cfg.propinas.map(num).filter((x) => x >= 0) : [1000, 2000, 5000];
  if (!s.cfg.propinas.length) s.cfg.propinas = [1000, 2000, 5000];
  s.cfg.licencia = Object.assign({ codigo: '', activa: false, equipo: '' }, s.cfg.licencia || {});
  if (!s.cfg.licencia.equipo) s.cfg.licencia.equipo = 'EQ-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  s.cfg.demoInicio = num(s.cfg.demoInicio);
  s.cfg.demoHasta = num(s.cfg.demoHasta);
  if (d && d.cfg && typeof d.cfg.setupCompleto === 'boolean') s.cfg.setupCompleto = d.cfg.setupCompleto;
  else s.cfg.setupCompleto = Array.isArray(s.productos) && s.productos.length > 0;
  if (s.cfg.setupCompleto && !s.cfg.demoHasta) {
    s.cfg.demoInicio = Date.now();
    s.cfg.demoHasta = s.cfg.demoInicio + 10 * 24 * 60 * 60 * 1000;
  }
  if (!['ninguno', 'simple', 'congelador'].includes(s.cfg.modoInventario)) {
    s.cfg.modoInventario = s.productos.some((p) => p.llevaInventario) ? 'simple' : 'ninguno';
  }
  s.productos.forEach((p) => {
    p.precio = num(p.precio);
    p.costoDirecto = num(p.costoDirecto);
    p.costoPromedio = num(p.costoPromedio);
    p.stock = num(p.stock);
    p.stockMinimo = num(p.stockMinimo);
    p.llevaInventario = !!p.llevaInventario;
    p.disponible = p.disponible !== false;
    p.modoCosto = p.modoCosto || 'directo';
    p.unidad = p.unidad || 'unidad';
    p.categoria = p.categoria || 'Otros';
  });
  s.insumos.forEach((i) => {
    i.stock = num(i.stock);
    i.costoPromedio = num(i.costoPromedio);
    i.stockMinimo = num(i.stockMinimo);
    i.unidad = i.unidad || 'unidad';
  });
  s.pedidos.forEach((p) => {
    p.total = num(p.total);
    p.subtotal = num(p.subtotal);
    p.domicilio = num(p.domicilio);
    p.propina = num(p.propina);
    p.costoVendido = num(p.costoVendido);
    p.pagado = !!p.pagado;
    p.items = Array.isArray(p.items) ? p.items : [];
  });
  return s;
}

function cargar() {
  if (SERVER_MODE) {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/api/estado', false);
      xhr.send(null);
      if (xhr.status === 200 || xhr.status === 204) SERVER_API = true;
      if (xhr.status === 200 && xhr.responseText.trim()) {
        return normalizar(JSON.parse(xhr.responseText));
      }
    } catch (e) {}
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return normalizar(null);
    return normalizar(JSON.parse(raw));
  } catch (e) {
    return normalizar(null);
  }
}
let S = cargar();
let UI = {
  tab: 'hoy',
  cat: 'Todos',
  cart: [],
  clienteId: '',
  tipo: 'domicilio',
  pago: 'efectivo',
  propina: 0,
  domicilio: null,
  domiciliarioId: '',
  notas: '',
  pagado: true,
  filtro: 'todos',
  periodo: 'hoy',
  lineas: [],
  lineasTipo: '',
  prodDraft: {},
  recetaProducto: '',
  recetaUnidades: 1,
  setup: {
    paso: 1,
    tipo: '',
    negocio: S.cfg.negocio || 'Mi Negocio',
    whatsapp: S.cfg.whatsapp || '',
    ciudad: S.cfg.ciudad || '',
    direccion: S.cfg.direccion || '',
    domicilio: num(S.cfg.domicilio) || 3000,
    modoInventario: S.cfg.modoInventario || 'simple',
    logo: '',
    productos: []
  }
};

function guardar() {
  try {
    localStorage.setItem(KEY, JSON.stringify(S));
  } catch (e) {
    toast('No se pudo guardar. Libera espacio en el navegador.');
  }
  if (SERVER_MODE) {
    try {
      fetch('/api/estado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(S)
      }).catch(() => {});
    } catch (e) {}
  }
  if (window.nubeProgramar) window.nubeProgramar();
}

function setTab(tab) {
  if (!S.cfg.setupCompleto) return;
  UI.tab = tab;
  closeSheet();
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ============================================================
   Cálculos
   ============================================================ */
function prod(id) { return S.productos.find((p) => p.id === id); }
function insumo(id) { return S.insumos.find((i) => i.id === id); }
function cliente(id) { return S.clientes.find((c) => c.id === id); }
function domiciliario(id) { return S.domiciliarios.find((d) => d.id === id); }
function proveedor(id) { return S.proveedores.find((p) => p.id === id); }
function recetaDe(productoId) { return S.recetas.find((r) => r.productoId === productoId); }

function costoReceta(productoId) {
  const r = recetaDe(productoId);
  if (!r || !Array.isArray(r.lineas) || !r.lineas.length || !num(r.unidades)) return null;
  const total = r.lineas.reduce((s, l) => {
    const i = insumo(l.insumoId);
    return s + (i ? num(l.cantidad) * num(i.costoPromedio) : 0);
  }, 0);
  return total / num(r.unidades);
}

function costoProducto(p) {
  if (!p) return 0;
  if (p.modoCosto === 'receta') {
    const c = costoReceta(p.id);
    if (c != null) return c;
  }
  if (p.modoCosto === 'lote' && num(p.costoPromedio) > 0) return num(p.costoPromedio);
  return num(p.costoDirecto) || num(p.costoPromedio) || 0;
}

function margen(p) {
  const c = costoProducto(p);
  return num(p.precio) > 0 ? ((num(p.precio) - c) / num(p.precio)) * 100 : 0;
}

function pedidosHoy() {
  return S.pedidos.filter((p) => p.fecha === hoyISO() && p.estado !== 'cancelado');
}
function pedidosPeriodo(periodo) {
  const hoy = hoyISO();
  let desde = hoy;
  if (periodo === 'semana') desde = addDias(hoy, -6);
  if (periodo === 'mes') desde = `${hoy.slice(0, 7)}-01`;
  if (periodo === 'todo') desde = '2000-01-01';
  return S.pedidos.filter((p) => p.estado !== 'cancelado' && p.fecha >= desde && p.fecha <= hoy);
}
function gastosPeriodo(periodo) {
  const hoy = hoyISO();
  let desde = hoy;
  if (periodo === 'semana') desde = addDias(hoy, -6);
  if (periodo === 'mes') desde = `${hoy.slice(0, 7)}-01`;
  if (periodo === 'todo') desde = '2000-01-01';
  return S.gastos.filter((g) => g.fecha >= desde && g.fecha <= hoy);
}
function mermasPeriodo(periodo) {
  const hoy = hoyISO();
  let desde = hoy;
  if (periodo === 'semana') desde = addDias(hoy, -6);
  if (periodo === 'mes') desde = `${hoy.slice(0, 7)}-01`;
  if (periodo === 'todo') desde = '2000-01-01';
  return S.mermas.filter((m) => m.fecha >= desde && m.fecha <= hoy);
}

function resumenUtilidad(periodo) {
  const pedidos = pedidosPeriodo(periodo);
  const ventas = pedidos.reduce((s, p) => s + num(p.subtotal), 0);
  const costo = pedidos.reduce((s, p) => s + num(p.costoVendido), 0);
  const gastos = gastosPeriodo(periodo).reduce((s, g) => s + num(g.monto), 0);
  const merma = mermasPeriodo(periodo).reduce((s, m) => s + num(m.cantidad) * num(m.costoUnitario), 0);
  const utilidad = ventas - costo - gastos - merma;
  const margen = ventas > 0 ? (utilidad / ventas) * 100 : 0;
  const propinas = pedidos.reduce((s, p) => s + num(p.propina), 0);
  const domicilios = pedidos.reduce((s, p) => s + num(p.domicilio), 0);
  return { pedidos, ventas, costo, gastos, merma, utilidad, margen, propinas, domicilios };
}

function resumenCaja() {
  const abierta = S.caja.fecha === hoyISO() && S.caja.abierta;
  const base = abierta ? num(S.caja.base) : 0;
  const pedidos = pedidosHoy().filter((p) => p.pagado);
  const ventas = { efectivo: 0, nequi: 0, daviplata: 0, qr: 0, tarjeta: 0 };
  pedidos.forEach((p) => {
    const m = PAGOS[p.metodo] ? p.metodo : 'efectivo';
    ventas[m] += num(p.total);
  });
  const propinas = pedidos.reduce((s, p) => s + num(p.propina), 0);
  const domicilios = pedidos.reduce((s, p) => s + num(p.domicilio), 0);
  const gastos = S.gastos.filter((g) => g.fecha === hoyISO());
  const gastosEfectivo = gastos.filter((g) => (g.metodo || 'efectivo') === 'efectivo').reduce((s, g) => s + num(g.monto), 0);
  const comprasEfectivo = S.compras.filter((c) => c.fecha === hoyISO() && c.pagada && (c.metodo || 'efectivo') === 'efectivo').reduce((s, c) => s + num(c.total), 0);
  const efectivoEsperado = base + ventas.efectivo - gastosEfectivo - comprasEfectivo;
  const porCobrar = pedidosHoy().filter((p) => !p.pagado).reduce((s, p) => s + num(p.total), 0);
  return { abierta, base, ventas, propinas, domicilios, gastos, gastosEfectivo, comprasEfectivo, efectivoEsperado, porCobrar };
}

function totalCarrito() {
  return UI.cart.reduce((s, l) => {
    const p = prod(l.productoId);
    return s + (p ? num(p.precio) * l.cantidad : 0);
  }, 0);
}
function cantidadCarrito() { return UI.cart.reduce((s, l) => s + l.cantidad, 0); }

function nuevoNumero() {
  S.seq.pedido = num(S.seq.pedido) + 1;
  return String(S.seq.pedido).padStart(4, '0');
}

/* ============================================================
   UI base
   ============================================================ */
function toast(msg) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('on'), 2600);
}

function sheet(titulo, cuerpo, pie = '') {
  $('#sheetRoot').innerHTML = `
    <div class="overlay" onclick="if(event.target===this)closeSheet()">
      <div class="sheet">
        <div class="sheet-head"><h2>${esc(titulo)}</h2><button class="icon-btn" style="background:var(--bg2);color:var(--ink);border-color:var(--line)" onclick="closeSheet()">✕</button></div>
        <div class="sheet-body">${cuerpo}</div>
        ${pie ? `<div class="sheet-foot">${pie}</div>` : ''}
      </div>
    </div>`;
  document.body.classList.add('sheet-open');
}
function closeSheet() {
  $('#sheetRoot').innerHTML = '';
  document.body.classList.remove('sheet-open');
}

function campo(id, label, valor = '', tipo = 'text', extra = '') {
  return `<div class="field"><label>${esc(label)}</label><input id="${id}" type="${tipo}" value="${esc(valor)}" ${extra}></div>`;
}
function selectCampo(id, label, opciones, valor = '', extra = '') {
  return `<div class="field"><label>${esc(label)}</label><select id="${id}" ${extra}>${opciones.map((o) => `<option value="${esc(o.v)}" ${String(o.v) === String(valor) ? 'selected' : ''}>${esc(o.t)}</option>`).join('')}</select></div>`;
}

function renderHeader() {
  const nombre = S.cfg.negocio || 'Mi Negocio';
  $('#hNegocio').textContent = nombre;
  $('#hFecha').textContent = S.cfg.setupCompleto
    ? `${fmtFechaLarga()} · ${S.caja.abierta && S.caja.fecha === hoyISO() ? 'Caja abierta' : 'Caja cerrada'}`
    : 'Configuración inicial';
  const logo = $('#hLogo');
  if (S.cfg.logo) {
    logo.innerHTML = `<img src="${S.cfg.logo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:14px">`;
  } else {
    logo.textContent = '🍲';
  }
}

function renderNav() {
  $$('.nav-btn').forEach((b) => b.classList.toggle('on', b.dataset.tab === UI.tab));
}

function demoDiasRestantes() {
  if (!S.cfg.demoHasta) return 0;
  return Math.max(0, Math.ceil((S.cfg.demoHasta - Date.now()) / (24 * 60 * 60 * 1000)));
}
function demoVencida() {
  return !S.cfg.licencia.activa && !!S.cfg.demoHasta && Date.now() > S.cfg.demoHasta;
}
function b64Bytes(texto) {
  const bin = atob(String(texto || '').replace(/\s+/g, ''));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
async function verificarLicencia(obj) {
  if (!obj || !obj.payload || !obj.signature) throw new Error('El archivo no es una licencia de Mi Negocio.');
  if (obj.payload.producto !== 'minegocio' || obj.payload.version !== 1) throw new Error('Producto o versión incorrectos.');
  const actual = String(S.cfg.licencia.equipo || '').toUpperCase();
  const equipos = (Array.isArray(obj.payload.equipos) && obj.payload.equipos.length
    ? obj.payload.equipos
    : [obj.payload.equipo]).map((x) => String(x || '').toUpperCase());
  if (!equipos.includes(actual)) throw new Error('La licencia es para otro equipo.');
  if (obj.payload.plan === 'local' && equipos.length > 1) throw new Error('El plan Local es para un solo equipo.');
  const key = await crypto.subtle.importKey(
    'spki', b64Bytes(LICENCIA_PUBLICA),
    { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']
  );
  const data = new TextEncoder().encode(JSON.stringify(obj.payload));
  return crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, b64Bytes(obj.signature), data);
}
async function importarLicencia(input) {
  const file = input && input.files && input.files[0];
  if (!file) return;
  try {
    const obj = JSON.parse(await file.text());
    if (!(await verificarLicencia(obj))) throw new Error('La firma no es válida.');
    const equipos = Array.isArray(obj.payload.equipos) && obj.payload.equipos.length
      ? obj.payload.equipos
      : [obj.payload.equipo];
    S.cfg.licencia = Object.assign({}, S.cfg.licencia, {
      activa: true,
      codigo: obj.payload.plan,
      plan: obj.payload.plan,
      cliente: obj.payload.cliente,
      emitida: obj.payload.emitida,
      equipos,
      archivo: obj
    });
    guardar();
    render();
    toast('Licencia activada. Plan: ' + obj.payload.plan + ' · ' + equipos.length + ' equipo(s).');
  } catch (e) {
    toast(e.message || 'No se pudo activar la licencia.');
  } finally {
    input.value = '';
  }
}
function paginaDemoVencida() {
  const wa = String(S.cfg.whatsapp || '').replace(/\D/g, '');
  return `<div class="card" style="max-width:560px;margin:24px auto">
    <div class="setup-brand"><div class="setup-logo">🍲</div><div><h1>Mi Negocio</h1><p>Demo terminada</p></div></div>
    <h2>Tu demo de 10 días terminó</h2>
    <p class="muted">Tus datos siguen guardados. Para seguir vendiendo, activa la licencia de este equipo.</p>
    <div class="notice mt10">Código del equipo: <b>${esc(S.cfg.licencia.equipo)}</b></div>
    <label class="btn primary block mt10" style="display:flex;justify-content:center">Cargar archivo de licencia<input type="file" accept=".json,application/json" style="display:none" onchange="importarLicencia(this)"></label>
    <button class="btn ghost block mt10" onclick="abrirCopiaSheet()">Guardar copia de seguridad</button>
    ${wa ? `<a class="btn soft block mt10" href="https://wa.me/${wa}?text=${encodeURIComponent('Hola, quiero activar Mi Negocio. Código de equipo: ' + S.cfg.licencia.equipo)}" target="_blank" rel="noopener">Pedir activación por WhatsApp</a>` : ''}
    <p class="xs muted mt10">Si ya pagaste, envía el código del equipo al vendedor.</p>
  </div>`;
}
function render() {
  document.body.classList.toggle('setup-mode', !S.cfg.setupCompleto);
  renderHeader();
  if (!S.cfg.setupCompleto) {
    closeSheet();
    $('#app').innerHTML = paginaSetup();
    return;
  }
  if (demoVencida()) {
    renderNav();
    $('#app').innerHTML = paginaDemoVencida();
    return;
  }
  renderNav();
  const fn = {
    hoy: paginaHoy,
    vender: paginaVender,
    pedidos: paginaPedidos,
    domicilios: paginaDomicilios,
    caja: paginaCaja,
    mas: paginaMas,
    productos: paginaProductos,
    insumos: paginaInsumos,
    compras: paginaCompras,
    proveedores: paginaProveedores,
    produccion: paginaProduccion,
    recetas: paginaRecetas,
    utilidad: paginaUtilidad,
    gastos: paginaGastos,
    merma: paginaMerma,
    personal: paginaPersonal,
    congelador: paginaCongelador,
    clientes: paginaClientes,
    domiciliarios: paginaDomiciliarios,
    ajustes: paginaAjustes
  }[UI.tab] || paginaHoy;
  $('#app').innerHTML = fn();
}

/* ============================================================
   CONFIGURACIÓN INICIAL
   ============================================================ */
function paginaSetup() {
  const st = UI.setup;
  const tipo = TIPOS_NEGOCIO.find((t) => t.id === st.tipo);
  const paso = st.paso;
  let h = `<div class="setup-wrap">
    <div class="setup-brand">
      <div class="setup-logo">🍲</div>
      <div><h1>Mi Negocio</h1><p>Comida, costos y domicilios</p></div>
    </div>
    <div class="setup-progress">
      <span class="${paso >= 1 ? 'on' : ''}">1</span><i></i>
      <span class="${paso >= 2 ? 'on' : ''}">2</span><i></i>
      <span class="${paso >= 3 ? 'on' : ''}">3</span>
    </div>`;

  if (paso === 1) {
    h += `<div class="setup-hero">
      <span class="pill">Paso 1 de 3</span>
      <h2>¿Qué tipo de negocio tienes?</h2>
      <p class="muted">Elige la base. Después puedes cambiar productos, precios y categorías.</p>
    </div>
    <div class="type-grid">
      ${TIPOS_NEGOCIO.map((t) => `<button class="type-card" onclick="setupElegirTipo('${t.id}')">
        <span class="type-emoji">${t.emoji}</span>
        <b>${esc(t.nombre)}</b>
        <span>${esc(t.desc)}</span>
      </button>`).join('')}
    </div>
    <p class="xs muted center mt14">Podrás agregar más productos y categorías después.</p>`;
  }

  if (paso === 2) {
    h += `<div class="setup-hero">
      <span class="pill">Paso 2 de 3 · ${esc(tipo ? tipo.nombre : '')}</span>
      <h2>Datos de tu negocio</h2>
      <p class="muted">Así aparecerán en la app y en los recibos.</p>
    </div>
    <div class="card">
      ${campo('sNegocio', 'Nombre del negocio', st.negocio, 'text', 'oninput="UI.setup.negocio=this.value"')}
      <div class="two">
        ${campo('sWhatsapp', 'WhatsApp', st.whatsapp, 'text', 'oninput="UI.setup.whatsapp=this.value" placeholder="300 123 4567"')}
        ${campo('sCiudad', 'Ciudad', st.ciudad, 'text', 'oninput="UI.setup.ciudad=this.value"')}
      </div>
      ${campo('sDireccion', 'Dirección', st.direccion, 'text', 'oninput="UI.setup.direccion=this.value"')}
      <div class="photo-pick">
        <div><div class="small bold">Logo o foto del negocio</div><div class="xs muted">Opcional. Se verá en la cabecera y los recibos.</div></div>
        ${st.logo ? `<img src="${st.logo}" alt="Logo del negocio">` : ''}
        <label class="btn ghost sm" style="display:inline-flex">Elegir imagen<input type="file" accept="image/*" style="display:none" onchange="setupLogo(this)"></label>
      </div>
      <div class="field"><label>Domicilio por defecto</label><input id="sDomicilio" type="number" value="${num(st.domicilio)}" oninput="UI.setup.domicilio=this.value"></div>
      <div class="field">
        <label>¿Cómo manejas el inventario?</label>
        <select id="sModoInv" onchange="UI.setup.modoInventario=this.value">
          <option value="ninguno" ${st.modoInventario === 'ninguno' ? 'selected' : ''}>No manejo inventario: vendo y ya</option>
          <option value="simple" ${st.modoInventario === 'simple' ? 'selected' : ''}>Inventario simple: llevo lo que tengo</option>
          <option value="congelador" ${st.modoInventario === 'congelador' ? 'selected' : ''}>Congelador por lotes: produzco para varios días</option>
        </select>
        <div class="hint">${st.modoInventario === 'congelador' ? 'Ideal para pasteles: produces 500, guardas en congelador y vendes 100, 200 o 300 por día.' : st.modoInventario === 'ninguno' ? 'Ideal para comidas rápidas: el stock no frena la venta.' : 'Descuenta unidades al vender y avisa cuando queda poco.'}</div>
      </div>
      <div class="row mt10">
        <button class="btn ghost" onclick="setupIr(1)">‹ Atrás</button>
        <button class="btn primary grow" onclick="setupIrProductos()">Continuar con productos ›</button>
      </div>
    </div>`;
  }

  if (paso === 3) {
    h += `<div class="setup-hero">
      <span class="pill">Paso 3 de 3 · ${esc(tipo ? tipo.nombre : '')}</span>
      <h2>Tus productos</h2>
      <p class="muted">Escribe el nombre y el precio de venta. Puedes borrar los que no vendas.</p>
    </div>
    <div class="setup-products">
      ${st.productos.map((p, i) => `<div class="setup-prod">
        <label class="setup-label">Nombre del producto ${i + 1}</label>
        <input class="setup-name" value="${esc(p.nombre)}" placeholder="Escribe aquí el nombre" oninput="setupProd(${i},'nombre',this.value)">
        <div class="setup-prod-row">
          <select onchange="setupProd(${i},'categoria',this.value)" aria-label="Categoría">
            ${(tipo ? tipo.categorias : ['Otros']).map((c) => `<option value="${esc(c)}" ${p.categoria === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}
          </select>
          <div class="setup-price"><span>$</span><input type="number" value="${esc(p.precio)}" placeholder="Precio" aria-label="Precio de venta" oninput="setupProd(${i},'precio',this.value)"></div>
          <div class="setup-price"><span>Costo</span><input type="number" min="0" value="${esc(p.costo == null ? 0 : p.costo)}" placeholder="Costo" aria-label="Costo directo" oninput="setupProd(${i},'costo',this.value)"></div>
          <div class="setup-price"><span>Stock</span><input type="number" min="0" value="${esc(p.stock == null ? 10 : p.stock)}" placeholder="Stock" aria-label="Stock inicial" oninput="setupProd(${i},'stock',this.value)"></div>
          <button class="btn danger sm" onclick="setupQuitarProducto(${i})" aria-label="Quitar producto">✕</button>
        </div>
      </div>`).join('')}
    </div>
    <button class="btn soft block mt10" onclick="setupAgregarProducto()">+ Agregar otro producto</button>
    <div class="notice mt10">Mínimo un producto con nombre y precio. El costo lo puedes completar después en Productos.</div>
    <div class="row mt14">
      <button class="btn ghost" onclick="setupIr(2)">‹ Atrás</button>
      <button class="btn primary grow" onclick="setupFinalizar()">Crear mi negocio</button>
    </div>`;
  }

  h += `<div class="card mt14">
    <div class="card-title"><h2>¿Tienes una copia de seguridad?</h2></div>
    <p class="small muted">Si borraste los datos o cambiaste de celular, puedes recuperar todo sin volver a llenar la configuración.</p>
    <label class="btn soft block mt10" style="display:flex;justify-content:center">Elegir archivo de copia<input type="file" id="setupImport" accept=".json,application/json" style="display:none" onchange="importarRespaldo(this)"></label>
    <button class="link block mt10" onclick="restaurarTextoSheet()">No tengo el archivo: pegar texto</button>
  </div>`;
  h += `<p class="xs muted center mt14">Tus datos se guardan en este equipo. Guarda una copia de seguridad de vez en cuando.</p></div>`;
  return h;
}

function setupElegirTipo(id) {
  const tipo = TIPOS_NEGOCIO.find((t) => t.id === id);
  if (!tipo) return;
  UI.setup.tipo = id;
  UI.setup.productos = tipo.sugeridos.map((p) => ({ nombre: p.nombre, categoria: p.categoria, precio: p.precio, costo: 0, stock: 10 }));
  UI.setup.modoInventario = tipo.inventario || 'simple';
  UI.setup.paso = 2;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupIr(paso) {
  UI.setup.paso = paso;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupIrProductos() {
  const nombre = String(UI.setup.negocio || '').trim();
  if (!nombre) return toast('Escribe el nombre del negocio.');
  UI.setup.negocio = nombre;
  if (!UI.setup.productos.length) {
    const tipo = TIPOS_NEGOCIO.find((t) => t.id === UI.setup.tipo);
    UI.setup.productos = (tipo ? tipo.sugeridos : []).map((p) => ({ nombre: p.nombre, categoria: p.categoria, precio: p.precio, costo: 0, stock: 10 }));
  }
  UI.setup.paso = 3;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupLogo(input) {
  const f = input.files && input.files[0];
  if (!f) return;
  if (!/^image\//.test(f.type)) return toast('Escoge una imagen PNG o JPG.');
  if (f.size > 2 * 1024 * 1024) return toast('La imagen es muy pesada. Usa una menor a 2 MB.');
  const r = new FileReader();
  r.onload = () => {
    UI.setup.logo = r.result;
    render();
    toast('Logo listo. Se guardará al crear el negocio.');
  };
  r.onerror = () => toast('No se pudo leer la imagen.');
  r.readAsDataURL(f);
}

function setupProd(i, campo, valor) {
  if (!UI.setup.productos[i]) return;
  UI.setup.productos[i][campo] = valor;
}

function setupAgregarProducto() {
  const tipo = TIPOS_NEGOCIO.find((t) => t.id === UI.setup.tipo);
  UI.setup.productos.push({ nombre: '', categoria: tipo ? tipo.categorias[0] : 'Otros', precio: '', costo: 0, stock: 10 });
  render();
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  setTimeout(() => {
    const inputs = $$('.setup-name');
    if (inputs.length) inputs[inputs.length - 1].focus();
  }, 200);
}

function setupQuitarProducto(i) {
  UI.setup.productos.splice(i, 1);
  render();
}

function setupFinalizar() {
  const tipo = TIPOS_NEGOCIO.find((t) => t.id === UI.setup.tipo);
  const productos = UI.setup.productos
    .map((p) => ({ nombre: String(p.nombre || '').trim(), categoria: p.categoria || 'Otros', precio: num(p.precio), costo: num(p.costo), stock: num(p.stock) }))
    .filter((p) => p.nombre && p.precio > 0);
  if (!productos.length) return toast('Agrega al menos un producto con nombre y precio.');
  S.cfg.negocio = String(UI.setup.negocio || '').trim() || 'Mi Negocio';
  S.cfg.whatsapp = String(UI.setup.whatsapp || '').trim();
  S.cfg.ciudad = String(UI.setup.ciudad || '').trim();
  S.cfg.direccion = String(UI.setup.direccion || '').trim();
  S.cfg.logo = UI.setup.logo || '';
  S.cfg.domicilio = num(UI.setup.domicilio) || 3000;
  S.cfg.lema = S.cfg.lema || 'Comida, costos y domicilios';
  S.cfg.modoInventario = UI.setup.modoInventario || 'simple';
  S.productos = productos.map((p) => ({
    id: uid(),
    nombre: p.nombre,
    categoria: p.categoria,
    unidad: 'unidad',
    precio: p.precio,
    costoDirecto: p.costo,
    modoCosto: 'directo',
    costoPromedio: p.costo,
    stock: p.stock,
    stockMinimo: 0,
    llevaInventario: S.cfg.modoInventario !== 'ninguno',
    disponible: true,
    emoji: EMOJI_CATEGORIA[p.categoria] || '🍽️'
  }));
  S.cfg.setupCompleto = true;
  S.cfg.demoInicio = Date.now();
  S.cfg.demoHasta = S.cfg.demoInicio + 10 * 24 * 60 * 60 * 1000;
  S.seq.pedido = 0;
  guardar();
  UI.tab = 'hoy';
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  toast(`${S.cfg.negocio} quedó listo con ${S.productos.length} productos.`);
}

/* ============================================================
   HOY
   ============================================================ */
function paginaHoy() {
  const hoy = pedidosHoy();
  const caja = resumenCaja();
  const u = resumenUtilidad('hoy');
  const porEntregar = hoy.filter((p) => p.estado !== 'entregado').length;
  const enCamino = hoy.filter((p) => p.estado === 'en_camino').length;
  const ultimos = [...hoy].sort((a, b) => (b.creado || 0) - (a.creado || 0)).slice(0, 4);

  let h = '';
  h += `<div class="stats">
    <div class="stat accent"><b>${money(hoy.reduce((s, p) => s + num(p.total), 0))}</b><span>Ventas de hoy</span></div>
    <div class="stat ${porEntregar ? 'warn' : 'ok'}"><b>${porEntregar}</b><span>Por entregar</span></div>
    <div class="stat ${caja.porCobrar ? 'danger' : ''}"><b>${money(caja.porCobrar)}</b><span>Por cobrar</span></div>
    <div class="stat"><b>${money(caja.propinas)}</b><span>Propinas</span></div>
  </div>`;
  if (!S.cfg.licencia.activa) {
    h += `<div class="notice ${demoDiasRestantes() <= 2 ? '' : 'green'} mt10"><b>Demo:</b> ${demoDiasRestantes()} día${demoDiasRestantes() === 1 ? '' : 's'} restante${demoDiasRestantes() === 1 ? '' : 's'}. Tus datos quedan guardados.</div>`;
  }

  h += `<div class="grid2" style="gap:8px;margin-bottom:12px">
    <button class="btn primary" onclick="setTab('vender')">+ Nuevo pedido</button>
    <button class="btn soft" onclick="setTab('domicilios')">🛵 Domicilios ${enCamino ? `(${enCamino})` : ''}</button>
    <button class="btn ghost" onclick="setTab('caja')">💵 Caja</button>
    <button class="btn ghost" onclick="setTab('utilidad')">📊 Utilidad</button>
  </div>`;

  if ((S.cfg.modoInventario || 'simple') !== 'ninguno') {
    const conStock = S.productos.filter((p) => num(p.stock) > 0);
    const unidades = conStock.reduce((s, p) => s + num(p.stock), 0);
    const bajos = S.productos.filter((p) => p.llevaInventario && num(p.stock) <= num(p.stockMinimo)).length;
    h += `<div class="card tight">
      <div class="row between">
        <div><b>${S.cfg.modoInventario === 'congelador' ? '🧊 Congelador' : '📦 Inventario'}</b><div class="small muted">${unidades} unidades en ${conStock.length} productos${bajos ? ` · ${bajos} con stock bajo` : ''}</div></div>
        <button class="btn sm ghost" onclick="setTab('congelador')">Ver ›</button>
      </div>
    </div>`;
  }

  h += `<div class="card">
    <div class="card-title"><h2>Pedidos de hoy</h2><button class="link" onclick="setTab('pedidos')">Ver todos ›</button></div>`;
  h += ultimos.length ? ultimos.map((p) => tarjetaPedido(p, true)).join('') : `<div class="empty"><span class="big">🧾</span>Todavía no hay pedidos hoy.<br><button class="btn primary sm mt10" onclick="setTab('vender')">Crear el primero</button></div>`;
  h += `</div>`;

  const domiciliosActivos = hoy.filter((p) => p.tipo === 'domicilio' && !['entregado', 'cancelado'].includes(p.estado));
  h += `<div class="card">
    <div class="card-title"><h2>Domicilios activos</h2><button class="link" onclick="setTab('domicilios')">Tablero ›</button></div>`;
  h += domiciliosActivos.length ? domiciliosActivos.slice(0, 4).map((p) => `
    <div class="list-item">
      <div class="avatar">🛵</div>
      <div class="list-main"><b>${esc(p.clienteNombre)}</b><span>${esc(p.direccion || 'Sin dirección')} · ${esc(ESTADOS[p.estado])}</span></div>
      <div class="amount">${money(p.total)}</div>
    </div>`).join('') : `<div class="empty">No hay domicilios pendientes.</div>`;
  h += `</div>`;

  h += `<div class="card">
    <div class="card-title"><h2>Resumen del día</h2><button class="link" onclick="setTab('utilidad')">Utilidad ›</button></div>
    <div class="total-row"><span>Ventas de productos</span><b>${money(u.ventas)}</b></div>
    <div class="total-row"><span>Costo de lo vendido</span><b>− ${money(u.costo)}</b></div>
    <div class="total-row"><span>Gastos</span><b>− ${money(u.gastos)}</b></div>
    <div class="total-row"><span>Merma</span><b>− ${money(u.merma)}</b></div>
    <div class="total-row big"><span>Utilidad</span><span>${money(u.utilidad)}</span></div>
    <div class="notice mt10 ${u.utilidad >= 0 ? 'green' : ''}">${u.utilidad >= 0 ? 'Vas ganando. Revisa el detalle en Utilidad.' : 'Ojo: los gastos y costos superan las ventas de hoy.'}</div>
  </div>`;

  return h;
}

/* ============================================================
   VENDER
   ============================================================ */
function paginaVender() {
  const cats = ['Todos', ...Array.from(new Set(S.productos.filter((p) => p.disponible).map((p) => p.categoria)))];
  if (!cats.includes(UI.cat)) UI.cat = 'Todos';
  const lista = S.productos.filter((p) => p.disponible && (UI.cat === 'Todos' || p.categoria === UI.cat));
  const total = totalCarrito();
  const clienteSel = cliente(UI.clienteId);
  const dom = UI.domicilio == null ? num(S.cfg.domicilio) : num(UI.domicilio);
  const propina = num(UI.propina);
  const totalFinal = total + (UI.tipo === 'domicilio' ? dom : 0) + propina;

  let h = '';
  h += `<div class="row between" style="margin-bottom:6px">
    <div><h2>Vender</h2><p class="small muted">Toca los productos para armar el pedido.</p></div>
    <span class="pill">${cantidadCarrito()} ítems</span>
  </div>`;

  h += `<div class="chips">${cats.map((c) => `<button class="chip ${UI.cat === c ? 'on' : ''}" onclick="setCat('${esc(c)}')">${esc(c)}</button>`).join('')}</div>`;

  h += `<div class="prod-grid">${lista.map((p) => {
    const sinStock = p.llevaInventario && num(p.stock) <= 0;
    return `<button class="prod ${sinStock ? 'off' : ''}" onclick="addCart('${p.id}')" ${sinStock ? 'disabled' : ''}>
      <span class="emoji">${esc(p.emoji || '🍽️')}</span>
      <span class="name">${esc(p.nombre)}</span>
      <span class="meta">${esc(p.categoria)}${p.llevaInventario ? ` · ${num(p.stock)} disp.` : ''}</span>
      <span class="price">${money(p.precio)}</span>
    </button>`;
  }).join('')}</div>`;

  if (UI.cart.length) {
    h += `<div class="card mt14">
      <div class="card-title"><h2>Carrito</h2><button class="link" onclick="vaciarCarrito()">Vaciar</button></div>
      ${UI.cart.map((l) => {
        const p = prod(l.productoId);
        if (!p) return '';
        return `<div class="cart-line">
          <div class="grow"><b class="small">${esc(p.nombre)}</b><div class="xs muted">${money(p.precio)} c/u</div></div>
          <div class="qty"><button onclick="menosCart('${p.id}')">−</button><input id="qty-${p.id}" type="number" inputmode="numeric" min="1" step="1" value="${l.cantidad}" aria-label="Cantidad" onchange="setCartQty('${p.id}',this.value)"><button onclick="masCart('${p.id}')">+</button></div>
          <b class="small" style="min-width:68px;text-align:right">${money(num(p.precio) * l.cantidad)}</b>
        </div>`;
      }).join('')}
    </div>`;
  }

  h += `<div class="card">
    <div class="card-title"><h2>Datos del pedido</h2></div>
    <div class="field"><label>Cliente</label>
      <div class="row">
        <select id="vCliente" class="grow" onchange="UI.clienteId=this.value;UI.dir='';render()">
          <option value="">Cliente de mostrador</option>
          ${S.clientes.map((c) => `<option value="${c.id}" ${UI.clienteId === c.id ? 'selected' : ''}>${esc(c.nombre)}${c.telefono ? ' · ' + esc(c.telefono) : ''}</option>`).join('')}
        </select>
        <button class="btn ghost sm" onclick="formCliente()">+</button>
      </div>
    </div>
    <div class="seg" style="margin-bottom:10px">
      ${Object.entries(TIPOS).map(([k, v]) => `<button class="${UI.tipo === k ? 'on' : ''}" onclick="setTipo('${k}')">${v}</button>`).join('')}
    </div>
    ${UI.tipo === 'mesa' ? `<div class="field"><label>Mesa</label><input id="vMesa" value="${esc(UI.mesa || '')}" placeholder="4" oninput="UI.mesa=this.value"></div>` : ''}
    ${UI.tipo === 'domicilio' ? `
      <div class="field"><label>Dirección de entrega</label><input id="vDir" value="${esc(UI.dir || (clienteSel ? clienteSel.direccion : ''))}" placeholder="Calle 12 #4-56" oninput="UI.dir=this.value"></div>
      <div class="two">
        <div class="field"><label>Domicilio</label><input id="vDom" type="number" value="${dom}" oninput="UI.domicilio=this.value;actualizarTotales()"></div>
        <div class="field"><label>Domiciliario</label><select id="vDomi" onchange="UI.domiciliarioId=this.value">
          <option value="">Sin asignar</option>
          ${S.domiciliarios.filter((d) => d.activo !== false).map((d) => `<option value="${d.id}" ${UI.domiciliarioId === d.id ? 'selected' : ''}>${esc(d.nombre)}</option>`).join('')}
        </select></div>
      </div>` : ''}
    <div class="two">
      <div class="field"><label>Pago</label><select id="vPago" onchange="UI.pago=this.value;render()">
        ${Object.entries(PAGOS).map(([k, v]) => `<option value="${k}" ${UI.pago === k ? 'selected' : ''}>${v}</option>`).join('')}
      </select></div>
      <div class="field"><label>¿Pagado?</label><select id="vPagado" onchange="UI.pagado=this.value==='1'">
        <option value="1" ${UI.pagado ? 'selected' : ''}>Sí, pagado</option>
        <option value="0" ${!UI.pagado ? 'selected' : ''}>No, queda debiendo</option>
      </select></div>
    </div>
    ${UI.pago === 'qr' ? `<button class="btn soft block" style="margin-bottom:10px" onclick="verQR()">📱 Ver QR para cobrar</button>` : ''}
    <div class="field"><label>Propina</label>
      <div class="row wrap" style="gap:6px">
        ${[0, ...S.cfg.propinas].map((x) => `<button class="chip ${num(UI.propina) === num(x) ? 'on' : ''}" onclick="setPropina(${num(x)})">${x === 0 ? 'Sin propina' : money(x)}</button>`).join('')}
        <input type="number" id="vPropina" value="${propina}" style="width:100px;border:1px solid var(--line);border-radius:10px;padding:7px" oninput="UI.propina=this.value;actualizarTotales()">
      </div>
    </div>
    <div class="field"><label>Notas de cocina</label><input id="vNotas" value="${esc(UI.notas)}" placeholder="Sin cebolla, bien frito..." oninput="UI.notas=this.value"></div>
    <div class="total-row"><span>Productos</span><b>${money(total)}</b></div>
    ${UI.tipo === 'domicilio' ? `<div class="total-row"><span>Domicilio</span><b>${money(dom)}</b></div>` : ''}
    <div class="total-row"><span>Propina</span><b>${money(propina)}</b></div>
    <div class="total-row big"><span>Total</span><span id="vTotal">${money(totalFinal)}</span></div>
    <button class="btn primary lg block mt10" onclick="guardarPedido()" ${!UI.cart.length ? 'disabled' : ''}>Guardar pedido</button>
  </div>`;
  return h;
}

function setCat(c) { UI.cat = c; render(); }
function setTipo(t) {
  UI.tipo = t;
  UI.domicilio = t === 'domicilio' ? (num(UI.domicilio) > 0 ? num(UI.domicilio) : num(S.cfg.domicilio)) : 0;
  render();
}
function setPropina(v) { UI.propina = v; render(); }
function masCart(id) {
  const l = UI.cart.find((x) => x.productoId === id);
  if (l) l.cantidad++;
  else UI.cart.push({ productoId: id, cantidad: 1 });
  render();
}
function menosCart(id) {
  const l = UI.cart.find((x) => x.productoId === id);
  if (!l) return;
  l.cantidad--;
  if (l.cantidad <= 0) UI.cart = UI.cart.filter((x) => x.productoId !== id);
  render();
}
function setCartQty(id, valor) {
  const l = UI.cart.find((x) => x.productoId === id);
  if (!l) return;
  const n = Math.max(1, Math.min(9999, Math.floor(num(valor))));
  l.cantidad = n;
  render();
}
function addCart(id) { masCart(id); }
function vaciarCarrito() { UI.cart = []; render(); }
function actualizarTotales() {
  const t = totalCarrito();
  const dom = UI.tipo === 'domicilio' ? (UI.domicilio == null ? num(S.cfg.domicilio) : num(UI.domicilio)) : 0;
  const el = $('#vTotal');
  if (el) el.textContent = money(t + dom + num(UI.propina));
}

function guardarPedido() {
  UI.cart.forEach((l) => {
    const el = document.getElementById('qty-' + l.productoId);
    if (el) l.cantidad = Math.max(1, Math.min(9999, Math.floor(num(el.value))));
  });
  if (!UI.cart.length) return toast('Agrega al menos un producto.');
  const cli = cliente(UI.clienteId);
  let clienteId = cli ? cli.id : '';
  let nombre = cli ? cli.nombre : 'Cliente de mostrador';
  let telefono = cli ? cli.telefono : '';
  let direccion = UI.dir || (cli ? cli.direccion : '') || '';
  if (!cli) {
    const n = prompt('Nombre del cliente (opcional):', 'Cliente de mostrador');
    if (n === null) return;
    if (n.trim()) nombre = n.trim();
    if (nombre !== 'Cliente de mostrador') {
      const c = { id: uid(), nombre, telefono: '', direccion, barrio: '', notas: '' };
      S.clientes.push(c);
      clienteId = c.id;
      UI.clienteId = c.id;
    }
  }
  const items = UI.cart.map((l) => {
    const p = prod(l.productoId);
    return {
      productoId: p.id,
      nombre: p.nombre,
      cantidad: l.cantidad,
      precio: num(p.precio),
      costoUnitario: costoProducto(p)
    };
  });
  const subtotal = items.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const dom = UI.tipo === 'domicilio' ? (UI.domicilio == null ? num(S.cfg.domicilio) : num(UI.domicilio)) : 0;
  const propina = num(UI.propina);
  const total = subtotal + dom + propina;
  const costoVendido = items.reduce((s, i) => s + i.costoUnitario * i.cantidad, 0);
  const pedido = {
    id: uid(),
    numero: nuevoNumero(),
    fecha: hoyISO(),
    hora: horaISO(),
    creado: Date.now(),
    clienteId,
    clienteNombre: nombre,
    telefono,
    direccion,
    barrio: cli ? cli.barrio : '',
    tipo: UI.tipo,
    mesa: UI.tipo === 'mesa' ? (UI.mesa || '') : '',
    items,
    subtotal,
    domicilio: dom,
    propina,
    total,
    metodo: UI.pago,
    pagado: UI.pagado,
    estado: 'nuevo',
    domiciliarioId: UI.tipo === 'domicilio' ? UI.domiciliarioId : '',
    notas: UI.notas,
    costoVendido,
    stockDescontado: false
  };
  items.forEach((i) => {
    const p = prod(i.productoId);
    if (p && p.llevaInventario) {
      p.stock = num(p.stock) - i.cantidad;
      pedido.stockDescontado = true;
    }
  });
  S.pedidos.push(pedido);
  S.seq.pedido = num(S.seq.pedido);
  guardar();
  UI.cart = [];
  UI.propina = 0;
  UI.notas = '';
  UI.dir = '';
  UI.mesa = '';
  UI.domiciliarioId = '';
  toast(`Pedido #${pedido.numero} guardado por ${money(total)}.`);
  UI.tab = 'pedidos';
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ============================================================
   PEDIDOS
   ============================================================ */
function tarjetaPedido(p, mini = false) {
  const items = (p.items || []).map((i) => `${i.cantidad}× ${i.nombre}`).join(' · ');
  const saldo = p.pagado ? 0 : num(p.total);
  const domi = p.domiciliarioId ? domiciliario(p.domiciliarioId) : null;
  let acciones = '';
  if (!mini) {
    if (p.estado === 'nuevo') acciones += `<button class="btn sm soft" onclick="setEstadoPedido('${p.id}','preparando')">Preparando</button>`;
    if (p.estado === 'preparando') acciones += `<button class="btn sm soft" onclick="setEstadoPedido('${p.id}','en_camino')">En camino</button>`;
    if (p.estado === 'en_camino') acciones += `<button class="btn sm ok" onclick="setEstadoPedido('${p.id}','entregado')">Entregado</button>`;
    if (p.estado !== 'entregado' && p.estado !== 'cancelado') acciones += `<button class="btn sm ghost" onclick="verPedido('${p.id}')">Ver</button>`;
    if (!p.pagado && p.estado !== 'cancelado') acciones += `<button class="btn sm primary" onclick="formCobrar('${p.id}')">Cobrar</button>`;
    if (p.estado !== 'cancelado') acciones += `<button class="btn sm danger" onclick="cancelarPedido('${p.id}')">Cancelar</button>`;
  }
  return `<div class="order ${ESTADO_CLASE[p.estado] || ''}">
    <div class="order-top">
      <div class="grow">
        <b>#${esc(p.numero)} · ${esc(p.clienteNombre)}</b>
        <div class="xs muted">${fmtFecha(p.fecha)} ${p.hora || ''} · ${esc(TIPOS[p.tipo] || p.tipo)}${p.mesa ? ' ' + esc(p.mesa) : ''}</div>
      </div>
      <div style="text-align:right"><div class="order-total">${money(p.total)}</div><div class="xs ${saldo ? 'bold' : 'muted'}" style="color:${saldo ? 'var(--danger)' : 'var(--muted)'}">${saldo ? 'debe ' + money(saldo) : 'pagado'}</div></div>
    </div>
    <div class="order-items">${esc(items)}</div>
    <div class="order-meta">
      <span class="pill ${ESTADO_CLASE[p.estado]}">${esc(ESTADOS[p.estado] || p.estado)}</span>
      <span class="pill">${esc(PAGOS[p.metodo] || p.metodo)}</span>
      ${domi ? `<span class="pill info">🛵 ${esc(domi.nombre)}</span>` : ''}
      ${p.tipo === 'domicilio' ? `<span class="pill">${esc(p.direccion || 'Sin dirección')}</span>` : ''}
      ${num(p.propina) ? `<span class="pill ok">Propina ${money(p.propina)}</span>` : ''}
    </div>
    ${acciones ? `<div class="order-actions">${acciones}</div>` : ''}
  </div>`;
}

function paginaPedidos() {
  const filtros = [['todos', 'Todos'], ['nuevo', 'Nuevos'], ['preparando', 'Preparando'], ['en_camino', 'En camino'], ['entregado', 'Entregados'], ['cancelado', 'Cancelados']];
  let lista = [...S.pedidos].sort((a, b) => (b.creado || 0) - (a.creado || 0));
  if (UI.filtro !== 'todos') lista = lista.filter((p) => p.estado === UI.filtro);
  const activos = S.pedidos.filter((p) => !['entregado', 'cancelado'].includes(p.estado)).length;

  return `<div class="row between" style="margin-bottom:6px">
    <div><h2>Pedidos</h2><p class="small muted">${activos} activos · ${S.pedidos.length} en total</p></div>
    <button class="btn primary sm" onclick="setTab('vender')">+ Nuevo</button>
  </div>
  <div class="chips">${filtros.map(([k, v]) => `<button class="chip ${UI.filtro === k ? 'on' : ''}" onclick="UI.filtro='${k}';render()">${v}</button>`).join('')}</div>
  ${lista.length ? lista.map((p) => tarjetaPedido(p)).join('') : `<div class="empty"><span class="big">🧾</span>No hay pedidos con ese filtro.</div>`}`;
}

function setEstadoPedido(id, estado) {
  const p = S.pedidos.find((x) => x.id === id);
  if (!p) return;
  p.estado = estado;
  if (estado === 'entregado') p.entregadoEn = Date.now();
  guardar();
  render();
  toast(`Pedido #${p.numero}: ${ESTADOS[estado]}.`);
}

function cancelarPedido(id) {
  const p = S.pedidos.find((x) => x.id === id);
  if (!p) return;
  if (!confirm(`¿Cancelar el pedido #${p.numero}? Si ya descontó inventario, se devuelve.`)) return;
  if (p.stockDescontado) {
    (p.items || []).forEach((i) => {
      const pr = prod(i.productoId);
      if (pr && pr.llevaInventario) pr.stock = num(pr.stock) + num(i.cantidad);
    });
    p.stockDescontado = false;
  }
  p.estado = 'cancelado';
  guardar();
  render();
  toast('Pedido cancelado.');
}

function formCobrar(id) {
  const p = S.pedidos.find((x) => x.id === id);
  if (!p) return;
  sheet(`Cobrar pedido #${p.numero}`, `
    <div class="notice blue">Total: <b>${money(p.total)}</b>${p.pagado ? ' · ya está pagado' : ''}</div>
    ${selectCampo('cMetodo', 'Método de pago', Object.entries(PAGOS).map(([v, t]) => ({ v, t })), p.metodo)}
    <div class="field"><label>¿Quedó pagado?</label><select id="cPagado"><option value="1" ${p.pagado ? 'selected' : ''}>Sí</option><option value="0" ${!p.pagado ? 'selected' : ''}>No</option></select></div>
    <p class="small muted">Si es QR, muestra el código al cliente antes de confirmar.</p>
  `, `<button class="btn ghost" onclick="closeSheet()">Cancelar</button><button class="btn primary" onclick="guardarCobro('${p.id}')">Guardar cobro</button>`);
}

function guardarCobro(id) {
  const p = S.pedidos.find((x) => x.id === id);
  if (!p) return;
  p.metodo = $('#cMetodo').value;
  p.pagado = $('#cPagado').value === '1';
  guardar();
  closeSheet();
  render();
  toast(p.pagado ? 'Pago registrado.' : 'Pedido marcado como pendiente.');
}

function verPedido(id) {
  const p = S.pedidos.find((x) => x.id === id);
  if (!p) return;
  const items = (p.items || []).map((i) => `<div class="total-row"><span>${i.cantidad}× ${esc(i.nombre)}</span><b>${money(i.cantidad * i.precio)}</b></div>`).join('');
  sheet(`Pedido #${p.numero}`, `
    <div class="notice ${p.pagado ? 'green' : ''}">${p.pagado ? 'Pagado' : 'Pendiente de pago'} · ${esc(ESTADOS[p.estado])}</div>
    <div class="mt10"><b>${esc(p.clienteNombre)}</b><div class="small muted">${esc(p.telefono || '')} ${p.direccion ? '· ' + esc(p.direccion) : ''}</div></div>
    <div class="divider"></div>
    ${items}
    <div class="total-row"><span>Domicilio</span><b>${money(p.domicilio)}</b></div>
    <div class="total-row"><span>Propina</span><b>${money(p.propina)}</b></div>
    <div class="total-row big"><span>Total</span><span>${money(p.total)}</span></div>
    ${p.notas ? `<div class="notice mt10">${esc(p.notas)}</div>` : ''}
  `, `<button class="btn ghost" onclick="closeSheet()">Cerrar</button><button class="btn soft" onclick="waPedido('${p.id}')">Enviar por WhatsApp</button>`);
}

function waPedido(id) {
  const p = S.pedidos.find((x) => x.id === id);
  if (!p) return;
  const lineas = (p.items || []).map((i) => `• ${i.cantidad}× ${i.nombre} — ${money(i.cantidad * i.precio)}`).join('\n');
  const txt = `*${S.cfg.negocio}*\nPedido #${p.numero}\n${lineas}\nDomicilio: ${money(p.domicilio)}\nPropina: ${money(p.propina)}\n*Total: ${money(p.total)}*\nPago: ${PAGOS[p.metodo]}\n${p.direccion ? 'Entrega: ' + p.direccion : ''}`;
  const tel = String(p.telefono || '').replace(/\D/g, '');
  const url = `https://wa.me/${tel ? '57' + tel : ''}?text=${encodeURIComponent(txt)}`;
  window.open(url, '_blank');
}

/* ============================================================
   DOMICILIOS
   ============================================================ */
function paginaDomicilios() {
  const activos = S.pedidos.filter((p) => p.tipo === 'domicilio' && !['entregado', 'cancelado'].includes(p.estado))
    .sort((a, b) => (a.creado || 0) - (b.creado || 0));
  const hechos = S.pedidos.filter((p) => p.tipo === 'domicilio' && p.estado === 'entregado' && p.fecha === hoyISO());
  const totalDom = activos.reduce((s, p) => s + num(p.domicilio), 0);
  const totalTip = activos.reduce((s, p) => s + num(p.propina), 0);

  let h = `<div class="row between" style="margin-bottom:8px">
    <div><h2>Domicilios</h2><p class="small muted">${activos.length} activos · ${hechos.length} entregados hoy</p></div>
    <button class="btn ghost sm" onclick="setTab('domiciliarios')">🛵 Domiciliarios</button>
  </div>
  <div class="stats">
    <div class="stat accent"><b>${activos.length}</b><span>Activos</span></div>
    <div class="stat"><b>${money(totalDom)}</b><span>Domicilios</span></div>
    <div class="stat"><b>${money(totalTip)}</b><span>Propinas</span></div>
    <div class="stat ok"><b>${hechos.length}</b><span>Entregados</span></div>
  </div>`;

  if (!activos.length) {
    h += `<div class="empty"><span class="big">🛵</span>No hay domicilios activos.</div>`;
  } else {
    activos.forEach((p) => {
      const d = p.domiciliarioId ? domiciliario(p.domiciliarioId) : null;
      h += `<div class="card tight">
        <div class="row between" style="align-items:flex-start">
          <div class="grow"><b>#${esc(p.numero)} · ${esc(p.clienteNombre)}</b>
            <div class="small muted">${esc(p.direccion || 'Sin dirección')}</div>
            <div class="xs muted">${esc(p.telefono || '')} · ${money(p.total)} · ${esc(ESTADOS[p.estado])}</div>
          </div>
          <span class="pill ${ESTADO_CLASE[p.estado]}">${esc(ESTADOS[p.estado])}</span>
        </div>
        <div class="two mt10">
          <div class="field" style="margin:0"><label>Domiciliario</label>
            <select onchange="asignarDomiciliario('${p.id}',this.value)">
              <option value="">Sin asignar</option>
              ${S.domiciliarios.filter((x) => x.activo !== false).map((x) => `<option value="${x.id}" ${p.domiciliarioId === x.id ? 'selected' : ''}>${esc(x.nombre)}</option>`).join('')}
            </select>
          </div>
          <div class="field" style="margin:0"><label>Estado</label>
            <select onchange="setEstadoPedido('${p.id}',this.value)">
              ${['nuevo', 'preparando', 'en_camino', 'entregado'].map((e) => `<option value="${e}" ${p.estado === e ? 'selected' : ''}>${ESTADOS[e]}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="row mt10" style="gap:6px">
          <button class="btn sm ghost grow" onclick="verPedido('${p.id}')">Ver</button>
          <button class="btn sm soft grow" onclick="waPedido('${p.id}')">WhatsApp</button>
          ${d ? `<a class="btn sm ok grow" href="tel:${esc(d.telefono)}">Llamar</a>` : ''}
        </div>
      </div>`;
    });
  }
  return h;
}

function asignarDomiciliario(id, domId) {
  const p = S.pedidos.find((x) => x.id === id);
  if (!p) return;
  p.domiciliarioId = domId;
  guardar();
  render();
  toast(domId ? 'Domiciliario asignado.' : 'Domiciliario retirado.');
}

/* ============================================================
   CAJA
   ============================================================ */
function paginaCaja() {
  const r = resumenCaja();
  let h = `<div class="row between" style="margin-bottom:8px">
    <div><h2>Caja</h2><p class="small muted">${fmtFechaLarga()}</p></div>
    <span class="pill ${r.abierta ? 'ok' : 'warn'}">${r.abierta ? 'Abierta' : 'Cerrada'}</span>
  </div>`;

  if (!r.abierta) {
    h += `<div class="card">
      <div class="card-title"><h2>Abrir caja</h2></div>
      <p class="small muted">Escribe el efectivo con el que arrancas el día.</p>
      <div class="field mt10"><label>Base inicial</label><input id="cajaBase" type="number" value="${num(S.caja.fecha === hoyISO() ? S.caja.base : 0) || 50000}"></div>
      <button class="btn primary block" onclick="abrirCaja()">Abrir caja</button>
    </div>`;
  } else {
    h += `<div class="stats">
      <div class="stat accent"><b>${money(r.ventas.efectivo)}</b><span>Efectivo</span></div>
      <div class="stat"><b>${money(r.ventas.nequi + r.ventas.daviplata)}</b><span>Nequi / Daviplata</span></div>
      <div class="stat"><b>${money(r.ventas.qr)}</b><span>QR</span></div>
      <div class="stat"><b>${money(r.ventas.tarjeta)}</b><span>Tarjeta</span></div>
    </div>`;

    h += `<div class="card">
      <div class="card-title"><h2>Resumen</h2><span class="pill">Base ${money(r.base)}</span></div>
      <div class="total-row"><span>Ventas en efectivo</span><b>${money(r.ventas.efectivo)}</b></div>
      <div class="total-row"><span>Propinas cobradas</span><b>${money(r.propinas)}</b></div>
      <div class="total-row"><span>Domicilios cobrados</span><b>${money(r.domicilios)}</b></div>
      <div class="total-row"><span>Gastos en efectivo</span><b>− ${money(r.gastosEfectivo)}</b></div>
      <div class="total-row"><span>Compras en efectivo</span><b>− ${money(r.comprasEfectivo)}</b></div>
      <div class="total-row big"><span>Efectivo esperado</span><span>${money(r.efectivoEsperado)}</span></div>
      <div class="notice mt10">Por cobrar: <b>${money(r.porCobrar)}</b></div>
    </div>`;

    h += `<div class="card">
      <div class="card-title"><h2>Gastos de hoy</h2><button class="link" onclick="formGasto()">+ Agregar</button></div>
      ${r.gastos.length ? r.gastos.map((g) => `<div class="list-item"><div class="avatar">💸</div><div class="list-main"><b>${esc(g.concepto)}</b><span>${esc(g.categoria || 'Otros')} · ${esc(PAGOS[g.metodo] || 'Efectivo')}</span></div><div class="amount">${money(g.monto)}</div></div>`).join('') : `<div class="empty">Sin gastos registrados hoy.</div>`}
    </div>`;

    h += `<div class="card">
      <div class="card-title"><h2>Cerrar caja</h2></div>
      <p class="small muted">Cuenta el efectivo real y compáralo con el esperado.</p>
      <div class="field mt10"><label>Efectivo contado</label><input id="cajaContado" type="number" value="${Math.round(r.efectivoEsperado)}"></div>
      <button class="btn ok block" onclick="cerrarCaja()">Cerrar caja del día</button>
    </div>`;
  }

  if (S.cierres.length) {
    h += `<div class="card"><div class="card-title"><h2>Cierres anteriores</h2></div>
      ${S.cierres.slice(-5).reverse().map((c) => `<div class="list-item"><div class="avatar">📅</div><div class="list-main"><b>${fmtFecha(c.fecha)}</b><span>Esperado ${money(c.esperado)} · contado ${money(c.contado)}</span></div><div class="amount" style="color:${num(c.diferencia) === 0 ? 'var(--ok)' : 'var(--danger)'}">${money(c.diferencia)}</div></div>`).join('')}
    </div>`;
  }
  return h;
}

function abrirCaja() {
  S.caja = { fecha: hoyISO(), abierta: true, base: num($('#cajaBase').value) };
  guardar();
  render();
  toast('Caja abierta.');
}

function formGasto() {
  sheet('Registrar gasto', `
    ${campo('gConcepto', 'Concepto', '', 'text', 'placeholder="Arriendo, servicios, transporte..."')}
    <div class="two">
      ${campo('gMonto', 'Valor', '', 'number', 'placeholder="0"')}
      ${selectCampo('gMetodo', 'Pagado con', Object.entries(PAGOS).map(([v, t]) => ({ v, t })), 'efectivo')}
    </div>
    ${selectCampo('gCategoria', 'Categoría', [
      { v: 'Insumos', t: 'Insumos' }, { v: 'Arriendo', t: 'Arriendo' }, { v: 'Servicios', t: 'Servicios' },
      { v: 'Mano de obra', t: 'Mano de obra' }, { v: 'Transporte', t: 'Transporte' }, { v: 'Otros', t: 'Otros' }
    ], 'Otros')}
  `, `<button class="btn ghost" onclick="closeSheet()">Cancelar</button><button class="btn primary" onclick="guardarGasto()">Guardar gasto</button>`);
}

function guardarGasto() {
  const concepto = $('#gConcepto').value.trim();
  const monto = num($('#gMonto').value);
  if (!concepto || monto <= 0) return toast('Escribe concepto y valor.');
  S.gastos.push({ id: uid(), fecha: hoyISO(), concepto, monto, metodo: $('#gMetodo').value, categoria: $('#gCategoria').value });
  guardar();
  closeSheet();
  render();
  toast('Gasto registrado.');
}

function cerrarCaja() {
  const r = resumenCaja();
  const contado = num($('#cajaContado').value);
  if (!confirm(`¿Cerrar caja con ${money(contado)} contados?`)) return;
  const cierre = {
    id: uid(),
    fecha: hoyISO(),
    base: r.base,
    esperado: r.efectivoEsperado,
    contado,
    diferencia: contado - r.efectivoEsperado,
    ventas: r.ventas,
    propinas: r.propinas,
    gastos: r.gastosEfectivo + r.comprasEfectivo,
    cerrado: Date.now()
  };
  S.cierres.push(cierre);
  S.caja.abierta = false;
  guardar();
  render();
  toast(`Caja cerrada. Diferencia: ${money(cierre.diferencia)}.`);
}

/* ============================================================
   MÁS
   ============================================================ */
function paginaMas() {
  const accesos = [
    ['productos', '🍽️', 'Productos', 'Precios, costos y stock'],
    ['insumos', '🧂', 'Insumos', 'Ingredientes y materiales'],
    ['compras', '🧾', 'Compras', 'Entran al inventario'],
    ['proveedores', '🚚', 'Proveedores', 'Directorio y compras'],
    ['produccion', '🍳', 'Producción', 'Lotes o producción del día'],
    ['recetas', '📋', 'Recetas', 'Costo por ingredientes'],
    ['utilidad', '📊', 'Utilidad', 'Ganancias, gastos y margen'],
    ['congelador', '🧊', 'Congelador', 'Stock por lotes y días'],
    ['gastos', '💸', 'Gastos', 'Arriendo, servicios, transporte'],
    ['merma', '🗑️', 'Merma', 'Producto dañado o no vendido'],
    ['personal', '👨‍🍳', 'Personal', 'Empleados y pagos'],
    ['clientes', '👥', 'Clientes', 'Teléfonos y direcciones'],
    ['domiciliarios', '🛵', 'Domiciliarios', 'Quién lleva cada pedido'],
    ['ajustes', '⚙️', 'Ajustes', 'Negocio, QR, licencia y copia']
  ];
  return `<h2>Más</h2><p class="small muted" style="margin-bottom:12px">Todo lo que no es venta del día.</p>
  <div class="more-grid">${accesos.map(([tab, ic, t, s]) => `<button class="more-btn" onclick="setTab('${tab}')"><span class="ic">${ic}</span><span><b>${t}</b><span>${s}</span></span></button>`).join('')}</div>
  <a class="more-btn mt10" href="manual.html" target="_blank" rel="noopener"><span class="ic">📘</span><span><b>Manual</b><span>Cómo usar cada módulo</span></span></a>
  <a class="more-btn mt10" href="manual.html#costos" target="_blank" rel="noopener"><span class="ic">🧮</span><span><b>Costos, insumos y compras</b><span>Cómo se calcula el costo real</span></span></a>
  <div class="card mt14">
    <div class="card-title"><h2>Resumen rápido</h2><button class="link" onclick="setTab('utilidad')">Ver utilidad ›</button></div>
    <div class="total-row"><span>Productos activos</span><b>${S.productos.filter((p) => p.disponible).length}</b></div>
    <div class="total-row"><span>Insumos con stock bajo</span><b>${S.insumos.filter((i) => num(i.stock) <= num(i.stockMinimo)).length}</b></div>
    <div class="total-row"><span>Pedidos pendientes de cobro</span><b>${S.pedidos.filter((p) => !p.pagado && p.estado !== 'cancelado').length}</b></div>
    <div class="total-row"><span>Licencia</span><b>${S.cfg.licencia.activa ? 'Activa' : 'Sin activar'}</b></div>
  </div>
  <p class="xs muted center mt14">Mi Negocio · ${esc(S.cfg.lema || '')}</p>`;
}

/* ============================================================
   PRODUCTOS
   ============================================================ */
function paginaProductos() {
  const cats = Array.from(new Set(S.productos.map((p) => p.categoria)));
  let h = `<div class="row between" style="margin-bottom:6px">
    <div><h2>Productos</h2><p class="small muted">${S.productos.length} productos · ${cats.length} categorías</p></div>
    <button class="btn primary sm" onclick="formProducto()">+ Producto</button>
  </div>`;
  if (!S.productos.length) return h + `<div class="empty"><span class="big">🍽️</span>No hay productos. Crea el primero.</div>`;
  h += S.productos.map((p) => {
    const c = costoProducto(p);
    const m = margen(p);
    const bajo = p.llevaInventario && num(p.stock) <= num(p.stockMinimo);
    return `<div class="card tight">
      <div class="row between" style="align-items:flex-start">
        <div class="row" style="align-items:flex-start">
          <div class="avatar" style="font-size:20px">${esc(p.emoji || '🍽️')}</div>
          <div><b>${esc(p.nombre)}</b><div class="xs muted">${esc(p.categoria)} · ${esc(p.unidad)} · ${p.modoCosto === 'receta' ? 'receta' : p.modoCosto === 'lote' ? 'lote' : 'costo directo'}</div></div>
        </div>
        <div style="text-align:right"><b>${money(p.precio)}</b><div class="xs muted">costo ${money(c)}</div></div>
      </div>
      <div class="order-meta mt10">
        <span class="pill ${m >= 30 ? 'ok' : m > 0 ? 'warn' : 'danger'}">Margen ${m.toFixed(0)}%</span>
        ${p.llevaInventario ? `<span class="pill ${bajo ? 'danger' : ''}">${S.cfg.modoInventario === 'congelador' ? 'Congelador' : 'Stock'} ${num(p.stock)} ${esc(p.unidad)}</span>` : `<span class="pill">Sin inventario</span>`}
        ${!p.disponible ? `<span class="pill danger">Inactivo</span>` : ''}
      </div>
      <div class="row mt10" style="gap:6px">
        <button class="btn sm soft grow" onclick="formProducto('${p.id}')">Editar</button>
        <button class="btn sm ghost grow" onclick="formReceta('${p.id}')">Receta</button>
        <button class="btn sm ghost" onclick="toggleProducto('${p.id}')">${p.disponible ? 'Pausar' : 'Activar'}</button>
      </div>
    </div>`;
  }).join('');
  return h;
}

function formProducto(id) {
  const p = id ? prod(id) : null;
  const cats = Array.from(new Set(['Pasteles', 'Fritos', 'Arepas', 'Comidas rápidas', 'Bebidas', 'Combos', 'Otros', ...S.productos.map((x) => x.categoria)]));
  sheet(p ? 'Editar producto' : 'Nuevo producto', `
    ${campo('pNombre', 'Nombre del producto', p ? p.nombre : '', 'text', 'placeholder="Pastel, empanada, dedito..."')}
    <div class="two">
      <div class="field"><label>Categoría</label><input id="pCategoria" list="pCats" value="${esc(p ? p.categoria : 'Pasteles')}"><datalist id="pCats">${cats.map((c) => `<option value="${esc(c)}">`).join('')}</datalist></div>
      ${campo('pUnidad', 'Unidad', p ? p.unidad : 'unidad', 'text', 'placeholder="unidad, porción, combo"')}
    </div>
    <div class="two">
      ${campo('pPrecio', 'Precio de venta', p ? p.precio : '', 'number')}
      ${campo('pCosto', 'Costo directo', p ? p.costoDirecto : '', 'number')}
    </div>
    ${selectCampo('pModo', 'Cómo calcula el costo', [
      { v: 'directo', t: 'Costo directo (lo escribo yo)' },
      { v: 'receta', t: 'Por receta / ingredientes' },
      { v: 'lote', t: 'Por lote de producción' }
    ], p ? p.modoCosto : 'directo')}
    <div class="two">
      ${campo('pStock', 'Stock / congelador', p ? p.stock : 0, 'number')}
      ${campo('pMinimo', 'Stock mínimo', p ? p.stockMinimo : 0, 'number')}
    </div>
    ${selectCampo('pInventario', '¿Maneja inventario?', [{ v: '1', t: 'Sí, descontar al vender' }, { v: '0', t: 'No, vender siempre' }], p ? (p.llevaInventario ? '1' : '0') : (S.cfg.modoInventario !== 'ninguno' ? '1' : '0'))}
    ${selectCampo('pDisponible', 'Estado', [{ v: '1', t: 'Disponible' }, { v: '0', t: 'Pausado' }], p && !p.disponible ? '0' : '1')}
    ${campo('pEmoji', 'Emoji o icono', p ? p.emoji : '🍽️', 'text', 'maxlength="4"')}
    <div class="notice blue">Si eliges receta o lote, el costo se calcula en <b>Recetas</b> o <b>Producción</b>. El costo directo queda como respaldo.</div>
  `, `<button class="btn ghost" onclick="closeSheet()">Cancelar</button><button class="btn primary" onclick="guardarProducto('${p ? p.id : ''}')">Guardar</button>`);
}

function guardarProducto(id) {
  const nombre = $('#pNombre').value.trim();
  const precio = num($('#pPrecio').value);
  if (!nombre) return toast('Escribe el nombre del producto.');
  if (precio <= 0) return toast('Escribe el precio de venta.');
  const data = {
    nombre,
    categoria: $('#pCategoria').value.trim() || 'Otros',
    unidad: $('#pUnidad').value.trim() || 'unidad',
    precio,
    costoDirecto: num($('#pCosto').value),
    modoCosto: $('#pModo').value,
    stock: num($('#pStock').value),
    stockMinimo: num($('#pMinimo').value),
    llevaInventario: $('#pInventario').value === '1',
    disponible: $('#pDisponible').value === '1',
    emoji: $('#pEmoji').value.trim() || '🍽️'
  };
  if (id) Object.assign(prod(id), data);
  else S.productos.push(Object.assign({ id: uid(), costoPromedio: 0 }, data));
  guardar();
  closeSheet();
  render();
  toast('Producto guardado.');
}

function toggleProducto(id) {
  const p = prod(id);
  if (!p) return;
  p.disponible = !p.disponible;
  guardar();
  render();
  toast(p.disponible ? 'Producto activado.' : 'Producto pausado.');
}

/* ============================================================
   INSUMOS
   ============================================================ */
function paginaInsumos() {
  let h = `<div class="row between" style="margin-bottom:6px">
    <div><h2>Insumos</h2><p class="small muted">Ingredientes y materiales para costos y producción.</p></div>
    <button class="btn primary sm" onclick="formInsumo()">+ Insumo</button>
  </div>`;
  if (!S.insumos.length) return h + `<div class="empty"><span class="big">🧂</span>No hay insumos. Agrega el primero.</div>`;
  h += `<div class="card tight">`;
  S.insumos.forEach((i) => {
    const bajo = num(i.stock) <= num(i.stockMinimo);
    h += `<div class="list-item">
      <div class="avatar">${bajo ? '⚠️' : '🧂'}</div>
      <div class="list-main"><b>${esc(i.nombre)}</b><span>${num(i.stock)} ${esc(i.unidad)} · costo ${money(i.costoPromedio)} · mínimo ${num(i.stockMinimo)}</span></div>
      <div style="text-align:right">
        <button class="btn sm ghost" onclick="formInsumo('${i.id}')">Editar</button>
        <button class="btn sm soft mt6" style="display:block" onclick="formCompra('${i.id}')">Comprar</button>
      </div>
    </div>`;
  });
  return h + `</div><div class="notice mt10">El costo promedio se actualiza solo cuando registras una compra.</div>`;
}

function formInsumo(id) {
  const i = id ? insumo(id) : null;
  sheet(i ? 'Editar insumo' : 'Nuevo insumo', `
    ${campo('iNombre', 'Nombre', i ? i.nombre : '', 'text', 'placeholder="Arroz, pollo, queso..."')}
    <div class="two">
      ${campo('iUnidad', 'Unidad', i ? i.unidad : 'libra', 'text', 'placeholder="libra, bulto, litro"')}
      ${campo('iCosto', 'Costo promedio', i ? i.costoPromedio : '', 'number')}
    </div>
    <div class="two">
      ${campo('iStock', 'Stock actual', i ? i.stock : 0, 'number')}
      ${campo('iMinimo', 'Stock mínimo', i ? i.stockMinimo : 0, 'number')}
    </div>
  `, `<button class="btn ghost" onclick="closeSheet()">Cancelar</button><button class="btn primary" onclick="guardarInsumo('${i ? i.id : ''}')">Guardar</button>`);
}

function guardarInsumo(id) {
  const nombre = $('#iNombre').value.trim();
  if (!nombre) return toast('Escribe el nombre del insumo.');
  const data = {
    nombre,
    unidad: $('#iUnidad').value.trim() || 'unidad',
    costoPromedio: num($('#iCosto').value),
    stock: num($('#iStock').value),
    stockMinimo: num($('#iMinimo').value)
  };
  if (id) Object.assign(insumo(id), data);
  else S.insumos.push(Object.assign({ id: uid() }, data));
  guardar();
  closeSheet();
  render();
  toast('Insumo guardado.');
}

/* ============================================================
   COMPRAS
   ============================================================ */
function paginaCompras() {
  const compras = [...S.compras].sort((a, b) => (b.creado || 0) - (a.creado || 0));
  let h = `<div class="row between" style="margin-bottom:6px">
    <div><h2>Compras</h2><p class="small muted">Entran al inventario y actualizan el costo.</p></div>
    <button class="btn primary sm" onclick="formCompra()">+ Compra</button>
  </div>`;
  if (!compras.length) return h + `<div class="empty"><span class="big">🧾</span>No hay compras registradas.</div>`;
  h += `<div class="card tight">`;
  compras.slice(0, 30).forEach((c) => {
    const i = insumo(c.insumoId);
    const pv = proveedor(c.proveedorId);
    h += `<div class="list-item">
      <div class="avatar">🧾</div>
      <div class="list-main"><b>${i ? esc(i.nombre) : 'Insumo'}</b><span>${num(c.cantidad)} ${i ? esc(i.unidad) : ''} · ${money(c.precioUnitario)} c/u · ${pv ? esc(pv.nombre) : 'Sin proveedor'}</span></div>
      <div style="text-align:right"><b class="small">${money(c.total)}</b><div class="xs muted">${fmtFecha(c.fecha)}</div></div>
    </div>`;
  });
  return h + `</div>`;
}

function formCompra(insumoId = '') {
  if (!S.insumos.length) return toast('Primero crea un insumo.');
  const ins = S.insumos.map((i) => ({ v: i.id, t: `${i.nombre} (${i.unidad})` }));
  const provs = [{ v: '', t: 'Sin proveedor' }, ...S.proveedores.map((p) => ({ v: p.id, t: p.nombre }))];
  sheet('Registrar compra', `
    ${selectCampo('coInsumo', 'Insumo', ins, insumoId || (ins[0] && ins[0].v))}
    <div class="two">
      ${campo('coCantidad', 'Cantidad', '', 'number')}
      ${campo('coPrecio', 'Precio unitario', '', 'number')}
    </div>
    ${selectCampo('coProveedor', 'Proveedor', provs, '')}
    <div class="two">
      ${selectCampo('coPagada', '¿Pagada?', [{ v: '1', t: 'Sí' }, { v: '0', t: 'No' }], '1')}
      ${selectCampo('coMetodo', 'Método', Object.entries(PAGOS).map(([v, t]) => ({ v, t })), 'efectivo')}
    </div>
    <div class="notice blue">La compra suma stock y recalcula el costo promedio. Si es pagada en efectivo, sale de la caja.</div>
  `, `<button class="btn ghost" onclick="closeSheet()">Cancelar</button><button class="btn primary" onclick="guardarCompra()">Guardar compra</button>`);
}

function guardarCompra() {
  const insumoId = $('#coInsumo').value;
  const i = insumo(insumoId);
  const cantidad = num($('#coCantidad').value);
  const precioUnitario = num($('#coPrecio').value);
  if (!i || cantidad <= 0 || precioUnitario <= 0) return toast('Completa insumo, cantidad y precio.');
  const total = cantidad * precioUnitario;
  const oldStock = num(i.stock);
  const oldCosto = num(i.costoPromedio);
  const newStock = oldStock + cantidad;
  i.costoPromedio = newStock > 0 ? ((oldStock * oldCosto) + total) / newStock : precioUnitario;
  i.stock = newStock;
  S.compras.push({
    id: uid(), fecha: hoyISO(), creado: Date.now(), insumoId, cantidad, precioUnitario, total,
    proveedorId: $('#coProveedor').value, pagada: $('#coPagada').value === '1', metodo: $('#coMetodo').value
  });
  guardar();
  closeSheet();
  render();
  toast(`Compra por ${money(total)} registrada.`);
}

/* ============================================================
   PROVEEDORES
   ============================================================ */
function paginaProveedores() {
  let h = `<div class="row between" style="margin-bottom:6px">
    <div><h2>Proveedores</h2><p class="small muted">A quién le compras y cuánto le has comprado.</p></div>
    <button class="btn primary sm" onclick="formProveedor()">+ Proveedor</button>
  </div>`;
  if (!S.proveedores.length) return h + `<div class="empty"><span class="big">🚚</span>No hay proveedores. Agrega el primero.</div>`;
  h += `<div class="card tight">`;
  S.proveedores.forEach((p) => {
    const total = S.compras.filter((c) => c.proveedorId === p.id).reduce((s, c) => s + num(c.total), 0);
    h += `<div class="list-item">
      <div class="avatar">🚚</div>
      <div class="list-main"><b>${esc(p.nombre)}</b><span>${esc(p.telefono || 'Sin teléfono')}${p.notas ? ' · ' + esc(p.notas) : ''}</span></div>
      <div style="text-align:right"><b class="small">${money(total)}</b><div class="xs muted">comprado</div><button class="btn sm ghost mt6" onclick="formProveedor('${p.id}')">Editar</button></div>
    </div>`;
  });
  return h + `</div>`;
}

function formProveedor(id) {
  const p = id ? proveedor(id) : null;
  sheet(p ? 'Editar proveedor' : 'Nuevo proveedor', `
    ${campo('prNombre', 'Nombre', p ? p.nombre : '', 'text')}
    ${campo('prTelefono', 'Teléfono', p ? p.telefono : '', 'text')}
    ${campo('prNotas', 'Notas', p ? p.notas : '', 'text', 'placeholder="Qué le compras, días de visita..."')}
  `, `<button class="btn ghost" onclick="closeSheet()">Cancelar</button><button class="btn primary" onclick="guardarProveedor('${p ? p.id : ''}')">Guardar</button>`);
}

function guardarProveedor(id) {
  const nombre = $('#prNombre').value.trim();
  if (!nombre) return toast('Escribe el nombre del proveedor.');
  const data = { nombre, telefono: $('#prTelefono').value.trim(), notas: $('#prNotas').value.trim() };
  if (id) Object.assign(proveedor(id), data);
  else S.proveedores.push(Object.assign({ id: uid() }, data));
  guardar();
  closeSheet();
  render();
  toast('Proveedor guardado.');
}

/* ============================================================
   PRODUCCIÓN
   ============================================================ */
function paginaProduccion() {
  const prods = [...S.producciones].sort((a, b) => (b.creado || 0) - (a.creado || 0));
  const totalUnidades = prods.reduce((s, p) => s + num(p.unidades), 0);
  const totalCosto = prods.reduce((s, p) => s + num(p.costoTotal), 0);
  let h = `<div class="row between" style="margin-bottom:6px">
    <div><h2>Producción</h2><p class="small muted">Lotes o producción del día; sirve para ambos.</p></div>
    <button class="btn primary sm" onclick="formProduccion()">+ Producción</button>
  </div>
  <div class="stats">
    <div class="stat accent"><b>${prods.length}</b><span>Producciones</span></div>
    <div class="stat"><b>${totalUnidades}</b><span>Unidades</span></div>
    <div class="stat"><b>${money(totalCosto)}</b><span>Costo total</span></div>
  </div>`;
  if (!prods.length) return h + `<div class="empty"><span class="big">🍳</span>No hay producción registrada.<br><span class="xs">Si no produces, usa costo directo en Productos.</span></div>`;
  h += prods.slice(0, 25).map((p) => {
    const pr = prod(p.productoId);
    return `<div class="card tight">
      <div class="row between"><div><b>${esc(p.nombre || 'Producción')}</b><div class="xs muted">${fmtFecha(p.fecha)} · ${esc(p.tipo === 'lote' ? 'Lote' : 'Día')} · ${pr ? esc(pr.nombre) : ''}</div></div><b>${num(p.unidades)} und</b></div>
      <div class="total-row mt6"><span>Costo total</span><b>${money(p.costoTotal)}</b></div>
      <div class="total-row"><span>Costo por unidad</span><b>${money(p.costoUnitario)}</b></div>
      <div class="xs muted mt6">${(p.lineas || []).map((l) => {
        const i = insumo(l.insumoId);
        return `${esc(i ? i.nombre : 'Insumo')} ${num(l.cantidad)} ${esc(i ? i.unidad : '')}`;
      }).join(' · ')}</div>
    </div>`;
  }).join('');
  return h;
}

function formProduccion() {
  UI.prodLines = [];
  const prods = S.productos.map((p) => ({ v: p.id, t: `${p.nombre} (${p.unidad})` }));
  const insumos = S.insumos.map((i) => ({ v: i.id, t: `${i.nombre} (${i.unidad})` }));
  if (!prods.length) return toast('Primero crea un producto.');
  if (!insumos.length) return toast('Primero crea un insumo.');
  sheet('Nueva producción', `
    ${selectCampo('prProducto', 'Producto que sale', prods, prods[0].v)}
    <div class="two">
      ${selectCampo('prTipo', 'Tipo', [{ v: 'lote', t: 'Lote' }, { v: 'dia', t: 'Producción del día' }], 'lote')}
      ${campo('prUnidades', 'Unidades producidas', '', 'number', 'placeholder="0" oninput="actualizarProdPreview()"')}
    </div>
    ${campo('prNombre', 'Nombre del lote / producción', '', 'text', 'placeholder="Lote de pasteles de pollo"')}
    <div class="two">
      ${campo('prMano', 'Mano de obra', 0, 'number', 'oninput="actualizarProdPreview()"')}
      ${campo('prOtros', 'Otros costos', 0, 'number', 'oninput="actualizarProdPreview()"')}
    </div>
    <div class="divider"></div>
    <div class="row between"><b class="small">Insumos usados</b><button class="btn ghost sm" onclick="cargarRecetaProduccion()">Cargar receta</button></div>
    <div id="prodLineas" class="mt10"></div>
    <div class="row mt10" style="align-items:flex-end">
      <div class="field grow" style="margin:0"><label>Insumo</label><select id="plInsumo">${insumos.map((i) => `<option value="${i.v}">${esc(i.t)}</option>`).join('')}</select></div>
      <div class="field" style="width:88px;margin:0"><label>Cant.</label><input id="plCantidad" type="number" placeholder="0"></div>
      <button class="btn soft" onclick="addProdLinea()">+</button>
    </div>
    <div class="notice mt10" id="prodPreview">Costo por unidad: $0</div>
    <div class="notice mt10">Si pagas al personal desde <b>Personal</b>, deja la mano de obra en 0 aquí para no contarla dos veces.</div>
  `, `<button class="btn ghost" onclick="closeSheet()">Cancelar</button><button class="btn primary" onclick="guardarProduccion()">Guardar producción</button>`);
  renderProdLineas();
}

function renderProdLineas() {
  const box = $('#prodLineas');
  if (!box) return;
  if (!UI.prodLines.length) {
    box.innerHTML = `<div class="empty" style="padding:10px">Agrega los insumos usados.</div>`;
  } else {
    box.innerHTML = UI.prodLines.map((l, idx) => {
      const i = insumo(l.insumoId);
      return `<div class="cart-line"><div class="grow"><b class="small">${esc(i ? i.nombre : 'Insumo')}</b><div class="xs muted">${num(l.cantidad)} ${esc(i ? i.unidad : '')} · ${money((i ? i.costoPromedio : 0))} c/u</div></div><button class="btn sm danger" onclick="quitarProdLinea(${idx})">✕</button></div>`;
    }).join('');
  }
  actualizarProdPreview();
}

function addProdLinea() {
  const insumoId = $('#plInsumo').value;
  const cantidad = num($('#plCantidad').value);
  if (!insumoId || cantidad <= 0) return toast('Escribe una cantidad.');
  UI.prodLines.push({ insumoId, cantidad });
  $('#plCantidad').value = '';
  renderProdLineas();
}

function quitarProdLinea(i) {
  UI.prodLines.splice(i, 1);
  renderProdLineas();
}

function cargarRecetaProduccion() {
  const pid = $('#prProducto').value;
  const unidades = num($('#prUnidades').value);
  const r = recetaDe(pid);
  if (!r || !r.lineas || !r.lineas.length) return toast('Ese producto no tiene receta. Créala en Recetas.');
  if (!unidades) return toast('Escribe primero las unidades producidas.');
  const factor = unidades / Math.max(1, num(r.unidades));
  UI.prodLines = r.lineas.map((l) => ({ insumoId: l.insumoId, cantidad: num(l.cantidad) * factor }));
  renderProdLineas();
  toast('Receta cargada.');
}

function actualizarProdPreview() {
  const box = $('#prodPreview');
  if (!box) return;
  const insumosCosto = UI.prodLines.reduce((s, l) => {
    const i = insumo(l.insumoId);
    return s + (i ? num(l.cantidad) * num(i.costoPromedio) : 0);
  }, 0);
  const otros = num($('#prMano') ? $('#prMano').value : 0) + num($('#prOtros') ? $('#prOtros').value : 0);
  const unidades = num($('#prUnidades') ? $('#prUnidades').value : 0);
  const total = insumosCosto + otros;
  box.innerHTML = `Costo total: <b>${money(total)}</b> · Costo por unidad: <b>${money(unidades > 0 ? total / unidades : 0)}</b>`;
}

function guardarProduccion() {
  const productoId = $('#prProducto').value;
  const p = prod(productoId);
  const unidades = num($('#prUnidades').value);
  if (!p || unidades <= 0) return toast('Escoge producto y unidades.');
  if (!UI.prodLines.length) return toast('Agrega al menos un insumo.');
  const insumosCosto = UI.prodLines.reduce((s, l) => {
    const i = insumo(l.insumoId);
    return s + (i ? num(l.cantidad) * num(i.costoPromedio) : 0);
  }, 0);
  const manoObra = num($('#prMano').value);
  const otros = num($('#prOtros').value);
  const costoTotal = insumosCosto + manoObra + otros;
  const costoUnitario = costoTotal / unidades;
  const oldStock = num(p.stock);
  const oldCosto = num(p.costoPromedio) || costoProducto(p);
  const newStock = oldStock + unidades;
  p.costoPromedio = newStock > 0 ? ((oldStock * oldCosto) + (unidades * costoUnitario)) / newStock : costoUnitario;
  p.stock = newStock;
  p.llevaInventario = true;
  if (p.modoCosto !== 'receta') p.modoCosto = 'lote';
  UI.prodLines.forEach((l) => {
    const i = insumo(l.insumoId);
    if (i) i.stock = num(i.stock) - num(l.cantidad);
  });
  S.producciones.push({
    id: uid(), fecha: hoyISO(), creado: Date.now(), productoId, tipo: $('#prTipo').value,
    nombre: $('#prNombre').value.trim() || `Producción de ${p.nombre}`,
    unidades, manoObra, otros, costoTotal, costoUnitario,
    lineas: UI.prodLines.map((l) => ({ insumoId: l.insumoId, cantidad: num(l.cantidad) }))
  });
  guardar();
  closeSheet();
  render();
  toast(`Producción guardada: ${unidades} ${p.unidad} a ${money(costoUnitario)} c/u.`);
}

/* ============================================================
   RECETAS
   ============================================================ */
function paginaRecetas() {
  let h = `<div class="row between" style="margin-bottom:6px">
    <div><h2>Recetas</h2><p class="small muted">Costo por ingredientes. Opcional: puedes usar costo directo.</p></div>
    <button class="btn primary sm" onclick="formReceta()">+ Receta</button>
  </div>`;
  const conReceta = S.productos.filter((p) => recetaDe(p.id));
  if (!conReceta.length) return h + `<div class="empty"><span class="big">📋</span>No hay recetas.<br><span class="xs">Crea una y la app calcula el costo por unidad.</span></div>`;
  h += conReceta.map((p) => {
    const r = recetaDe(p.id);
    const c = costoReceta(p.id);
    return `<div class="card tight">
      <div class="row between"><div><b>${esc(p.nombre)}</b><div class="xs muted">${num(r.unidades)} ${esc(p.unidad)} por receta</div></div><b>${money(c || 0)} c/u</b></div>
      <div class="xs muted mt6">${(r.lineas || []).map((l) => {
        const i = insumo(l.insumoId);
        return `${esc(i ? i.nombre : 'Insumo')} ${num(l.cantidad)} ${esc(i ? i.unidad : '')}`;
      }).join(' · ')}</div>
      <button class="btn sm soft mt10" onclick="formReceta('${p.id}')">Editar receta</button>
    </div>`;
  }).join('');
  return h;
}

function formReceta(productoId = '') {
  const prods = S.productos.map((p) => ({ v: p.id, t: p.nombre }));
  if (!prods.length) return toast('Primero crea un producto.');
  const pid = productoId || (S.productos[0] && S.productos[0].id);
  const r = recetaDe(pid);
  UI.recetaProducto = pid;
  UI.recetaLines = r ? clone(r.lineas || []) : [];
  const insumos = S.insumos.map((i) => ({ v: i.id, t: `${i.nombre} (${i.unidad})` }));
  if (!insumos.length) return toast('Primero crea un insumo.');
  sheet(r ? 'Editar receta' : 'Nueva receta', `
    ${selectCampo('reProducto', 'Producto', prods, pid, 'onchange="cambiarRecetaProducto(this.value)"')}
    ${campo('reUnidades', 'Unidades que rinde la receta', r ? r.unidades : 1, 'number', 'oninput="actualizarRecPreview()"')}
    <div class="divider"></div>
    <div class="row between"><b class="small">Ingredientes</b></div>
    <div id="recLineas" class="mt10"></div>
    <div class="row mt10" style="align-items:flex-end">
      <div class="field grow" style="margin:0"><label>Insumo</label><select id="reInsumo">${insumos.map((i) => `<option value="${i.v}">${esc(i.t)}</option>`).join('')}</select></div>
      <div class="field" style="width:88px;margin:0"><label>Cant.</label><input id="reCantidad" type="number" placeholder="0"></div>
      <button class="btn soft" onclick="addRecLinea()">+</button>
    </div>
    <div class="notice mt10" id="recPreview">Costo por unidad: $0</div>
  `, `<button class="btn ghost" onclick="closeSheet()">Cancelar</button><button class="btn primary" onclick="guardarReceta()">Guardar receta</button>`);
  renderRecLineas();
}

function cambiarRecetaProducto(pid) {
  UI.recetaProducto = pid;
  const r = recetaDe(pid);
  UI.recetaLines = r ? clone(r.lineas || []) : [];
  const u = $('#reUnidades');
  if (u) u.value = r ? num(r.unidades) : 1;
  renderRecLineas();
}

function renderRecLineas() {
  const box = $('#recLineas');
  if (!box) return;
  if (!UI.recetaLines.length) box.innerHTML = `<div class="empty" style="padding:10px">Agrega ingredientes.</div>`;
  else box.innerHTML = UI.recetaLines.map((l, idx) => {
    const i = insumo(l.insumoId);
    return `<div class="cart-line"><div class="grow"><b class="small">${esc(i ? i.nombre : 'Insumo')}</b><div class="xs muted">${num(l.cantidad)} ${esc(i ? i.unidad : '')}</div></div><button class="btn sm danger" onclick="quitarRecLinea(${idx})">✕</button></div>`;
  }).join('');
  actualizarRecPreview();
}

function addRecLinea() {
  const insumoId = $('#reInsumo').value;
  const cantidad = num($('#reCantidad').value);
  if (!insumoId || cantidad <= 0) return toast('Escribe una cantidad.');
  UI.recetaLines.push({ insumoId, cantidad });
  $('#reCantidad').value = '';
  renderRecLineas();
}
function quitarRecLinea(i) { UI.recetaLines.splice(i, 1); renderRecLineas(); }

function actualizarRecPreview() {
  const box = $('#recPreview');
  if (!box) return;
  const total = UI.recetaLines.reduce((s, l) => {
    const i = insumo(l.insumoId);
    return s + (i ? num(l.cantidad) * num(i.costoPromedio) : 0);
  }, 0);
  const u = num($('#reUnidades') ? $('#reUnidades').value : 1);
  box.innerHTML = `Costo total: <b>${money(total)}</b> · Costo por unidad: <b>${money(u > 0 ? total / u : 0)}</b>`;
}

function guardarReceta() {
  const productoId = $('#reProducto').value;
  const unidades = num($('#reUnidades').value);
  if (!productoId || unidades <= 0) return toast('Escoge producto y rendimiento.');
  if (!UI.recetaLines.length) return toast('Agrega al menos un ingrediente.');
  const idx = S.recetas.findIndex((r) => r.productoId === productoId);
  const data = { id: idx >= 0 ? S.recetas[idx].id : uid(), productoId, unidades, lineas: UI.recetaLines.map((l) => ({ insumoId: l.insumoId, cantidad: num(l.cantidad) })) };
  if (idx >= 0) S.recetas[idx] = data;
  else S.recetas.push(data);
  const p = prod(productoId);
  if (p) p.modoCosto = 'receta';
  guardar();
  closeSheet();
  render();
  toast('Receta guardada.');
}

/* ============================================================
   UTILIDAD
   ============================================================ */
function paginaUtilidad() {
  const r = resumenUtilidad(UI.periodo);
  const top = {};
  r.pedidos.forEach((p) => (p.items || []).forEach((i) => {
    if (!top[i.nombre]) top[i.nombre] = { nombre: i.nombre, cantidad: 0, venta: 0 };
    top[i.nombre].cantidad += num(i.cantidad);
    top[i.nombre].venta += num(i.cantidad) * num(i.precio);
  }));
  const tops = Object.values(top).sort((a, b) => b.cantidad - a.cantidad).slice(0, 6);
  const pagos = { efectivo: 0, nequi: 0, daviplata: 0, qr: 0, tarjeta: 0 };
  r.pedidos.forEach((p) => { pagos[p.metodo] = (pagos[p.metodo] || 0) + num(p.total); });
  const margenContrib = r.ventas > 0 ? (r.ventas - r.costo) / r.ventas : 0;
  const equilibrio = margenContrib > 0 ? r.gastos / margenContrib : 0;
  const inventarioFinal = S.productos.reduce((s, p) => s + (num(p.stock) > 0 ? num(p.stock) * costoProducto(p) : 0), 0);

  return `<div class="row between" style="margin-bottom:6px">
    <div><h2>Utilidad</h2><p class="small muted">Ventas, costo, gastos y merma.</p></div>
  </div>
  <div class="chips">${[['hoy', 'Hoy'], ['semana', 'Semana'], ['mes', 'Mes'], ['todo', 'Todo']].map(([k, v]) => `<button class="chip ${UI.periodo === k ? 'on' : ''}" onclick="UI.periodo='${k}';render()">${v}</button>`).join('')}</div>

  <div class="stats">
    <div class="stat accent"><b>${money(r.ventas)}</b><span>Ventas de productos</span></div>
    <div class="stat"><b>${money(r.costo)}</b><span>Costo vendido</span></div>
    <div class="stat"><b>${money(r.gastos)}</b><span>Gastos</span></div>
    <div class="stat"><b>${money(r.merma)}</b><span>Merma</span></div>
  </div>

  <div class="card">
    <div class="card-title"><h2>Resultado</h2><span class="pill ${r.utilidad >= 0 ? 'ok' : 'danger'}">${r.ventas > 0 ? r.margen.toFixed(1) + '% margen' : 'Sin ventas'}</span></div>
    <div class="total-row"><span>Ventas de productos</span><b>${money(r.ventas)}</b></div>
    <div class="total-row"><span>− Costo de lo vendido</span><b>${money(r.costo)}</b></div>
    <div class="total-row"><span>− Gastos</span><b>${money(r.gastos)}</b></div>
    <div class="total-row"><span>− Merma</span><b>${money(r.merma)}</b></div>
    <div class="total-row big"><span>Utilidad neta</span><span style="color:${r.utilidad >= 0 ? 'var(--ok)' : 'var(--danger)'}">${money(r.utilidad)}</span></div>
    <div class="total-row"><span>Inventario final (aparte)</span><b>${money(inventarioFinal)}</b></div>
    <div class="notice mt10 ${r.utilidad >= 0 ? 'green' : ''}">
      Propinas: <b>${money(r.propinas)}</b> · Domicilios: <b>${money(r.domicilios)}</b>. No se suman a la utilidad de productos; se controlan en caja.
    </div>
  </div>

  <div class="card">
    <div class="card-title"><h2>Productos más vendidos</h2></div>
    ${tops.length ? `<table class="table-lite"><tr><th>Producto</th><th class="r">Cant.</th><th class="r">Venta</th></tr>${tops.map((t) => `<tr><td>${esc(t.nombre)}</td><td class="r">${t.cantidad}</td><td class="r">${money(t.venta)}</td></tr>`).join('')}</table>` : `<div class="empty">Sin ventas en el periodo.</div>`}
  </div>

  <div class="card">
    <div class="card-title"><h2>Cómo se cobró</h2></div>
    ${Object.entries(pagos).map(([k, v]) => `<div class="total-row"><span>${PAGOS[k]}</span><b>${money(v)}</b></div>`).join('')}
  </div>

  <div class="card">
    <div class="card-title"><h2>Punto de equilibrio</h2></div>
    <p class="small muted">Con los gastos del periodo, necesitas vender aproximadamente:</p>
    <div class="money-big mt10">${money(equilibrio)}</div>
    <p class="xs muted mt6">Cálculo: gastos ÷ margen de contribución. Si el margen es negativo, primero revisa precios y costos.</p>
  </div>

  ${r.costo === 0 && r.ventas > 0 ? `<div class="notice">Hay ventas sin costo registrado. Así la utilidad se ve más alta de lo real. Revisa el costo de esos productos.</div>` : ''}`;
}

/* ============================================================
   GASTOS
   ============================================================ */
function paginaGastos() {
  const lista = [...S.gastos].sort((a, b) => (b.fecha || '').localeCompare(a.fecha || '')).slice(0, 40);
  const total = S.gastos.reduce((s, g) => s + num(g.monto), 0);
  return `<div class="row between" style="margin-bottom:6px">
    <div><h2>Gastos</h2><p class="small muted">Todo lo que no es costo de producto.</p></div>
    <button class="btn primary sm" onclick="formGasto()">+ Gasto</button>
  </div>
  <div class="stat accent" style="margin-bottom:12px"><b>${money(total)}</b><span>Total registrado</span></div>
  ${lista.length ? `<div class="card tight">${lista.map((g) => `<div class="list-item"><div class="avatar">💸</div><div class="list-main"><b>${esc(g.concepto)}</b><span>${fmtFecha(g.fecha)} · ${esc(g.categoria || 'Otros')} · ${esc(PAGOS[g.metodo] || 'Efectivo')}</span></div><div class="amount">${money(g.monto)}</div></div>`).join('')}</div>` : `<div class="empty"><span class="big">💸</span>No hay gastos registrados.</div>`}`;
}

/* ============================================================
   MERMA
   ============================================================ */
function paginaMerma() {
  const lista = [...S.mermas].sort((a, b) => (b.creado || 0) - (a.creado || 0));
  const total = lista.reduce((s, m) => s + num(m.cantidad) * num(m.costoUnitario), 0);
  return `<div class="row between" style="margin-bottom:6px">
    <div><h2>Merma</h2><p class="small muted">Lo que se dañó o no se vendió.</p></div>
    <button class="btn primary sm" onclick="formMerma()">+ Merma</button>
  </div>
  <div class="stat accent" style="margin-bottom:12px"><b>${money(total)}</b><span>Costo de la merma</span></div>
  ${lista.length ? `<div class="card tight">${lista.map((m) => {
    const p = prod(m.productoId);
    return `<div class="list-item"><div class="avatar">🗑️</div><div class="list-main"><b>${esc(p ? p.nombre : 'Producto')}</b><span>${fmtFecha(m.fecha)} · ${num(m.cantidad)} ${esc(p ? p.unidad : '')} · ${esc(m.motivo || 'Sin motivo')}</span></div><div class="amount">${money(num(m.cantidad) * num(m.costoUnitario))}</div></div>`;
  }).join('')}</div>` : `<div class="empty"><span class="big">🗑️</span>No hay merma registrada.</div>`}`;
}

function formMerma() {
  if (!S.productos.length) return toast('Primero crea un producto.');
  sheet('Registrar merma', `
    ${selectCampo('meProducto', 'Producto', S.productos.map((p) => ({ v: p.id, t: p.nombre })), S.productos[0].id)}
    <div class="two">
      ${campo('meCantidad', 'Cantidad', '', 'number')}
      ${campo('meMotivo', 'Motivo', '', 'text', 'placeholder="Se dañó, no se vendió..."')}
    </div>
    <div class="notice">La merma descuenta stock y se resta de la utilidad.</div>
  `, `<button class="btn ghost" onclick="closeSheet()">Cancelar</button><button class="btn primary" onclick="guardarMerma()">Guardar merma</button>`);
}

function guardarMerma() {
  const p = prod($('#meProducto').value);
  const cantidad = num($('#meCantidad').value);
  if (!p || cantidad <= 0) return toast('Escoge producto y cantidad.');
  const costoUnitario = costoProducto(p);
  S.mermas.push({ id: uid(), fecha: hoyISO(), creado: Date.now(), productoId: p.id, cantidad, motivo: $('#meMotivo').value.trim(), costoUnitario });
  if (p.llevaInventario) p.stock = num(p.stock) - cantidad;
  guardar();
  closeSheet();
  render();
  toast('Merma registrada.');
}

/* ============================================================
   CONGELADOR / INVENTARIO
   ============================================================ */
function paginaCongelador() {
  const modo = S.cfg.modoInventario || 'simple';
  if (modo === 'ninguno') {
    return `<div class="row between" style="margin-bottom:6px"><div><h2>Congelador</h2><p class="small muted">Inventario desactivado.</p></div></div>
    <div class="card"><div class="empty"><span class="big">🧊</span>Este negocio está configurado <b>sin inventario</b>.<br><span class="xs">Puedes activarlo en Ajustes > Manejo de inventario.</span></div>
    <button class="btn primary block mt10" onclick="setTab('ajustes')">Activar inventario</button></div>`;
  }
  const conStock = S.productos.filter((p) => num(p.stock) > 0);
  const totalUnidades = conStock.reduce((s, p) => s + num(p.stock), 0);
  const totalValor = conStock.reduce((s, p) => s + num(p.stock) * costoProducto(p), 0);
  const mermaHoy = S.mermas.filter((m) => m.fecha === hoyISO()).reduce((s, m) => s + num(m.cantidad) * num(m.costoUnitario), 0);
  const desde = addDias(hoyISO(), -6);
  const ventas = S.pedidos.filter((p) => p.estado !== 'cancelado' && p.fecha >= desde && p.fecha <= hoyISO());
  const promedio = {};
  ventas.forEach((p) => (p.items || []).forEach((i) => {
    promedio[i.productoId] = (promedio[i.productoId] || 0) + num(i.cantidad);
  }));
  Object.keys(promedio).forEach((k) => { promedio[k] = promedio[k] / 7; });

  let h = `<div class="row between" style="margin-bottom:6px">
    <div><h2>${modo === 'congelador' ? 'Congelador' : 'Inventario'}</h2><p class="small muted">${modo === 'congelador' ? 'Produces por lote y vendes por día.' : 'Unidades disponibles.'}</p></div>
    <button class="btn primary sm" onclick="setTab('produccion')">+ Producción</button>
  </div>
  <div class="stats">
    <div class="stat accent"><b>${totalUnidades}</b><span>Unidades</span></div>
    <div class="stat"><b>${money(totalValor)}</b><span>Valor del stock</span></div>
    <div class="stat"><b>${conStock.length}</b><span>Productos con stock</span></div>
    <div class="stat"><b>${money(mermaHoy)}</b><span>Merma del día</span></div>
  </div>`;

  if (!conStock.length) {
    h += `<div class="card"><div class="empty"><span class="big">🧊</span>No hay unidades en ${modo === 'congelador' ? 'el congelador' : 'inventario'}.<br><span class="xs">Registra una producción para cargar stock.</span></div></div>`;
  } else {
    h += `<div class="card tight">${conStock.map((p) => {
      const avg = promedio[p.id] || 0;
      const dias = avg > 0 ? num(p.stock) / avg : null;
      const bajo = num(p.stock) <= num(p.stockMinimo);
      return `<div class="list-item">
        <div class="avatar" style="font-size:20px">${esc(p.emoji || '🍽️')}</div>
        <div class="list-main"><b>${esc(p.nombre)}</b><span>${num(p.stock)} ${esc(p.unidad)} · ${money(costoProducto(p))} c/u${avg > 0 ? ` · salen ${avg.toFixed(1)}/día` : ''}</span></div>
        <div style="text-align:right"><b class="small">${money(num(p.stock) * costoProducto(p))}</b><div class="xs ${bajo ? 'bold' : 'muted'}" style="color:${bajo ? 'var(--danger)' : 'var(--muted)'}">${dias == null ? 'sin ventas' : dias.toFixed(1) + ' días'}</div></div>
      </div>`;
    }).join('')}</div>`;
  }

  const prodRecientes = [...S.producciones].sort((a, b) => (b.creado || 0) - (a.creado || 0)).slice(0, 5);
  if (prodRecientes.length) {
    h += `<div class="card"><div class="card-title"><h2>Últimas producciones</h2><button class="link" onclick="setTab('produccion')">Ver todas ›</button></div>
      ${prodRecientes.map((p) => {
        const pr = prod(p.productoId);
        return `<div class="list-item"><div class="avatar">🍳</div><div class="list-main"><b>${esc(p.nombre || 'Producción')}</b><span>${fmtFecha(p.fecha)} · ${num(p.unidades)} ${esc(pr ? pr.unidad : '')} · ${money(p.costoUnitario)} c/u</span></div><div class="amount">${money(p.costoTotal)}</div></div>`;
      }).join('')}</div>`;
  }
  return h;
}

/* ============================================================
   PERSONAL
   ============================================================ */
function paginaPersonal() {
  const totalPagado = S.pagosPersonal.reduce((s, p) => s + num(p.monto), 0);
  const pagos = [...S.pagosPersonal].sort((a, b) => (b.creado || 0) - (a.creado || 0)).slice(0, 15);
  let h = `<div class="row between" style="margin-bottom:6px">
    <div><h2>Personal</h2><p class="small muted">Empleados y pagos de mano de obra.</p></div>
    <button class="btn primary sm" onclick="formEmpleado()">+ Empleado</button>
  </div>
  <div class="stat accent" style="margin-bottom:12px"><b>${money(totalPagado)}</b><span>Pagado al personal</span></div>`;

  if (!S.empleados.length) {
    h += `<div class="empty"><span class="big">👨‍🍳</span>No hay empleados registrados.</div>`;
  } else {
    h += `<div class="card tight">${S.empleados.map((e) => {
      const pagado = S.pagosPersonal.filter((p) => p.empleadoId === e.id).reduce((s, p) => s + num(p.monto), 0);
      return `<div class="list-item">
        <div class="avatar">${initials(e.nombre)}</div>
        <div class="list-main"><b>${esc(e.nombre)}</b><span>${esc([e.cargo, e.telefono].filter(Boolean).join(' · '))}</span><span class="xs muted">${esc(e.tipoPago || 'Día')} · ${money(e.tarifa)}</span></div>
        <div style="text-align:right"><b class="small">${money(pagado)}</b><div class="row" style="gap:4px;justify-content:flex-end;margin-top:4px"><button class="btn sm ghost" onclick="formEmpleado('${e.id}')">Editar</button><button class="btn sm soft" onclick="formPagoPersonal('${e.id}')">Pagar</button></div></div>
      </div>`;
    }).join('')}</div>`;
  }

  if (pagos.length) {
    h += `<div class="card"><div class="card-title"><h2>Últimos pagos</h2></div>${pagos.map((p) => {
      const e = S.empleados.find((x) => x.id === p.empleadoId);
      return `<div class="list-item"><div class="avatar">💵</div><div class="list-main"><b>${esc(e ? e.nombre : 'Empleado')}</b><span>${fmtFecha(p.fecha)} · ${esc(p.periodo || 'Pago')} · ${esc(PAGOS[p.metodo] || 'Efectivo')}</span></div><div class="amount">${money(p.monto)}</div></div>`;
    }).join('')}</div>`;
  }
  h += `<div class="notice mt10">Cada pago queda como gasto de <b>Mano de obra</b> y sale de la caja según el método de pago.</div>`;
  return h;
}

function formEmpleado(id) {
  const e = id ? S.empleados.find((x) => x.id === id) : null;
  sheet(e ? 'Editar empleado' : 'Nuevo empleado', `
    ${campo('emNombre', 'Nombre', e ? e.nombre : '', 'text')}
    <div class="two">${campo('emCargo', 'Cargo', e ? e.cargo : '', 'text', 'placeholder="Cocinero, mesero..."')}${campo('emTelefono', 'Teléfono', e ? e.telefono : '', 'text')}</div>
    <div class="two">
      ${selectCampo('emTipo', 'Tipo de pago', [{ v: 'Día', t: 'Por día' }, { v: 'Semana', t: 'Por semana' }, { v: 'Quincena', t: 'Por quincena' }, { v: 'Mes', t: 'Por mes' }, { v: 'Unidad', t: 'Por unidad' }], e ? e.tipoPago : 'Día')}
      ${campo('emTarifa', 'Tarifa', e ? e.tarifa : '', 'number')}
    </div>
    ${selectCampo('emActivo', 'Estado', [{ v: '1', t: 'Activo' }, { v: '0', t: 'Inactivo' }], e && e.activo === false ? '0' : '1')}
  `, `<button class="btn ghost" onclick="closeSheet()">Cancelar</button><button class="btn primary" onclick="guardarEmpleado('${e ? e.id : ''}')">Guardar</button>`);
}

function guardarEmpleado(id) {
  const nombre = $('#emNombre').value.trim();
  if (!nombre) return toast('Escribe el nombre del empleado.');
  const data = {
    nombre, cargo: $('#emCargo').value.trim(), telefono: $('#emTelefono').value.trim(),
    tipoPago: $('#emTipo').value, tarifa: num($('#emTarifa').value), activo: $('#emActivo').value === '1'
  };
  if (id) Object.assign(S.empleados.find((x) => x.id === id), data);
  else S.empleados.push(Object.assign({ id: uid() }, data));
  guardar();
  closeSheet();
  render();
  toast('Empleado guardado.');
}

function formPagoPersonal(empleadoId) {
  if (!S.empleados.length) return toast('Primero crea un empleado.');
  sheet('Pagar al personal', `
    ${selectCampo('ppEmpleado', 'Empleado', S.empleados.map((e) => ({ v: e.id, t: e.nombre })), empleadoId || S.empleados[0].id)}
    <div class="two">
      ${campo('ppMonto', 'Valor pagado', '', 'number')}
      ${selectCampo('ppPeriodo', 'Periodo', [{ v: 'Día', t: 'Día' }, { v: 'Semana', t: 'Semana' }, { v: 'Quincena', t: 'Quincena' }, { v: 'Mes', t: 'Mes' }, { v: 'Otro', t: 'Otro' }], 'Día')}
    </div>
    ${selectCampo('ppMetodo', 'Pagado con', Object.entries(PAGOS).map(([v, t]) => ({ v, t })), 'efectivo')}
    ${campo('ppNotas', 'Notas', '', 'text', 'placeholder="Turno, semana, etc."')}
    <div class="notice">Se registra como gasto de mano de obra y afecta la caja y la utilidad.</div>
  `, `<button class="btn ghost" onclick="closeSheet()">Cancelar</button><button class="btn primary" onclick="guardarPagoPersonal()">Registrar pago</button>`);
}

function guardarPagoPersonal() {
  const e = S.empleados.find((x) => x.id === $('#ppEmpleado').value);
  const monto = num($('#ppMonto').value);
  if (!e || monto <= 0) return toast('Escoge empleado y valor.');
  const pago = {
    id: uid(), fecha: hoyISO(), creado: Date.now(), empleadoId: e.id, monto,
    periodo: $('#ppPeriodo').value, metodo: $('#ppMetodo').value, notas: $('#ppNotas').value.trim()
  };
  S.pagosPersonal.push(pago);
  S.gastos.push({
    id: uid(), fecha: hoyISO(), concepto: `Pago a ${e.nombre}`, categoria: 'Mano de obra',
    monto, metodo: pago.metodo, origen: 'personal', empleadoId: e.id, pagoId: pago.id
  });
  guardar();
  closeSheet();
  render();
  toast(`Pago a ${e.nombre} registrado por ${money(monto)}.`);
}

/* ============================================================
   CLIENTES
   ============================================================ */
function paginaClientes() {
  let h = `<div class="row between" style="margin-bottom:6px">
    <div><h2>Clientes</h2><p class="small muted">${S.clientes.length} registrados</p></div>
    <button class="btn primary sm" onclick="formCliente()">+ Cliente</button>
  </div>`;
  if (!S.clientes.length) return h + `<div class="empty"><span class="big">👥</span>No hay clientes. Agrega el primero.</div>`;
  h += `<div class="card tight">`;
  S.clientes.forEach((c) => {
    const pedidos = S.pedidos.filter((p) => p.clienteId === c.id && p.estado !== 'cancelado');
    const total = pedidos.reduce((s, p) => s + num(p.total), 0);
    const debe = pedidos.filter((p) => !p.pagado).reduce((s, p) => s + num(p.total), 0);
    h += `<div class="list-item">
      <div class="avatar">${initials(c.nombre)}</div>
      <div class="list-main"><b>${esc(c.nombre)}</b><span>${esc([c.telefono, c.barrio, c.direccion].filter(Boolean).join(' · '))}</span></div>
      <div style="text-align:right"><b class="small">${money(total)}</b><div class="xs ${debe ? 'bold' : 'muted'}" style="color:${debe ? 'var(--danger)' : 'var(--muted)'}">${debe ? 'debe ' + money(debe) : 'al día'}</div><button class="btn sm ghost mt6" onclick="formCliente('${c.id}')">Editar</button></div>
    </div>`;
  });
  return h + `</div>`;
}

function formCliente(id) {
  const c = id ? cliente(id) : null;
  sheet(c ? 'Editar cliente' : 'Nuevo cliente', `
    ${campo('clNombre', 'Nombre', c ? c.nombre : '', 'text')}
    ${campo('clTelefono', 'Teléfono / WhatsApp', c ? c.telefono : '', 'text')}
    ${campo('clDireccion', 'Dirección', c ? c.direccion : '', 'text')}
    ${campo('clBarrio', 'Barrio', c ? c.barrio : '', 'text')}
    ${campo('clNotas', 'Notas', c ? c.notas : '', 'text', 'placeholder="Portón, referencias, preferencias..."')}
  `, `<button class="btn ghost" onclick="closeSheet()">Cancelar</button><button class="btn primary" onclick="guardarCliente('${c ? c.id : ''}')">Guardar</button>`);
}

function guardarCliente(id) {
  const nombre = $('#clNombre').value.trim();
  if (!nombre) return toast('Escribe el nombre del cliente.');
  const data = {
    nombre,
    telefono: $('#clTelefono').value.trim(),
    direccion: $('#clDireccion').value.trim(),
    barrio: $('#clBarrio').value.trim(),
    notas: $('#clNotas').value.trim()
  };
  if (id) Object.assign(cliente(id), data);
  else {
    const c = Object.assign({ id: uid(), creado: Date.now() }, data);
    S.clientes.push(c);
    UI.clienteId = c.id;
  }
  guardar();
  closeSheet();
  render();
  toast('Cliente guardado.');
}

/* ============================================================
   DOMICILIARIOS
   ============================================================ */
function paginaDomiciliarios() {
  let h = `<div class="row between" style="margin-bottom:6px">
    <div><h2>Domiciliarios</h2><p class="small muted">Quién lleva cada pedido.</p></div>
    <button class="btn primary sm" onclick="formDomiciliario()">+ Domiciliario</button>
  </div>`;
  if (!S.domiciliarios.length) return h + `<div class="empty"><span class="big">🛵</span>No hay domiciliarios. Agrega el primero.</div>`;
  h += `<div class="card tight">`;
  S.domiciliarios.forEach((d) => {
    const activos = S.pedidos.filter((p) => p.domiciliarioId === d.id && !['entregado', 'cancelado'].includes(p.estado)).length;
    h += `<div class="list-item">
      <div class="avatar">🛵</div>
      <div class="list-main"><b>${esc(d.nombre)}</b><span>${esc([d.telefono, d.vehiculo, d.zona].filter(Boolean).join(' · '))}</span></div>
      <div style="text-align:right"><span class="pill ${d.activo !== false ? 'ok' : 'danger'}">${d.activo !== false ? 'Activo' : 'Inactivo'}</span><div class="xs muted mt6">${activos} pedidos</div><button class="btn sm ghost mt6" onclick="formDomiciliario('${d.id}')">Editar</button></div>
    </div>`;
  });
  return h + `</div>`;
}

function formDomiciliario(id) {
  const d = id ? domiciliario(id) : null;
  sheet(d ? 'Editar domiciliario' : 'Nuevo domiciliario', `
    ${campo('doNombre', 'Nombre', d ? d.nombre : '', 'text')}
    ${campo('doTelefono', 'Teléfono', d ? d.telefono : '', 'text')}
    <div class="two">
      ${campo('doVehiculo', 'Vehículo', d ? d.vehiculo : 'Moto', 'text')}
      ${campo('doZona', 'Zona', d ? d.zona : '', 'text', 'placeholder="Centro, Norte..."')}
    </div>
    ${selectCampo('doActivo', 'Estado', [{ v: '1', t: 'Activo' }, { v: '0', t: 'Inactivo' }], d && d.activo === false ? '0' : '1')}
  `, `<button class="btn ghost" onclick="closeSheet()">Cancelar</button><button class="btn primary" onclick="guardarDomiciliario('${d ? d.id : ''}')">Guardar</button>`);
}

function guardarDomiciliario(id) {
  const nombre = $('#doNombre').value.trim();
  if (!nombre) return toast('Escribe el nombre.');
  const data = {
    nombre: $('#doNombre').value.trim(),
    telefono: $('#doTelefono').value.trim(),
    vehiculo: $('#doVehiculo').value.trim(),
    zona: $('#doZona').value.trim(),
    activo: $('#doActivo').value === '1'
  };
  if (id) Object.assign(domiciliario(id), data);
  else S.domiciliarios.push(Object.assign({ id: uid() }, data));
  guardar();
  closeSheet();
  render();
  toast('Domiciliario guardado.');
}

/* ============================================================
   AJUSTES
   ============================================================ */
function paginaAjustes() {
  const c = S.cfg;
  return `<div class="row between" style="margin-bottom:6px"><div><h2>Ajustes</h2><p class="small muted">Negocio, pagos, licencia y respaldo.</p></div></div>
  <div class="card">
    <div class="card-title"><h2>Negocio</h2></div>
    ${campo('aNegocio', 'Nombre del negocio', c.negocio)}
    ${campo('aLema', 'Lema', c.lema)}
    <div class="two">
      ${campo('aWhatsapp', 'WhatsApp', c.whatsapp)}
      ${campo('aNequi', 'Nequi', c.nequi)}
    </div>
    <div class="two">
      ${campo('aDireccion', 'Dirección', c.direccion)}
      ${campo('aCiudad', 'Ciudad', c.ciudad)}
    </div>
    ${campo('aDomicilio', 'Domicilio por defecto', c.domicilio, 'number')}
    <div class="field"><label>Manejo de inventario</label>
      <select id="aModoInv">
        <option value="ninguno" ${c.modoInventario === 'ninguno' ? 'selected' : ''}>No manejo inventario</option>
        <option value="simple" ${c.modoInventario === 'simple' ? 'selected' : ''}>Inventario simple</option>
        <option value="congelador" ${c.modoInventario === 'congelador' ? 'selected' : ''}>Congelador por lotes</option>
      </select>
      <div class="hint">Congelador: produces un lote grande y vendes porciones cada día; el stock baja con cada venta.</div>
    </div>
    ${campo('aPropinas', 'Propinas sugeridas (separadas por coma)', c.propinas.join(', '))}
    <div class="photo-pick">
      <div><div class="small bold">Logo</div><div class="xs muted">Cuadrado, PNG o JPG</div></div>
      ${c.logo ? `<img src="${c.logo}" alt="Logo">` : ''}
      <label class="btn ghost sm" style="display:inline-flex">Cambiar<input type="file" accept="image/*" style="display:none" onchange="leerImagen(this,'logo')"></label>
    </div>
    <div class="divider"></div>
    <div class="photo-pick">
      <div><div class="small bold">QR de pago</div><div class="xs muted">Nequi, Bancolombia o el que uses</div></div>
      ${c.qr ? `<img src="${c.qr}" alt="QR">` : ''}
      <label class="btn ghost sm" style="display:inline-flex">Cargar QR<input type="file" accept="image/*" style="display:none" onchange="leerImagen(this,'qr')"></label>
      ${c.qr ? `<button class="btn soft sm" onclick="verQR()">Ver QR</button>` : ''}
    </div>
    <button class="btn primary block mt14" onclick="guardarAjustes()">Guardar ajustes</button>
  </div>

  ${typeof nubeCard === 'function' ? nubeCard() : ''}

  <div class="card">
    <div class="card-title"><h2>Licencia</h2><span class="pill ${c.licencia.activa ? 'ok' : 'warn'}">${c.licencia.activa ? 'Activa' : 'Demo'}</span></div>
    <p class="small muted">Licencia para <b>1 computador + 1 celular</b> cuando el plan es Negocio. Código de este equipo:</p>
    <div class="notice mt10"><b>${esc(c.licencia.equipo)}</b></div>
    ${c.licencia.activa ? `<div class="notice green mt10">Plan: <b>${esc(c.licencia.plan || c.licencia.codigo || 'Negocio')}</b>${c.licencia.cliente ? ` · ${esc(c.licencia.cliente)}` : ''}${c.licencia.equipos ? ` · ${c.licencia.equipos.length} equipo(s)` : ''}</div>` : `<div class="notice mt10">Demo activa: ${demoDiasRestantes()} días restantes.</div>`}
    <label class="btn soft block mt10" style="display:flex;justify-content:center">Cargar archivo de licencia<input type="file" accept=".json,application/json" style="display:none" onchange="importarLicencia(this)"></label>
    <p class="xs muted mt6">La licencia se verifica contra los códigos de equipo incluidos en el archivo. El plan Local es para un equipo; el plan Negocio puede incluir PC y celular.</p>
  </div>

  <div class="card">
    <div class="card-title"><h2>Copia de seguridad</h2></div>
    ${SERVER_API ? `<div class="notice green">Guardado automático activo en la carpeta <b>datos</b> del programa.</div>` : ''}
    <p class="small muted">Es una copia de todo tu negocio para recuperarlo si cambias de celular o borras los datos.</p>
    ${c.ultimaCopia ? `<div class="notice green mt10">Última copia: <b>${fmtFecha(c.ultimaCopia)}</b></div>` : `<div class="notice mt10">Todavía no has guardado una copia.</div>`}
    <button class="btn primary block mt10" onclick="abrirCopiaSheet()">Guardar o enviar copia</button>
    <label class="btn ghost block mt10" style="display:flex;justify-content:center">Restaurar copia<input type="file" accept=".json,application/json" style="display:none" onchange="importarRespaldo(this)"></label>
    <button class="link block mt10" onclick="restaurarTextoSheet()">No tengo el archivo: pegar texto</button>
    <div class="notice mt10">Al restaurar, se reemplazan todos los datos de este equipo por los de la copia.</div>
  </div>

  <div class="card">
    <div class="card-title"><h2>Datos de prueba</h2></div>
    <p class="small muted">Borra todo y vuelve a la configuración inicial. Después puedes restaurar una copia desde la misma pantalla de inicio.</p>
    <button class="btn danger block mt10" onclick="resetDemo()">Borrar todo y volver a configuración inicial</button>
  </div>

  <div class="card">
    <div class="card-title"><h2>Ayuda rápida</h2></div>
    <p class="small">1. Crea productos y ponles precio y costo.<br>2. Si usas receta o lote, carga insumos y producción.<br>3. Vende y cobra.<br>4. Cierra caja al final del día.<br>5. Guarda una copia de seguridad.</p>
    <button class="btn ghost block mt10" onclick="setTab('mas')">‹ Volver a Más</button>
  </div>`;
}

function guardarAjustes() {
  const propinas = $('#aPropinas').value.split(',').map((x) => num(x)).filter((x) => x > 0);
  const modo = $('#aModoInv').value;
  if (modo !== S.cfg.modoInventario && S.productos.length) {
    if (!confirm('¿Aplicar este manejo de inventario a todos los productos?')) return;
    S.productos.forEach((p) => { p.llevaInventario = modo !== 'ninguno'; });
  }
  Object.assign(S.cfg, {
    negocio: $('#aNegocio').value.trim() || 'Mi Negocio',
    lema: $('#aLema').value.trim(),
    whatsapp: $('#aWhatsapp').value.trim(),
    nequi: $('#aNequi').value.trim(),
    direccion: $('#aDireccion').value.trim(),
    ciudad: $('#aCiudad').value.trim(),
    domicilio: num($('#aDomicilio').value),
    modoInventario: modo,
    propinas: propinas.length ? propinas : [1000, 2000, 5000]
  });
  guardar();
  render();
  toast('Ajustes guardados.');
}

function leerImagen(input, campo) {
  const f = input.files && input.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    S.cfg[campo] = r.result;
    guardar();
    render();
    toast(campo === 'qr' ? 'QR cargado.' : 'Logo cargado.');
  };
  r.readAsDataURL(f);
}

function verQR() {
  if (!S.cfg.qr) return toast('Primero carga un QR en Ajustes.');
  sheet('QR de pago', `<img class="qr-preview" src="${S.cfg.qr}" alt="QR de pago"><p class="center small muted">Muestra este código al cliente y confirma el pago.</p>`, `<button class="btn primary" onclick="closeSheet()">Listo</button>`);
}

function nombreCopia() {
  return `Copia-Mi-Negocio-${hoyISO()}.json`;
}

function abrirCopiaSheet() {
  sheet('Copia de seguridad', `
    <div class="notice green">Es una copia de todos los datos de tu negocio.</div>
    <p class="small muted mt10">Puedes compartirla por WhatsApp, guardarla en Drive o descargarla. Si cambias de teléfono o borras la app, la usas para recuperar todo.</p>
    <button class="btn primary block mt14" onclick="compartirCopia()">📤 Compartir copia (WhatsApp, Drive...)</button>
    <button class="btn ghost block mt10" onclick="descargarCopia()">⬇ Guardar copia en el celular</button>
    <p class="xs muted mt10">En el celular, elige <b>Drive</b> en el menú de compartir. En el PC, guarda el archivo en tu carpeta de Google Drive.</p>
    <details class="mt14">
      <summary class="small bold" style="cursor:pointer">Si no puedes enviarla ni descargarla</summary>
      <button class="btn soft block mt10" onclick="copiarRespaldo()">Copiar como texto</button>
      <p class="xs muted mt6">Pégalo en WhatsApp, Notas o un correo. Es la opción avanzada.</p>
    </details>
  `, `<button class="btn primary" onclick="closeSheet()">Cerrar</button>`);
}

function exportarRespaldo() {
  abrirCopiaSheet();
}

function marcarCopia() {
  S.cfg.ultimaCopia = hoyISO();
  guardar();
}

function descargarCopia() {
  const data = JSON.stringify(S, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nombreCopia();
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  marcarCopia();
  toast('Copia guardada en Descargas.');
}

async function compartirCopia() {
  const data = JSON.stringify(S, null, 2);
  const file = new File([data], nombreCopia(), { type: 'application/json' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Copia de seguridad de Mi Negocio', text: 'Copia de seguridad de mi negocio' });
      marcarCopia();
      toast('Copia enviada. Guárdala en WhatsApp o Drive.');
      return;
    } catch (e) {
      if (e && e.name === 'AbortError') return;
    }
  }
  descargarCopia();
  toast('Tu celular no permite enviar el archivo; se guardó en Descargas.');
}

function copiarRespaldo() {
  const data = JSON.stringify(S, null, 2);
  const ta = document.getElementById('backupTexto');
  if (ta) {
    ta.value = data;
    ta.focus();
    ta.select();
    try { document.execCommand('copy'); marcarCopia(); toast('Copia copiada.'); return; } catch (e) {}
  }
  sheet('Copiar copia de seguridad', `
    <p class="small muted">Selecciona todo el texto, cópialo y pégalo en WhatsApp, Notas o un correo. Sirve para restaurar después.</p>
    <textarea id="backupTexto" style="width:100%;height:220px;font-size:11px;border:1px solid var(--line);border-radius:10px;padding:8px">${esc(data)}</textarea>
  `, `<button class="btn ghost" onclick="closeSheet()">Cerrar</button><button class="btn primary" onclick="copiarTextoRespaldo()">Copiar texto</button>`);
}

function copiarTextoRespaldo() {
  const ta = document.getElementById('backupTexto');
  if (!ta) return;
  ta.focus();
  ta.select();
  try {
    document.execCommand('copy');
    marcarCopia();
    toast('Copia copiada. Pégalo en WhatsApp o Notas.');
  } catch (e) {
    toast('Mantén presionado el texto para copiarlo.');
  }
}

function restaurarTextoSheet() {
  sheet('Restaurar copia de seguridad', `
    <p class="small muted">Pega aquí el texto de la copia que guardaste. Reemplaza todos los datos de este equipo.</p>
    <textarea id="restaurarTexto" placeholder="Pega aquí el texto de la copia..." style="width:100%;height:240px;font-size:11px;border:1px solid var(--line);border-radius:10px;padding:8px"></textarea>
    <div class="notice mt10">Si el texto está incompleto, la app no lo va a restaurar.</div>
  `, `<button class="btn ghost" onclick="closeSheet()">Cancelar</button><button class="btn primary" onclick="restaurarDesdeTexto()">Restaurar</button>`);
}

function restaurarDesdeTexto() {
  const txt = document.getElementById('restaurarTexto').value.trim();
  if (!txt) return toast('Pega la copia primero.');
  try {
    const d = JSON.parse(txt);
    aplicarRespaldo(d);
  } catch (e) {
    toast('El texto no es una copia válida de Mi Negocio.');
  }
}

function aplicarRespaldo(d) {
  if (!d || !d.cfg || !Array.isArray(d.productos)) throw new Error('Copia no válida');
  if (!confirm('Esto reemplaza todos los datos de este equipo por los de la copia. ¿Continuar?')) return;
  S = normalizar(d);
  S.cfg.setupCompleto = true;
  UI.tab = 'hoy';
  UI.cart = [];
  UI.clienteId = '';
  UI.setup = { paso: 1, tipo: '', negocio: S.cfg.negocio || 'Mi Negocio', whatsapp: S.cfg.whatsapp || '', ciudad: S.cfg.ciudad || '', direccion: S.cfg.direccion || '', domicilio: num(S.cfg.domicilio) || 3000, modoInventario: S.cfg.modoInventario || 'simple', productos: [] };
  guardar();
  closeSheet();
  render();
  toast(`Respaldo restaurado: ${S.productos.length} productos y ${S.pedidos.length} pedidos.`);
}

function importarRespaldo(input) {
  const f = input.files && input.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result);
      aplicarRespaldo(d);
    } catch (e) {
      toast('El archivo no es un respaldo válido de Mi Negocio.');
    } finally {
      input.value = '';
    }
  };
  r.readAsText(f);
}

function resetDemo() {
  if (!confirm('¿Borrar todos los datos y volver a la configuración inicial? Esta acción no se puede deshacer.')) return;
  localStorage.removeItem(KEY);
  S = normalizar(null);
  UI = Object.assign(UI, {
    tab: 'hoy', cart: [], clienteId: '', tipo: 'domicilio', pago: 'efectivo', propina: 0, domicilio: null,
    setup: { paso: 1, tipo: '', negocio: 'Mi Negocio', whatsapp: '', ciudad: '', direccion: '', domicilio: 3000, modoInventario: 'simple', logo: '', productos: [] }
  });
  guardar();
  render();
  toast('Datos borrados. Empieza la configuración inicial.');
}

/* ============================================================
   INICIO
   ============================================================ */
const _tab = new URLSearchParams(location.search).get('tab');
if (_tab && ['hoy', 'vender', 'pedidos', 'domicilios', 'caja', 'mas', 'productos', 'insumos', 'compras', 'proveedores', 'produccion', 'recetas', 'utilidad', 'gastos', 'merma', 'personal', 'congelador', 'clientes', 'domiciliarios', 'ajustes'].includes(_tab)) UI.tab = _tab;
render();
if (SERVER_API) setTimeout(guardar, 400);


