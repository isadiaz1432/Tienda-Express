/* Importa useState para manejar los datos que cambian en la pantalla.
También importa FormEvent para definir el tipo de evento de los formularios. */
import { useState, type FormEvent } from "react";

// Importa los estilos visuales de la aplicación.
import "./App.css";

// Define la estructura que debe tener cada producto del inventario.
type Producto = {
id: number;
nombre: string;
categoria: string;
precio: number;
stock: number;
};

// Define la estructura que debe tener cada pedido registrado.
type Pedido = {
id: number;
cliente: string;
productoId: number;
producto: string;
precio: number;
cantidad: number;
fecha: string;
estado: "Pendiente" | "En proceso" | "Entregado";
};

// Crea la lista de categorías disponibles para registrar productos.
const categorias = [
"Tecnología",
"Accesorios",
"Ropa",
"Calzado",
"Belleza",
"Hogar",
"Alimentos",
"Deportes",
"Papelería",
"Juguetes",
"Otros",
];

// Declara el componente principal de la aplicación.
function App() {
// Guarda la lista de productos registrados.
const [productos, setProductos] = useState<Producto[]>([]);

// Guarda la lista de pedidos registrados.
const [pedidos, setPedidos] = useState<Pedido[]>([]);

// Controla qué sección se muestra: productos o pedidos.
const [seccion, setSeccion] =
useState<"productos" | "pedidos">("productos");

// Guarda el texto que escribe el usuario en el buscador.
const [busqueda, setBusqueda] = useState("");

// Guarda los mensajes de confirmación o de error.
const [mensaje, setMensaje] = useState("");

// Guarda el nombre escrito en el formulario de productos.
const [nombre, setNombre] = useState("");

// Guarda la categoría seleccionada para el producto.
const [categoria, setCategoria] = useState("");

// Guarda el precio escrito como texto antes de convertirlo a número.
const [precio, setPrecio] = useState("");

// Guarda la cantidad de existencias escrita en el formulario.
const [stock, setStock] = useState("");

// Guarda el nombre del cliente que realiza el pedido.
const [cliente, setCliente] = useState("");

// Guarda el identificador del producto elegido para el pedido.
const [productoId, setProductoId] = useState("");

// Guarda la cantidad solicitada por el cliente.
const [cantidad, setCantidad] = useState("");

// Crea una función que obtiene la fecha actual.
const fechaHoy = () => {
// Obtiene la fecha y hora actuales del dispositivo.
const fecha = new Date();

// Devuelve la fecha en formato AAAA-MM-DD con mes y día de dos cifras.
return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;

};

// Guarda la fecha seleccionada para el pedido.
const [fechaPedido, setFechaPedido] = useState(fechaHoy());

// Crea una función para mostrar valores monetarios en pesos colombianos.
const dinero = (valor: number) =>
valor.toLocaleString("es-CO", {
style: "currency",
currency: "COP",
maximumFractionDigits: 0,
});

// Declara la función que registra un producto en el inventario.
function registrarProducto(e: FormEvent<HTMLFormElement>) {
e.preventDefault();

const precioNum = Number(precio);
const stockNum = Number(stock);

if (!nombre.trim() || !categoria || precio === "" || stock === "") {
  setMensaje("Completa todos los campos del producto.");
  return;
}

if (
  !Number.isFinite(precioNum) ||
  precioNum <= 0 ||
  !Number.isInteger(stockNum) ||
  stockNum < 0
) {
  setMensaje(
    "El precio debe ser positivo y el stock un entero no negativo."
  );
  return;
}

setProductos((actuales) => [
  ...actuales,
  {
    id: Date.now(),
    nombre: nombre.trim(),
    categoria,
    precio: precioNum,
    stock: stockNum,
  },
]);

setNombre("");
setCategoria("");
setPrecio("");
setStock("");
setMensaje("Producto registrado correctamente.");

}

// Declara la función que registra un pedido de un cliente.
function registrarPedido(e: FormEvent<HTMLFormElement>) {
e.preventDefault();

const producto = productos.find(
  (p) => p.id === Number(productoId)
);

const cantidadNum = Number(cantidad);

if (!cliente.trim() || !producto || cantidad === "") {
  setMensaje("Completa todos los campos del pedido.");
  return;
}

if (!Number.isInteger(cantidadNum) || cantidadNum <= 0) {
  setMensaje("La cantidad debe ser un entero mayor que cero.");
  return;
}

if (producto.stock < cantidadNum) {
  setMensaje(`Stock insuficiente. Solo hay ${producto.stock} unidades.`);
  return;
}

// Crea el objeto que representa el nuevo pedido.
const nuevoPedido: Pedido = {
  id: Date.now(),
  cliente: cliente.trim(),
  productoId: producto.id,
  producto: producto.nombre,
  precio: producto.precio,
  cantidad: cantidadNum,
  fecha: fechaPedido,
  estado: "Pendiente",
};

setPedidos((actuales) => [...actuales, nuevoPedido]);

setProductos((actuales) =>
  actuales.map((p) =>
    p.id === producto.id
      ? { ...p, stock: p.stock - cantidadNum }
      : p
  )
);

setCliente("");
setProductoId("");
setCantidad("");
setFechaPedido(fechaHoy());
setMensaje("Pedido registrado correctamente.");

}

// Declara una función para actualizar el estado de un pedido.
function cambiarEstado(id: number, estado: Pedido["estado"]) {
setPedidos((actuales) =>
actuales.map((p) =>
p.id === id ? { ...p, estado } : p
)
);

setMensaje("Estado del pedido actualizado.");

}

// Filtra los productos por nombre o categoría según la búsqueda.
const productosFiltrados = productos.filter((p) =>
"${p.nombre} ${p.categoria}"
.toLowerCase()
.includes(busqueda.toLowerCase())
);

// Filtra los pedidos por cliente, producto o estado.
const pedidosFiltrados = pedidos.filter((p) =>
"${p.cliente} ${p.producto} ${p.estado}"
.toLowerCase()
.includes(busqueda.toLowerCase())
);

// Cuenta cuántos pedidos tienen el estado Pendiente.
const pendientes = pedidos.filter(
(p) => p.estado === "Pendiente"
).length;

// Calcula la suma del precio por la cantidad de cada pedido.
const valorPedidos = pedidos.reduce(
(total, p) => total + p.precio * p.cantidad,
0
);

// Devuelve los elementos visuales que componen la aplicación.
return (
<div className="app">
<aside className="sidebar">
<div className="brand">
<div className="brand-icon">T</div>
<div>
<h2>Tienda Express</h2>
<span>Panel administrativo</span>
</div>
</div>

    <p className="menu-label">MENÚ PRINCIPAL</p>

    <button
      className={`nav-item ${seccion === "productos" ? "active" : ""}`}
      onClick={() => {
        setSeccion("productos");
        setBusqueda("");
        setMensaje("");
      }}
    >
      <span>▦</span> Productos
    </button>

    <button
      className={`nav-item ${seccion === "pedidos" ? "active" : ""}`}
      onClick={() => {
        setSeccion("pedidos");
        setBusqueda("");
        setMensaje("");
      }}
    >
      <span>▤</span> Pedidos
    </button>

    <div className="sidebar-bottom">
      <span className="online-dot" />
      Sistema en funcionamiento
      <small>Proyecto ADSO · React + TypeScript</small>
    </div>
  </aside>

  <main className="main-content">
    <header className="topbar">
      <div>
        <span className="eyebrow">GESTIÓN COMERCIAL</span>
        <h1>
          {seccion === "productos" ? "Productos" : "Pedidos"}
        </h1>
      </div>
      <div className="date-chip">📅 {fechaHoy()}</div>
    </header>

    <section className="welcome">
      <div>
        <span className="welcome-tag">TIENDA EXPRESS</span>
        <h2>Todo bajo control.</h2>
        <p>Administra productos y pedidos desde un solo lugar.</p>
      </div>
    </section>

    <section className="stats">
      <article className="stat-card">
        <div className="stat-icon blue">▦</div>
        <span>Productos registrados</span>
        <strong>{productos.length}</strong>
        <small>Referencias en el catálogo</small>
      </article>

      <article className="stat-card">
        <div className="stat-icon purple">▤</div>
        <span>Pedidos registrados</span>
        <strong>{pedidos.length}</strong>
        <small>Solicitudes de clientes</small>
      </article>

      <article className="stat-card">
        <div className="stat-icon orange">◷</div>
        <span>Pendientes</span>
        <strong>{pendientes}</strong>
        <small>Por gestionar</small>
      </article>

      <article className="stat-card">
        <div className="stat-icon green">$</div>
        <span>Valor de pedidos</span>
        <strong className="money">{dinero(valorPedidos)}</strong>
        <small>Según el precio al registrar</small>
      </article>
    </section>

    <div className="section-heading">
      <div>
        <span className="eyebrow">CENTRO DE OPERACIONES</span>
        <h2>
          {seccion === "productos"
            ? "Inventario de productos"
            : "Seguimiento de pedidos"}
        </h2>
      </div>
      <span className="count-badge">
        {seccion === "productos" ? productos.length : pedidos.length}
        {" "}registros
      </span>
    </div>

    {mensaje && (
      <div className="message" role="status">
        <span>✓</span> {mensaje}
        <button
          className="close-message"
          onClick={() => setMensaje("")}
        >
          ×
        </button>
      </div>
    )}

    {seccion === "productos" ? (
      <>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Registrar producto</h3>
              <p>Añade una referencia nueva al inventario.</p>
            </div>
            <span className="panel-symbol">＋</span>
          </div>

          <form onSubmit={registrarProducto} className="form-grid">
            <label>
              Nombre del producto *
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Audífonos inalámbricos"
                required
              />
            </label>

            <label>
              Categoría *
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                required
              >
                <option value="">Selecciona una categoría</option>
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Precio en COP *
              <input
                type="number"
                min="1"
                step="1"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="Ej. 85000"
                required
              />
            </label>

            <label>
              Stock disponible *
              <input
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Ej. 15"
                required
              />
            </label>

            <div className="form-actions">
              <button className="primary-button" type="submit">
                ＋ Registrar producto
              </button>
            </div>
          </form>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Listado de productos</h3>
              <p>Consulta precios, categorías y existencias.</p>
            </div>
            <span className="panel-symbol">▦</span>
          </div>

          <input
            className="search-input"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="⌕ Buscar por nombre o categoría..."
          />

          {productosFiltrados.length === 0 ? (
            <div className="empty-state">
              <div>▦</div>
              <h3>No hay productos para mostrar</h3>
              <p>Registra un producto o cambia la búsqueda.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {productosFiltrados.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.nombre}</strong>
                        <small className="subtext">ID: {p.id}</small>
                      </td>
                      <td>{p.categoria}</td>
                      <td>{dinero(p.precio)}</td>
                      <td>
                        <span
                          className={`stock-badge ${p.stock === 0 ? "out" : ""}`}
                        >
                          {p.stock} unidades
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </>
    ) : (
      <>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Registrar pedido</h3>
              <p>Asocia un cliente con un producto del inventario.</p>
            </div>
            <span className="panel-symbol">＋</span>
          </div>

          {productos.length === 0 ? (
            <div className="notice">
              Primero registra al menos un producto en la sección Productos.
            </div>
          ) : (
            <form onSubmit={registrarPedido} className="form-grid">
              <label>
                Nombre del cliente *
                <input
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  placeholder="Ej. Laura Gómez"
                  required
                />
              </label>

              <label>
                Producto *
                <select
                  value={productoId}
                  onChange={(e) => setProductoId(e.target.value)}
                  required
                >
                  <option value="">Selecciona un producto</option>
                  {productos.map((p) => (
                    <option
                      key={p.id}
                      value={p.id}
                      disabled={p.stock === 0}
                    >
                      {p.nombre} · Stock: {p.stock}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Cantidad *
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  placeholder="Ej. 2"
                  required
                />
              </label>

              {/* Campo para seleccionar la fecha del pedido. */}
              <label>
                Fecha del pedido *
                <input
                  type="date"
                  value={fechaPedido}
                  onChange={(e) => setFechaPedido(e.target.value)}
                  required
                />
              </label>

              <div className="form-actions">
                <button className="primary-button" type="submit">
                  ＋ Registrar pedido
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Listado de pedidos</h3>
              <p>Consulta y actualiza el estado de cada solicitud.</p>
            </div>
            <span className="panel-symbol">▤</span>
          </div>

          <input
            className="search-input"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="⌕ Buscar cliente, producto o estado..."
          />

          {pedidosFiltrados.length === 0 ? (
            <div className="empty-state">
              <div>▤</div>
              <h3>No hay pedidos para mostrar</h3>
              <p>Registra un pedido para comenzar el seguimiento.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Cliente / Producto</th>
                    <th>Fecha</th>
                    <th>Cantidad</th>
                    <th>Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidosFiltrados.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.cliente}</strong>
                        <small className="subtext">{p.producto}</small>
                      </td>
                      <td>{p.fecha}</td>
                      <td>{p.cantidad}</td>
                      <td>{dinero(p.precio * p.cantidad)}</td>
                      <td>
                        <select
                          className={`status-select ${p.estado.toLowerCase().replace(" ", "-")}`}
                          value={p.estado}
                          onChange={(e) =>
                            cambiarEstado(
                              p.id,
                              e.target.value as Pedido["estado"]
                            )
                          }
                          aria-label={`Estado del pedido de ${p.cliente}`}
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="En proceso">En proceso</option>
                          <option value="Entregado">Entregado</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </>
    )}

    <footer>
      <span>TIENDA EXPRESS</span>
      <span>Proyecto ADSO · React + TypeScript + Vite</span>
    </footer>
  </main>
</div>

);
}

// Exporta el componente para que pueda utilizarse desde main.tsx.
export default App;