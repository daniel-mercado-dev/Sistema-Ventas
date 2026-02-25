let modoOferta = false;
let seleccionados = [];
let precioOferta = 0;
let nombreOferta = "";
let cuentaMesa = [];
let limiteSabores = 0; /
let ventasDelDia = JSON.parse(localStorage.getItem('ventasDelDia')) || [];

function activarOferta(precio, nombre) {
    modoOferta = true;
    seleccionados = [];
    precioOferta = precio;
    nombreOferta = nombre;

    
    const match = nombre.match(/\d+/);
    limiteSabores = match ? parseInt(match[0]) : 3;

    let selector = "";
    
    if (nombre.includes('13') ) {
        selector = '.btn-pastel';
    } else {
        selector = '.btn-maza'; 
    }

    const botones = document.querySelectorAll(selector);
    botones.forEach(btn => btn.classList.add('vibrar-ahora'));
  

    
    const panel = document.getElementById('notificacion-flotante'); const texto = document.getElementById('texto-progreso');
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

    const radioMesa = document.getElementById('modoLlevar');
    if (radioMesa) radioMesa.checked = true;

    document.querySelectorAll('.vibrar-ahora').forEach(btn => {
        btn.classList.remove('vibrar-ahora');
    });


    const panel = document.getElementById('notificacion-flotante');
    if (panel) panel.style.display = "none";

    console.log("Oferta cancelada por el usuario");
}


function actualizarVistaMesa() {
    const contenedor = document.getElementById('lista-productos');
    const totalTxt = document.getElementById('total-cuenta');

    if (!contenedor || !totalTxt) return;

    contenedor.innerHTML = "";
    let total = 0;

    cuentaMesa.forEach((item, index) => {
        total += item.precio;

       
        const esOferta = /3x6|3x7|3x12|3x13|PROMO/i.test(item.nombre);

       
        const precioEtiqueta = esOferta ? `(Pack)` : `S/ ${item.precio.toFixed(2)}`;

       
        let nombreLimpio = item.nombre.replace(/S\/\s?\d+(\.\d+)?/g, "").trim();
        const nombreFormateado = nombreLimpio.includes(" + ")
            ? nombreLimpio.replace(/\s\+\s/g, '<br>• ')
            : nombreLimpio;

        
        contenedor.innerHTML += `
        <div class="item-fila" style="border-left: 4px solid ${esOferta ? '#3b82f6' : '#10b981'}; background: #1e293b; margin-bottom: 8px; padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
            <div class="item-info" style="flex: 1;">
                <span style="color: #ffffff; font-weight: 800; font-size: 13px; display: block;">${nombreFormateado}</span>
                <small style="color: #64748b; font-size: 10px;">${esOferta ? '🔖 PROMO' : '🍨 SIMPLE'}</small>
            </div>
            <div style="text-align: right; margin-right: 10px;">
                <span style="color: ${esOferta ? '#94a3b8' : '#10b981'}; font-weight: 900;">${precioEtiqueta}</span>
            </div>
            <button class="btn-eliminar" onclick="eliminarProducto(${index})" style="background: none; border: none; cursor: pointer; font-size: 16px;">🗑️</button>
        </div>`;
    });

    
    window.detalleTicketActual = cuentaMesa.map(item => {
        const esOferta = /3x6|3x7|3x12|3x13|PROMO/i.test(item.nombre);
        return esOferta
            ? item.nombre.toUpperCase()
            : `${item.nombre.toUpperCase()} (S/ ${item.precio.toFixed(2)})`;
    }).join(" + ");


    totalTxt.innerText = `Total: S/ ${total.toFixed(2)}`;
}
async function cobrarMesaCompleta() {
    if (cuentaMesa.length === 0) return alert("La mesa está vacía");
    let total = cuentaMesa.reduce((sum, item) => sum + item.precio, 0);
    let metodoElegido = document.getElementById('metodoPago').value;

    
    let detalleParaConfirmar = cuentaMesa.map(i => `${i.nombre}`).join("\n");

    if (confirm(`¿COBRAR?\n\n${detalleParaConfirmar}\n\nTOTAL: S/ ${total.toFixed(2)}`)) {

        
        const nuevaVenta = {
            total: total,
            metodo: metodoElegido,
            fecha: new Date().toISOString()
        };
        ventasDelDia.push(nuevaVenta);
        localStorage.setItem('ventasDelDia', JSON.stringify(ventasDelDia));

       
        const resultado = await enviarAPI(window.detalleTicketActual, total, 1, "Venta"); 

        if (resultado) {
             console.log("Impresión enviada con éxito");
        }

       
        cuentaMesa = [];
        actualizarVistaMesa();
        alert(`✅ Venta guardada e impresa (S/ ${total.toFixed(2)})`);
    }
}


async function enviarAPI(sabor, precio, cantidad, promocion) {
    const elMetodo = document.getElementById('metodoPago');
    const metodoElegido = elMetodo ? elMetodo.value : "Efectivo";


    const saborFinal = sabor || "Producto sin nombre";

    const datos = {
        Sabor: String(saborFinal),
        Precio: parseFloat(precio) || 0,
        Cantidad: parseInt(cantidad) || 1,
        Promocion: String(promocion) || "Venta",
        MetodoPago: metodoElegido
    };

    console.log("Enviando estos datos a la API:", datos); 

    try {
        const response = await fetch("https://localhost:7000/api/Tickets/imprimir", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        if (!response.ok) {
            
            const errorDetalle = await response.text();
            console.error("Error del servidor C#:", errorDetalle);
        }

        return response.ok;
    } catch (error) {
        console.error("Error de conexión (¿Está abierta la API?):", error);
        return false;
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

function gestionarMaza(sabor) {
    if (!modoOferta) {
        
        agregarConTipo(sabor, 2.50);
    } else {
      
        seleccionados.push(sabor);

        const panel = document.getElementById('notificacion-flotante');
        const texto = document.getElementById('texto-progreso');
        const barra = document.getElementById('barra-progreso');

        panel.style.display = "block";

        let porcentaje = (seleccionados.length / limiteSabores) * 100;
        barra.style.width = porcentaje + "%";

       
        let faltan = limiteSabores - seleccionados.length;
        texto.innerHTML = `Agregado: <b>${sabor}</b><br>Llevas ${seleccionados.length} de ${limiteSabores} (Faltan ${faltan})`;

        if (seleccionados.length === limiteSabores) {
            
            const esParaLlevar = document.getElementById('modoLlevar').checked;
            const destino = esParaLlevar ? "LLEVAR" : "MESA";

           
            const detalleOferta = `[${destino}] OFERTA ${nombreOferta}: ${seleccionados.join(" + ")}`;

            cuentaMesa.push({
                nombre: detalleOferta,
                precio: parseFloat(precioOferta)
            });

         
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






function mostrarNotificacion(mensaje, tipo = 'info') {
    
    console.log(`${tipo.toUpperCase()}: ${mensaje}`);

   
    const aviso = document.getElementById('aviso-oferta');
    if (aviso) {
        aviso.style.display = "block";
        aviso.innerText = mensaje;
        setTimeout(() => { aviso.style.display = "none"; }, 3000);
    }
}

function agregarConTipo(nombreProducto, precio, idSelect = null) {
    
    const rbLlevar = document.getElementById('modoLlevar');
    const destino = (rbLlevar && rbLlevar.checked) ? "LLEVAR" : "MESA";

    let nombreFinal = "";

  
    if (idSelect) {
        const selector = document.getElementById(idSelect);
       
        const saborSeleccionado = selector.options[selector.selectedIndex].text;
        nombreFinal = `[${destino}] ${saborSeleccionado}`;
    } else {
        nombreFinal = `[${destino}] ${nombreProducto}`;
    }

 
    cuentaMesa.push({
        nombre: nombreFinal,
        precio: parseFloat(precio)
    });

    
    actualizarVistaMesa();
}

function agregarOfertaEspecial(precio, nombreOferta) {
    const esParaLlevar = document.getElementById('modoLlevar').checked;
    const destino = esParaLlevar ? "LLEVAR" : "MESA";
    const sabor = document.getElementById('saborMesa').value;

   
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

   
    document.getElementById('contador').innerText = saboresSeleccionados.length;

    if (saboresSeleccionados.length === 3) {
        finalizarOferta();
    }
}

function finalizarOferta() {
    const esParaLlevar = document.getElementById('modoLlevar').checked;
    const destino = esParaLlevar ? "LLEVAR" : "MESA";

    
    const detalleSabores = saboresSeleccionados.join(" + ");
    const nombreFinal = `[${destino}] PROMO ${nombrePromoActiva}: ${saboresSeleccionados.join(" + ")}`;

    cuentaMesa.push({
        nombre: nombreFinal,
        precio: parseFloat(precioPromoActiva)
    });


    document.getElementById('aviso-oferta').style.display = "none";
    nombrePromoActiva = "";
    saboresSeleccionados = [];

    actualizarVistaMesa();
}

function eliminarProducto(index) {
    
    const producto = cuentaMesa[index];
    if (confirm(`¿Eliminar "${producto.nombre}" de la cuenta?`)) {
        cuentaMesa.splice(index, 1);
        actualizarVistaMesa(); 
    }
}

function agregarVentaLibre() {
    
    let nombre = prompt("¿Qué producto desea agregar?", "Varios / Extra");

   
    if (nombre === null || nombre.trim() === "") return;

    
    let precioInput = prompt("Ingrese el precio (Ejemplo: 8.00 o 0.50):", "0.00");
    let precio = parseFloat(precioInput);


    if (isNaN(precio) || precio < 0) {
        alert("Por favor, ingrese un precio válido (solo números).");
        return;
    }

    agregarConTipo(nombre, precio);
}

function gestionarPastel(nombre, precioIndividual) {
    if (!modoOferta) {
        
        agregarConTipo(nombre, precioIndividual);
    } else {
       
        seleccionados.push(nombre);

        const panel = document.getElementById('notificacion-flotante');
        const texto = document.getElementById('texto-progreso');
        const barra = document.getElementById('barra-progreso');

        
        let porcentaje = (seleccionados.length / limiteSabores) * 100;
        if (barra) barra.style.width = porcentaje + "%";

        let faltan = limiteSabores - seleccionados.length;
        if (texto) {
            texto.innerHTML = `Pastel: <b>${nombre}</b> añadido<br>Llevas ${seleccionados.length} de ${limiteSabores} (Faltan ${faltan})`;
        }

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
        cuentaMesa = [];
        actualizarVistaMesa();
    }
}

function verAuditoria() {
    const pinMaestro = "2025";
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
