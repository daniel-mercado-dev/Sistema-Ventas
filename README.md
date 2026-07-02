# 🥤 Sistema de Ventas & Ticketera POS - "Dulces Limeños Astrid"

Sistema comercial de extremo a extremo (Full-Stack) diseñado para la automatización operativa, control de inventarios y optimización del despacho en tiempo real para múltiples sucursales de un negocio gastronómico.

## 🚀 Arquitectura del Sistema
El proyecto está construido bajo una arquitectura limpia y modular en capas, separando responsabilidades para garantizar la escalabilidad del software y la persistencia segura de los datos comerciales.

*   **Frontend (Capa de Presentación):** Interfaz ágil e interactiva construida con HTML5, CSS3 y JavaScript nativo optimizado para pantallas táctiles de punto de venta, con soporte local para almacenamiento de reportes diarios.
*   **Backend (Capa de Negocio y API):** Desarrollado en **.NET Core / ASP.NET Core**, implementando Controladores asíncronos para la gestión de peticiones y lógica de negocio dinámica (como motores de ofertas y combos).
*   **Data (Capa de Persistencia):** Gestión de bases de datos relacionales con **Microsoft SQL Server**, utilizando **Entity Framework Core** como ORM y un flujo estricto de migraciones para el control de versiones de la base de datos.
*   **Services (Integración de Hardware):** Middleware especializado para la comunicación a bajo nivel con hardware periférico utilizando comandos binarios directos (`ESC/POS`) a través de la API nativa de Windows (`winspool.drv`), reduciendo los tiempos de impresión térmica de tickets de despacho a cero.

## 🛠️ Stack Tecnológico
*   **Lenguajes:** C# (.NET Core), JavaScript (ES6+), HTML5, CSS3, T-SQL.
*   **Frameworks & ORM:** ASP.NET Core Web API, Entity Framework Core.
*   **Base de Datos:** Microsoft SQL Server.
*   **Herramientas y Entornos:** Visual Studio, Git/GitHub, Postman.

## 📁 Estructura Principal del Proyecto
*   `/wwwroot`: Archivos estáticos del frontend (index.html, JS, CSS).
*   `/Controllers`: Endpoints de la API (`TicketsController.cs`, `InventarioController.cs`).
*   `/Data`: Contexto de la base de datos (`ApplicationDbContext.cs`).
*   `/Models`: Entidades de negocio (`VentaCabecera.cs`, `VentaDetalle.cs`, `Producto.cs`).
*   `/Services`: Lógica de integración de hardware (`TicketPrintingService.cs`).
*   `/Dtos`: Objetos de transferencia de datos seguros para el intercambio API-Cliente.

## ⚙️ Instalación y Ejecución Local

### Prerrequisitos:
*   .NET SDK 8.0 o superior
*   Microsoft SQL Server

### Pasos:
1. Clonar el repositorio:
   ```bash
   git clone [https://github.com/daniel-mercado-dev/Sistema-Ventas.git](https://github.com/daniel-mercado-dev/Sistema-Ventas.git)
