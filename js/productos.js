document.addEventListener("DOMContentLoaded", function () {
  const productsSection = document.getElementById("products");


  fetch("database/productos.json")
    .then((response) => response.json())
    .then((productos) => {
      let row;


      productos.forEach((producto, index) => {
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
      });


       const botonesAgregar = document.querySelectorAll(".agregar-carrito");
      botonesAgregar.forEach((boton) => {
        boton.addEventListener("click", agregarAlCarrito);
      });
    })
    .catch((error) => console.error("Error al cargar el archivo JSON:", error));
});


