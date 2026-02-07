let modoOferta = false;
let seleccionados = [];
let precioOferta = 0;
let nombreOferta = "";
let cuentaMesa = [];
let limiteSabores = 0; // Nueva variable para saber cuántos clics esperar
// Carga las ventas del día desde la memoria del navegador o inicia una lista vacía
let ventasDelDia = JSON.parse(localStorage.getItem('ventasDelDia')) || [];

// --- GESTIÓN DE MESA ---

function activarOferta(precio, nombre) {
    modoOferta = true;
    seleccionados = [];
    precioOferta = precio;
    nombreOferta = nombre;

    // Extraemos el número (ej: de "3x6" saca el 3)
    const match = nombre.match(/\d+/);
    limiteSabores = match ? parseInt(match[0]) : 3;

    //--------------
    // --- AQUÍ ACTIVAMOS LA VIBRACIÓN ---
    let selector = "";
    // Si la oferta tiene "13", "7" u "8", es para pasteles
    if (nombre.includes('13') ) {
        selector = '.btn-pastel';
    } else {
        selector = '.btn-maza'; // Si no, es para mazamorras
    }

    const botones = document.querySelectorAll(selector);
    botones.forEach(btn => btn.classList.add('vibrar-ahora'));
    // ------------------------------------

    //-------------


    // Mostrar notificación vacía al empezar
    const panel = document.getElementById('notificacion-flotante'); const texto = document.getElementById('texto-progreso');
    const barra = document.getElementById('barra-progreso');

    if (panel) panel.style.display = "block";
    if (texto) texto.innerHTML = `Selecciona <b>${limiteSabores}</b> sabores...`;
    if (barra) barra.style.width = "0%";

    // Cambiamos a "Para llevar" por defecto en ofertas
    const rbLlevar = document.getElementById('modoLlevar');
    if (rbLlevar) rbLlevar.checked = true;
}

function cancelarOferta() {
    modoOferta = false;

    // 2. Vaciamos la lista de lo que se estaba acumulando
    seleccionados = [];

    const radioMesa = document.getElementById('modoLlevar');
    if (radioMesa) radioMesa.checked = true;

    document.querySelectorAll('.vibrar-ahora').forEach(btn => {
        btn.classList.remove('vibrar-ahora');
    });

    // 5. Escondemos el panel de alerta
    const panel = document.getElementById('notificacion-flotante');
    if (panel) panel.style.display = "none";

    console.log("Oferta cancelada por el usuario");
}


function actualizarVistaMesa() {
    const contenedor = document.getElementById('lista-productos');
    const totalTxt = document.getElementById('total-cuenta');
    contenedor.innerHTML = "";

    let total = 0;
    cuentaMesa.forEach((item, index) => {
        total += item.precio;

        const esOferta = /3x6|3x7|3x12|PROMO/i.test(item.nombre);

        // Limpiamos el nombre de cualquier precio que se haya guardado en el string
        let nombreSinPrecio = item.nombre.replace(/S\/\s?\d+(\.\d+)?/g, "").trim();

        const precioAMostrar = esOferta ? "" : `S/ ${item.precio.toFixed(2)}`;

        const nombreFormateado = nombreSinPrecio.includes(" + ")
            ? nombreSinPrecio.replace(/\s\+\s/g, '<br>• ')
            : nombreSinPrecio;

        contenedor.innerHTML += `
            <div class="item-fila" style="display: flex; justify-content: space-between; align-items: flex-start; padding: 10px; border-bottom: 1px solid #eee;">
                <div class="item-info" style="text-align: left; flex: 1; font-size: 14px; line-height: 1.4;">
                    ${nombreFormateado}
                </div>
                <div class="item-precio" style="min-width: 80px; text-align: right; font-weight: bold; color: #27ae60;">
                    ${precioAMostrar} 
                </div>
                <button class="btn-eliminar" onclick="eliminarProducto(${index})" style="margin-left: 10px; background: #e74c3c; color: white; border: none; padding: 5px; border-radius: 4px; cursor: pointer;">
                    🗑️
                </button>
            </div>
        `;
    });
    totalTxt.innerText = `Total: S/ ${total.toFixed(2)}`;
}   

async function cobrarMesaCompleta() {
    if (cuentaMesa.length === 0) return alert("La mesa está vacía");
    let total = cuentaMesa.reduce((sum, item) => sum + item.precio, 0);
    let metodoElegido = document.getElementById('metodoPago').value;

    // 1. GENERAMOS EL TEXTO PARA EL MENSAJE DE CONFIRMACIÓN (Pero no para la impresora)
    let detalleResumen = cuentaMesa.map(i => `${i.nombre}`).join("\n");

    // 2. CONFIRMACIÓN EN PANTALLA
    if (confirm(`¿COBRAR?\n\n${detalleResumen}\n\nTOTAL: S/ ${total.toFixed(2)}`)) {

        // --- GUARDAR PARA CIERRE DE CAJA ---
        const nuevaVenta = {
            total: total,
            metodo: metodoElegido,
            fecha: new Date().toISOString()
        };
        ventasDelDia.push(nuevaVenta);
        localStorage.setItem('ventasDelDia', JSON.stringify(ventasDelDia));
        // -----------------------------------

        // 3. COMENTAMOS TODO EL ENVÍO A LA API E IMPRESIÓN
         const resultado = await enviarAPI(detalleResumen, total, 1, "Venta");
        if (resultado && resultado.success) {
             console.log("Impresión exitosa");
        }
        

        // 4. LIMPIEZA DE MESA (Esto DEBE quedar afuera para que la mesa se limpie)
        cuentaMesa = [];
        actualizarVistaMesa();
        alert(`✅ Venta guardada en Reporte Azul (S/ ${total.toFixed(2)})`);
    }
}

async function vender() {
    const elSabor = document.getElementById('saborMazamorra');
    const elPrecio = document.getElementById('precioMazamorra');

    if (!elSabor || !elPrecio) return console.warn("Faltan elementos en el HTML para vender.");

    const sabor = elSabor.value;
    const precio = elPrecio.value;

    if (confirm(`¿Procesar pedido de ${sabor} por S/ ${precio}?`)) {
        await enviarAPI(sabor, precio, 1, "Atención en Mesa");
    
    }
}
//--------------------------------------------------------


function gestionarMaza(sabor) {
    if (!modoOferta) {
        // Si no es oferta, agregamos como individual normal-
        agregarConTipo(sabor, 2.50);
    } else {
        // 1. Agregamos el sabor al array
        seleccionados.push(sabor);

        const panel = document.getElementById('notificacion-flotante');
        const texto = document.getElementById('texto-progreso');
        const barra = document.getElementById('barra-progreso');

        panel.style.display = "block";

        let porcentaje = (seleccionados.length / limiteSabores) * 100;
        barra.style.width = porcentaje + "%";

        // 2. Actualizamos el contador visual si existe
        //const contador = document.getElementById('contador');
        //if (contador) contador.innerText = seleccionados.length;

        // --- NUEVA LÓGICA DE ALERTAS ---
        let faltan = limiteSabores - seleccionados.length;
        texto.innerHTML = `Agregado: <b>${sabor}</b><br>Llevas ${seleccionados.length} de ${limiteSabores} (Faltan ${faltan})`;

        if (seleccionados.length === limiteSabores) {
            // ALERTA: Avisa cuánto falta
            //alert(`✅ Sabor: ${sabor} añadido.\nLlevas: ${seleccionados.length} de ${limiteSabores}.\n¡Te faltan ${faltan}!`);
        
            // 3. CUANDO SE COMPLETA LA CANTIDAD (Sea 2, 3, 4, etc.)
            const esParaLlevar = document.getElementById('modoLlevar').checked;
            const destino = esParaLlevar ? "LLEVAR" : "MESA";

            // FORMATO: [DESTINO] OFERTA 3x6: Sabor1 + Sabor2 + Sabor3
            const detalleOferta = `[${destino}] OFERTA ${nombreOferta}: ${seleccionados.join(" + ")}`;

            cuentaMesa.push({
                nombre: detalleOferta,
                precio: parseFloat(precioOferta)
            });

            // Al finalizar, ocultamos el panel después de un segundo
            texto.innerHTML = "✨ ¡Oferta completada!";
            setTimeout(() => {
                panel.style.display = "none";
                barra.style.width = "0%";
            }, 1000);

            actualizarVistaMesa();
            cancelarOferta();
        }
    }
}




// --- COMUNICACIÓN CON API ---

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
        const response = await fetch("http://127.0.0.1:7000/api/Tickets/imprimir", {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        return response.ok;
    } catch (error) {
        console.error("Error de conexión con la API:", error);
        return false;
    }
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    // Si no tienes el CSS de toast, esto al menos saldrá en consola
    // pero lo ideal es que usemos un alert pequeño o el cuadro de texto
    console.log(`${tipo.toUpperCase()}: ${mensaje}`);

    // Si prefieres usar un aviso simple mientras arreglas el CSS:
    const aviso = document.getElementById('aviso-oferta');
    if (aviso) {
        aviso.style.display = "block";
        aviso.innerText = mensaje;
        setTimeout(() => { aviso.style.display = "none"; }, 3000);
    }
}

function agregarConTipo(nombreProducto, precio, idSelect = null) {
    // 1. CAPTURAR EL DESTINO EN EL MOMENTO DEL CLIC
    const rbLlevar = document.getElementById('modoLlevar');
    const destino = (rbLlevar && rbLlevar.checked) ? "LLEVAR" : "MESA";

    let nombreFinal = "";

    // 2. DETERMINAR EL NOMBRE DEL PRODUCTO
    if (idSelect) {
        const selector = document.getElementById(idSelect);
        // Usamos .text para que salga el nombre completo de la opción
        const saborSeleccionado = selector.options[selector.selectedIndex].text;
        nombreFinal = `[${destino}] ${saborSeleccionado}`;
    } else {
        nombreFinal = `[${destino}] ${nombreProducto}`;
    }

    // 3. AGREGAR A LA LISTA
    cuentaMesa.push({
        nombre: nombreFinal,
        precio: parseFloat(precio)
    });

    // 4. REFRESCAR LA PANTALLA
    actualizarVistaMesa();
}

function agregarOfertaEspecial(precio, nombreOferta) {
    const esParaLlevar = document.getElementById('modoLlevar').checked;
    const destino = esParaLlevar ? "LLEVAR" : "MESA";
    const sabor = document.getElementById('saborMesa').value;

    // Guardamos la oferta indicando el sabor base y que es una promo
    const nombreFinal = `[${destino}] PROMO ${nombreOferta} (${sabor})`;

    cuentaMesa.push({
        nombre: nombreFinal,
        precio: parseFloat(precio)
    });

    actualizarVistaMesa();
}

let saboresSeleccionados = [];
let precioPromoActiva = 0;
let nombrePromoActiva = "";


function agregarSaborAOferta() {
    if (nombrePromoActiva === "") {
        alert("Primero selecciona una OFERTA (3x6, 3x7, etc.)");
        return;
    }

    const sabor = document.getElementById('saborMesa').value;
    saboresSeleccionados.push(sabor);

    // Actualizamos el contador visual
    document.getElementById('contador').innerText = saboresSeleccionados.length;

    if (saboresSeleccionados.length === 3) {
        finalizarOferta();
    }
}

function finalizarOferta() {
    const esParaLlevar = document.getElementById('modoLlevar').checked;
    const destino = esParaLlevar ? "LLEVAR" : "MESA";

    // Unimos los 3 sabores: "Morada + Arroz + Zambo"
    const detalleSabores = saboresSeleccionados.join(" + ");
    const nombreFinal = `[${destino}] PROMO ${nombrePromoActiva}: ${saboresSeleccionados.join(" + ")}`;

    cuentaMesa.push({
        nombre: nombreFinal,
        precio: parseFloat(precioPromoActiva)
    });

    // Limpiamos todo
    document.getElementById('aviso-oferta').style.display = "none";
    nombrePromoActiva = "";
    saboresSeleccionados = [];

    actualizarVistaMesa();
}

function eliminarProducto(index) {
    // Confirmamos antes de borrar para evitar clics accidentales
    const producto = cuentaMesa[index];
    if (confirm(`¿Eliminar "${producto.nombre}" de la cuenta?`)) {
        cuentaMesa.splice(index, 1); // Quita 1 elemento en esa posición
        actualizarVistaMesa(); // Refresca la pantalla y el total
    }
}

function agregarVentaLibre() {
    // 1. Preguntamos qué está vendiendo
    let nombre = prompt("¿Qué producto desea agregar?", "Varios / Extra");

    // Si cancela o deja vacío, no hace nada
    if (nombre === null || nombre.trim() === "") return;

    // 2. Preguntamos el precio
    let precioInput = prompt("Ingrese el precio (Ejemplo: 8.00 o 0.50):", "0.00");
    let precio = parseFloat(precioInput);

    // 3. Validamos que el precio sea un número válido
    if (isNaN(precio) || precio < 0) {
        alert("Por favor, ingrese un precio válido (solo números).");
        return;
    }

    // 4. Lo agregamos al pedido actual (tu lógica existente)
    // Usamos 'Varios' como destino si no hay ninguno seleccionado
    agregarConTipo(nombre, precio);
}

function gestionarPastel(nombre, precioIndividual) {
    if (!modoOferta) {
        // Si no hay promo activa, se vende al precio normal (S/3, S/5, etc.)
        agregarConTipo(nombre, precioIndividual);
    } else {
        // Si la promo 3x13 está activa, sumamos el pastel a la lista
        seleccionados.push(nombre);

        const panel = document.getElementById('notificacion-flotante');
        const texto = document.getElementById('texto-progreso');
        const barra = document.getElementById('barra-progreso');

        // Actualizamos la barra y el texto (usamos la misma lógica que en mazamorras)
        let porcentaje = (seleccionados.length / limiteSabores) * 100;
        if (barra) barra.style.width = porcentaje + "%";

        let faltan = limiteSabores - seleccionados.length;
        if (texto) {
            texto.innerHTML = `Pastel: <b>${nombre}</b> añadido<br>Llevas ${seleccionados.length} de ${limiteSabores} (Faltan ${faltan})`;
        }

        // Si se completan los 3 pasteles de la promo
        if (seleccionados.length === limiteSabores) {
            const rbLlevar = document.getElementById('modoLlevar');
            const destino = (rbLlevar && rbLlevar.checked) ? "LLEVAR" : "MESA";

            const detalleOferta = `[${destino}] OFERTA ${nombreOferta}: ${seleccionados.join(" + ")}`;

            cuentaMesa.push({
                nombre: detalleOferta,
                precio: parseFloat(precioOferta)
            });

            if (texto) texto.innerHTML = "✨ ¡Combo de pasteles listo!";
            
            setTimeout(() => {
                if (panel) panel.style.display = "none";
                cancelarOferta(); 
                actualizarVistaMesa();
            }, 800);
        }
    }
}
function generarCierreCaja() {
    if (ventasDelDia.length === 0) {
        alert("Aún no hay ventas registradas hoy.");
        return;
    }

    let efectivo = 0;
    let yape = 0;
    let total = 0;

    ventasDelDia.forEach(v => {
        if (v.metodo === "Efectivo") efectivo += v.total;
        else yape += v.total;
        total += v.total;
    });

    const reporteHtml = `
        <b>CIERRE DE CAJA</b><br>
        -----------------------<br>
        💵 EFECTIVO: S/ ${efectivo.toFixed(2)}<br>
        📱 YAPE/PLIN: S/ ${yape.toFixed(2)}<br>
        -----------------------<br>
        💰 TOTAL: S/ ${total.toFixed(2)}<br>
        -----------------------<br>
        🛒 VENTAS: ${ventasDelDia.length}
    `;

    document.getElementById('contenido-reporte').innerHTML = reporteHtml;
    document.getElementById('modal-cierre').style.display = 'flex';
}

function reiniciarDia() {
    // Definimos una clave (ejemplo: "1234")
    const claveMaestra = "123";

    let password = prompt("⚠️ ACCESO RESTRINGIDO. Ingrese el PIN de administrador para BORRAR el día:");

    if (password === claveMaestra) {
        if (confirm("¿Está absolutamente seguro de borrar todas las ventas del día? Esta acción no se puede deshacer.")) {
            ventasDelDia = [];
            localStorage.removeItem('ventasDelDia');
            location.reload();
        }
    } else if (password !== null) {
        alert("❌ PIN incorrecto. Acceso denegado.");
    }
}

function eliminarProducto(index) {
    const itemEliminado = cuentaMesa[index];

    // Guardamos qué se borró y a qué hora en un historial secreto
    let auditoria = JSON.parse(localStorage.getItem('auditoria_borrados')) || [];
    auditoria.push({
        producto: itemEliminado.nombre,
        precio: itemEliminado.precio,
        hora: new Date().toLocaleTimeString()
    });
    localStorage.setItem('auditoria_borrados', JSON.stringify(auditoria));

    cuentaMesa.splice(index, 1);
    actualizarVistaMesa();
}
function limpiarMesa() {
    if (confirm("⚠️ ¿BORRAR PEDIDO ACTUAL? Esta acción quedará registrada en el sistema.")) {
        // Opcional: registrar quién y cuándo limpió la mesa sin cobrar
        cuentaMesa = [];
        actualizarVistaMesa();
    }
}

function verAuditoria() {
    const pinMaestro = "2025"; // Tu clave
    let intento = prompt("Ingrese clave de DUEÑO:");

    if (intento === pinMaestro) {
        let borrados = JSON.parse(localStorage.getItem('auditoria_borrados')) || [];

        if (borrados.length === 0) {
            alert("No hay registros de productos eliminados hoy. ¡Todo en orden!");
            return;
        }

        let mensaje = "📋 PRODUCTOS ELIMINADOS DE LA LISTA:\n\n";
        borrados.forEach((item, i) => {
            mensaje += `${i + 1}. [${item.hora}] - ${item.producto} (S/ ${item.precio})\n`;
        });

        alert(mensaje);
    } else {
        alert("Acceso denegado.");
    }
}
