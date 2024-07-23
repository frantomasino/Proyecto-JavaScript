let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function mostrarCarrito() {
  const carritoContainer = document.getElementById("lista-carrito");
  carritoContainer.innerHTML = "";

  carrito.forEach((producto, index) => {
    const { nombre, precio, cantidad } = producto;
    const item = document.createElement("li");
    const precioFormateado = precio.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    });
    item.innerHTML = `
            <span>${nombre} - Precio: ${precioFormateado}</span>
            <button class="incrementar-btn" data-index="${index}">+</button>
            <span>Cantidad: ${cantidad}</span>
            <button class="decrementar-btn" data-index="${index}">-</button>
            <button class="eliminar-btn" data-index="${index}">Eliminar</button>`;
    carritoContainer.appendChild(item);
  });

  calcularTotal();
}



function agregarAlCarrito(event) {
  const boton = event.target;
  const productDiv = boton.closest('.card');
  const nombreProducto = productDiv.querySelector('.card-title').textContent;
  const precioProductoTexto = productDiv.querySelector('.card-text').textContent;
  const precioNumero = Number(precioProductoTexto.replace(/[^0-9,-]+/g, "").replace(',', '.'));

  const cantidadInput = productDiv.querySelector('.cantidad-input');
  let cantidad = Number(cantidadInput.value);

  const cantidadMinima = 1;
  const cantidadMaxima = 20;  

  if (cantidad < cantidadMinima || isNaN(cantidad)) {
      Swal.fire({
          icon: 'warning',
          title: 'Cantidad mínima',
          text: 'Agregar al menos 1 unidad del producto.'
      });
      return;  
  }

  const productoExistente = carrito.find(producto => producto.nombre === nombreProducto);
  if (productoExistente) {
      const totalCantidad = cantidad + productoExistente.cantidad;
      if (totalCantidad > cantidadMaxima) {
          Swal.fire({
              icon: 'warning',
              title: 'Cantidad máxima alcanzada',
              text: 'Solo se permiten agregar hasta 20 unidades del mismo producto.'
          });
          return;  
      }
      productoExistente.cantidad = totalCantidad;
  } else {
      if (cantidad > cantidadMaxima) {
          cantidad = cantidadMaxima;
          Swal.fire({
              icon: 'warning',
              title: 'Cantidad máxima alcanzada',
              text: 'Solo se permiten agregar hasta 20 unidades del mismo producto.'
          });
          return;  
      }
      const producto = {
          nombre: nombreProducto,
          precio: precioNumero,
          cantidad: cantidad
      };
      carrito.push(producto);
  }

  guardarCarritoEnLocalStorage();
  mostrarCarrito();

  Swal.fire({
      title: "Agregado",
      showCancelButton: false,
      showCloseButton: false,
      timer: 1000,
      onClose: () => {}
  });
}




document.addEventListener("DOMContentLoaded", function () {
  const botonesAgregar = document.querySelectorAll(".agregar-carrito");

  console.log(botonesAgregar);
  console.log(agregarAlCarrito);

  botonesAgregar.forEach((boton) => {
    boton.addEventListener("click", agregarAlCarrito);
  });

  const carritoContainer = document.getElementById("lista-carrito");
  carritoContainer.addEventListener("click", eliminarDelCarrito);
  carritoContainer.addEventListener("click", (event) => {
    if (event.target.classList.contains("incrementar-btn")) {
      const index = Number(event.target.dataset.index);
      carrito[index].cantidad++;
      guardarCarritoEnLocalStorage();
      mostrarCarrito();
    } else if (event.target.classList.contains("decrementar-btn")) {
      const index = Number(event.target.dataset.index);
      if (carrito[index].cantidad > 1) {
        carrito[index].cantidad--;
        guardarCarritoEnLocalStorage();
        mostrarCarrito();
      }
    }
  });

  mostrarCarrito();
});

function eliminarDelCarrito(event) {
  if (event.target.classList.contains("eliminar-btn")) {
    const index = Number(event.target.dataset.index);
    carrito.splice(index, 1);
    guardarCarritoEnLocalStorage();
    mostrarCarrito();
  }
}

function calcularTotal() {
  const total = carrito.reduce(
    (acc, producto) => acc + producto.precio * producto.cantidad,
    0
  );
  const totalElement = document.getElementById("total");
  const totalFormateado = total.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  });
  totalElement.textContent = `Total: ${totalFormateado}`;
}

function guardarCarritoEnLocalStorage() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

document.addEventListener("DOMContentLoaded", function () {
  const productsSection = document.getElementById("products");
  let productos = []; 

  fetch("database/productos.json")
    .then((response) => response.json())
    .then((data) => {
      productos = data;  
      mostrarProductosFiltrados("todos", "todos");  
    })
    .catch((error) => console.error("Error al cargar el archivo JSON:", error));

  function mostrarProductosFiltrados(categoria, precio) {
    productsSection.innerHTML = "";

    productos.forEach((producto, index) => {
      if (
        (categoria === "todos" || producto.categoria === categoria) &&
        (precio === "todos" ||
          (precio === "menor-100000" && producto.precio < 100000) ||
          (precio === "100000-290000" &&
            producto.precio >= 100000 &&
            producto.precio <= 290000))
      ) {
        if (index % 4 === 0) {
          row = document.createElement("div");
          row.classList.add("row");
          productsSection.appendChild(row);
        }

        const col = document.createElement("div");
        col.classList.add("col", "mb-4");

        const precioFormateado = producto.precio.toLocaleString("es-AR", {
          style: "currency",
          currency: "ARS",
          minimumFractionDigits: 0,
        });

        col.innerHTML = `
          <div class="card">
            <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
            <div class="card-body">
              <h2 class="card-title">${producto.nombre}</h2>
              <p class="card-text">Precio: ${precioFormateado}</p>
              <input type="number" class="cantidad-input" id="cantidad-${index}" value="1" min="1" step="1">
              <button class="btn btn-primary agregar-carrito" data-index="${index}">Agregar al carrito</button>
            </div>
          </div>
        `;

        row.appendChild(col);
      }
    });

     const botonesAgregar = document.querySelectorAll(".agregar-carrito");
    botonesAgregar.forEach((boton) => {
      boton.addEventListener("click", agregarAlCarrito);
    });
  }

  const filtroCategoria = document.getElementById("filtro-categoria");
  const filtroPrecio = document.getElementById("filtro-precio");

  filtroCategoria.addEventListener("change", function () {
    const categoriaSeleccionada = filtroCategoria.value;
    const precioSeleccionado = filtroPrecio.value;
    mostrarProductosFiltrados(categoriaSeleccionada, precioSeleccionado);
  });

  filtroPrecio.addEventListener("change", function () {
    const categoriaSeleccionada = filtroCategoria.value;
    const precioSeleccionado = filtroPrecio.value;
    mostrarProductosFiltrados(categoriaSeleccionada, precioSeleccionado);
  });
});


function pagarPedido() {
  if (carrito.length === 0) {
    Swal.fire({
      icon: "error",
      title: "Carrito vacío",
      text: "Por favor, agrega productos al carrito antes de confirmar el pedido.",
    });
    return;
  }

  Swal.fire({
    title: "Datos de envío",
    html: `
            <div class="container-fluid delivery">
                <div class="row">
                    <div class="col-sm">
                        Nombre:
                        <input type="text" class="campoNumerico" id="nombre" placeholder="Nombre">
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm">
                        Apellido:
                        <input type="text" class="campoNumerico" id="apellido" placeholder="Apellido">
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm">
                        Mail:
                        <input type="text" class="campoNumerico" id="mail" placeholder="Mail">
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm">
                        Dirección:
                        <input type="text" class="campoNumerico" id="direccion" placeholder="Dirección">
                    </div>
                </div>
            </div>
        `,
    showCancelButton: true,
    confirmButtonText: "FINALIZAR PEDIDO",
    cancelButtonText: "CANCELAR",
    showCloseButton: true,
    preConfirm: () => {
      const nombre = document.getElementById("nombre").value;
      const apellido = document.getElementById("apellido").value;
      const mail = document.getElementById("mail").value;
      const direccion = document.getElementById("direccion").value;

      if (!nombre || !apellido || !mail || !direccion) {
        Swal.showValidationMessage(
          "Por favor complete todos los campos para finalizar el pedido."
        );
        return false;
      }

      if (!mail.includes("@")) {
        Swal.showValidationMessage(
          'El correo electrónico debe contener al menos un carácter "@"'
        );
        return false;
      }

      carrito = [];
      guardarCarritoEnLocalStorage();
      mostrarCarrito();

      Swal.fire({
        title: "Gracias por su compra",
        timer: 3000,
        onClose: () => {
          window.location.href = "index.html";
        },
      });
    },
  });
}

function eliminarPedido() {
  Swal.fire({
    title: "Eliminar Pedido",
    text: "¿Está seguro de que desea eliminar todos los productos del carrito?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    dangerMode: true,
  }).then((result) => {
    if (result.isConfirmed) {
      carrito = [];
      guardarCarritoEnLocalStorage();
      mostrarCarrito();
      Swal.fire(
        "Eliminado",
        "Todos los productos han sido eliminados del carrito.",
        "success"
      );
    }
  });
}
