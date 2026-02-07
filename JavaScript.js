let modoOferta = false;
let seleccionados = [];
let precioOferta = 0;
let nombreOferta = "";
let cuentaMesa = [];
let limiteSabores = 0;
let ventasDelDia = JSON.parse(localStorage.getItem('ventasDelDia')) || [];

// --- GESTIÓN DE MESA ---

function activarOferta(precio, nombre) {
    modoOferta = true;
    seleccionados = [];
    precioOferta = precio;
    nombreOferta = nombre;
    const match = nombre.match(/\d+/);
    limiteSabores = match ? parseInt(match[0]) : 3;

    let selector = nombre.includes('13') ? '.btn-pastel' : '.btn-maza';
    document.querySelectorAll(selector).forEach(btn => btn.classList.add('vibrar-ahora'));

    const panel = document.getElementById('notificacion-flotante');
    const texto = document.getElementById('texto-progreso');
    const barra = document.getElementById('barra-progreso');

    if (panel) panel.style.display = "block";
    if (texto) texto.innerHTML = `Selecciona <b>${limiteSabores}</b> sabores...`;
    if (barra) barra.style.width = "0%";

    const rbLlevar = document.getElementById('modoLlevar');
    if (rbLlevar) rbLlevar.checked = true;
}

function cancelarOferta() {
    modoOferta = false;
    seleccionados = [];
    document.querySelectorAll('.vibrar-ahora').forEach(btn => btn.classList.remove('vibrar-ahora'));
    const panel = document.getElementById('notificacion-flotante');
    if (panel) panel.style.display = "none";
}

function actualizarVistaMesa() {
    const contenedor = document.getElementById('lista-productos');
    const totalTxt = document.getElementById('total-cuenta');
    if (!contenedor) return;
    contenedor.innerHTML = "";

    let total = 0;
    cuentaMesa.forEach((item, index) => {
        total += item.precio;
        const esOferta = /3x6|3x7|3x12|PROMO/i.test(item.nombre);
        let nombreSinPrecio = item.nombre.replace(/S\/\s?\d+(\.\d+)?/g, "").trim();
        const precioAMostrar = esOferta ? "" : `S/ ${item.precio.toFixed(2)}`;
        const nombreFormateado = nombreSinPrecio.replace(/\s\+\s/g, '<br>• ');

        contenedor.innerHTML += `
            <div class="item-fila" style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee;">
                <div style="text-align: left; flex: 1;">${nombreFormateado}</div>
                <div style="min-width: 80px; text-align: right; font-weight: bold; color: #27ae60;">${precioAMostrar}</div>
                <button onclick="eliminarProducto(${index})" style="margin-left: 10px; background: #e74c3c; color: white; border: none; padding: 5px; border-radius: 4px;">🗑️</button>
            </div>`;
    });
    totalTxt.innerText = `Total: S/ ${total.toFixed(2)}`;
}

async function cobrarMesaCompleta() {
    if (cuentaMesa.length === 0) return alert("La mesa está vacía");
    let total = cuentaMesa.reduce((sum, item) => sum + item.precio, 0);
    let metodoElegido = document.getElementById('metodoPago').value;
    let detalleResumen = cuentaMesa.map(i => i.nombre).join("\n");

    if (confirm(`¿COBRAR?\n\n${detalleResumen}\n\nTOTAL: S/ ${total.toFixed(2)}`)) {
        const nuevaVenta = { total, metodo: metodoElegido, fecha: new Date().toISOString() };
        ventasDelDia.push(nuevaVenta);
        localStorage.setItem('ventasDelDia', JSON.stringify(ventasDelDia));

        await enviarAPI(detalleResumen, total, 1, "Venta");

        cuentaMesa = [];
        actualizarVistaMesa();
        alert(`✅ Venta guardada y enviada a imprimir`);
    }
}

// --- COMUNICACIÓN CON API (TICKETERA) ---

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

// --- FUNCIONES DE AGREGAR PRODUCTOS ---

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
        if (texto) texto.innerHTML = `Agregado: <b>${sabor}</b><br>Llevas ${seleccionados.length} de ${limiteSabores}`;

        if (seleccionados.length === limiteSabores) {
            const rbLlevar = document.getElementById('modoLlevar');
            const destino = (rbLlevar && rbLlevar.checked) ? "LLEVAR" : "MESA";
            cuentaMesa.push({
                nombre: `[${destino}] OFERTA ${nombreOferta}: ${seleccionados.join(" + ")}`,
                precio: parseFloat(precioOferta)
            });
            setTimeout(() => {
                if (panel) panel.style.display = "none";
                cancelarOferta();
                actualizarVistaMesa();
            }, 800);
        }
    }
}

function gestionarPastel(nombre, precioIndividual) {
    if (!modoOferta) {
        agregarConTipo(nombre, precioIndividual);
    } else {
        seleccionados.push(nombre);
        const panel = document.getElementById('notificacion-flotante');
        const texto = document.getElementById('texto-progreso');
        if (texto) texto.innerHTML = `Pastel: <b>${nombre}</b> añadido<br>${seleccionados.length} de ${limiteSabores}`;

        if (seleccionados.length === limiteSabores) {
            const rbLlevar = document.getElementById('modoLlevar');
            const destino = (rbLlevar && rbLlevar.checked) ? "LLEVAR" : "MESA";
            cuentaMesa.push({
                nombre: `[${destino}] OFERTA ${nombreOferta}: ${seleccionados.join(" + ")}`,
                precio: parseFloat(precioOferta)
            });
            setTimeout(() => {
                if (panel) panel.style.display = "none";
                cancelarOferta();
                actualizarVistaMesa();
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

function eliminarProducto(index) {
    cuentaMesa.splice(index, 1);
    actualizarVistaMesa();
}

function agregarVentaLibre() {
    let nombre = prompt("¿Qué producto desea agregar?", "Varios");
    if (!nombre) return;
    let precio = parseFloat(prompt("Ingrese el precio:", "0.00"));
    if (isNaN(precio)) return;
    agregarConTipo(nombre, precio);
}

function generarCierreCaja() {
    let efectivo = 0, yape = 0, total = 0;
    ventasDelDia.forEach(v => {
        if (v.metodo === "Efectivo") efectivo += v.total;
        else yape += v.total;
        total += v.total;
    });
    alert(`CIERRE DE CAJA\nEfectivo: S/ ${efectivo.toFixed(2)}\nYape: S/ ${yape.toFixed(2)}\nTotal: S/ ${total.toFixed(2)}`);
}

function reiniciarDia() {
    if (prompt("PIN de administrador:") === "123") {
        ventasDelDia = [];
        localStorage.removeItem('ventasDelDia');
        location.reload();
    }
}