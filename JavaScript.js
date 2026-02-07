let modoOferta = false;
let seleccionados = [];
let precioOferta = 0;
let nombreOferta = "";
let cuentaMesa = [];
let limiteSabores = 0;
let ventasDelDia = JSON.parse(localStorage.getItem('ventasDelDia')) || [];

// --- GESTIÓN DE MESA ---

function actualizarVistaMesa() {
    const contenedor = document.getElementById('lista-productos');
    const totalTxt = document.getElementById('total-cuenta');
    if (!contenedor) return;
    contenedor.innerHTML = "";

    let total = 0;
    cuentaMesa.forEach((item, index) => {
        total += item.precio;
        let nombreSinPrecio = item.nombre.replace(/S\/\s?\d+(\.\d+)?/g, "").trim();
        const nombreFormateado = nombreSinPrecio.replace(/\s\+\s/g, '<br>• ');

        contenedor.innerHTML += `
            <div class="item-fila" style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee;">
                <div style="text-align: left; flex: 1;">${nombreFormateado}</div>
                <div style="min-width: 80px; text-align: right; font-weight: bold; color: #27ae60;">S/ ${item.precio.toFixed(2)}</div>
                <button onclick="eliminarProducto(${index})" style="margin-left: 10px; background: #e74c3c; color: white; border: none; padding: 5px; border-radius: 4px;">🗑️</button>
            </div>`;
    });
    totalTxt.innerText = `Total: S/ ${total.toFixed(2)}`;
}

async function cobrarMesaCompleta() {
    if (cuentaMesa.length === 0) return alert("La mesa está vacía");
    let total = cuentaMesa.reduce((sum, item) => sum + item.precio, 0);
    let elMetodo = document.getElementById('metodoPago');
    let metodoElegido = elMetodo ? elMetodo.value : "Efectivo";
    let detalleResumen = cuentaMesa.map(i => i.nombre).join("\n");

    if (confirm(`¿COBRAR?\n\n${detalleResumen}\n\nTOTAL: S/ ${total.toFixed(2)}`)) {
        // Guardar venta localmente
        const nuevaVenta = { total, metodo: metodoElegido, fecha: new Date().toISOString() };
        ventasDelDia.push(nuevaVenta);
        localStorage.setItem('ventasDelDia', JSON.stringify(ventasDelDia));

        // ENVIAR A LA IMPRESORA
        await enviarAPI(detalleResumen, total, 1, "Venta");

        // Limpiar mesa
        cuentaMesa = [];
        actualizarVistaMesa();
        alert(`✅ Venta procesada e impresión enviada.`);
    }
}

async function enviarAPI(sabor, precio, cantidad, promocion) {
    const elMetodo = document.getElementById('metodoPago');
    const metodoElegido = elMetodo ? elMetodo.value : "Efectivo";

    const datos = {
        Sabor: sabor,
        Precio: parseFloat(precio),
        Cantidad: parseInt(cantidad),
        Promocion: promocion || "",
        MetodoPago: metodoElegido
    };

    try {
        await fetch("http://127.0.0.1:7000/api/Tickets/imprimir", {
            method: 'POST',
            mode: 'no-cors', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        return true; 
    } catch (error) {
        console.error("Error de impresión:", error);
        return false;
    }
}

function gestionarMaza(sabor) {
    if (!modoOferta) {
        agregarConTipo(sabor, 2.50);
    } else {
        seleccionados.push(sabor);
        const panel = document.getElementById('notificacion-flotante');
        const texto = document.getElementById('texto-progreso');
        const barra = document.getElementById('barra-progreso');

        let porcentaje = (seleccionados.length / limiteSabores) * 100;
        if (barra) barra.style.width = porcentaje + "%";
        if (texto) texto.innerHTML = `Llevas ${seleccionados.length} de ${limiteSabores}`;

        if (seleccionados.length === limiteSabores) {
            agregarConTipo(`OFERTA ${nombreOferta}: ${seleccionados.join(" + ")}`, precioOferta);
            setTimeout(() => {
                if (panel) panel.style.display = "none";
                cancelarOferta();
            }, 800);
        }
    }
}

function agregarConTipo(nombreProducto, precio) {
    const rbLlevar = document.getElementById('modoLlevar');
    const destino = (rbLlevar && rbLlevar.checked) ? "LLEVAR" : "MESA";
    cuentaMesa.push({
        nombre: `[${destino}] ${nombreProducto}`,
        precio: parseFloat(precio)
    });
    actualizarVistaMesa();
}

function activarOferta(precio, nombre) {
    modoOferta = true;
    seleccionados = [];
    precioOferta = precio;
    nombreOferta = nombre;
    const match = nombre.match(/\d+/);
    limiteSabores = match ? parseInt(match[0]) : 3;

    const panel = document.getElementById('notificacion-flotante');
    if (panel) panel.style.display = "block";
    
    document.querySelectorAll('.btn-maza, .btn-pastel').forEach(btn => btn.classList.add('vibrar-ahora'));
}

function cancelarOferta() {
    modoOferta = false;
    seleccionados = [];
    document.querySelectorAll('.vibrar-ahora').forEach(btn => btn.classList.remove('vibrar-ahora'));
    const panel = document.getElementById('notificacion-flotante');
    if (panel) panel.style.display = "none";
}

function eliminarProducto(index) {
    cuentaMesa.splice(index, 1);
    actualizarVistaMesa();
}

function agregarVentaLibre() {
    let nombre = prompt("¿Qué producto?", "Varios");
    if (!nombre) return;
    let precio = parseFloat(prompt("Precio:", "0.00"));
    if (!isNaN(precio)) agregarConTipo(nombre, precio);
}