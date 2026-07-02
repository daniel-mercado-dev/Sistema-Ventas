using ESCPOS_NET.Emitters;
using ESCPOS_NET.Utilities;
using System.Runtime.InteropServices;
using TICKETERA.Models;

namespace TICKETERA.Services
{
    public class TicketPrintingService
    {
        [DllImport("winspool.drv", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern bool OpenPrinter(string pPrinterName, out IntPtr phPrinter, IntPtr pDefault);

        [DllImport("winspool.drv", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern bool ClosePrinter(IntPtr hPrinter);

        [DllImport("winspool.drv", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern bool StartDocPrinter(IntPtr hPrinter, int Level, ref DOCINFO pDocInfo);

        [DllImport("winspool.drv", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern bool EndDocPrinter(IntPtr hPrinter);

        [DllImport("winspool.drv", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern bool StartPagePrinter(IntPtr hPrinter);

        [DllImport("winspool.drv", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern bool EndPagePrinter(IntPtr hPrinter);

        [DllImport("winspool.drv", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern bool WritePrinter(IntPtr hPrinter, IntPtr pBytes, int dwCount, out int dwWritten);

        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Auto)]
        private struct DOCINFO
        {
            [MarshalAs(UnmanagedType.LPTStr)] public string pDocName;
            [MarshalAs(UnmanagedType.LPTStr)] public string pOutputFile;
            [MarshalAs(UnmanagedType.LPTStr)] public string pDataType;
        }

        private const string PrinterName = "MP-POS80";

        private static string L(string texto)
        {
            return texto
                .Replace("Ñ", "N").Replace("ñ", "n")
                .Replace("Á", "A").Replace("á", "a")
                .Replace("É", "E").Replace("é", "e")
                .Replace("Í", "I").Replace("í", "i")
                .Replace("Ó", "O").Replace("ó", "o")
                .Replace("Ú", "U").Replace("ú", "u")
                .Replace("¡", "!").Replace("¿", "?");
        }

        private static byte[] GenerarQR(string texto, int tamano = 6)
        {
            byte[] data = System.Text.Encoding.UTF8.GetBytes(texto);
            int len = data.Length + 3;
            byte lenL = (byte)(len % 256);
            byte lenH = (byte)(len / 256);

            return ByteSplicer.Combine(
                // Modelo QR
                new byte[] { 0x1D, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00 },
                // Tamaño del módulo (1-8, donde 6 es mediano)
                new byte[] { 0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, (byte)tamano },
                // Nivel de corrección de errores (M = 48+1 = 49)
                new byte[] { 0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x31 },
                // Datos del QR
                new byte[] { 0x1D, 0x28, 0x6B, lenL, lenH, 0x31, 0x50, 0x30 },
                data,
                // Imprimir QR
                new byte[] { 0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30 }
            );
        }

        public void Imprimir(VentaCabecera venta)
        {
            _ = Task.Run(() =>
            {
                try
                {
                    var e = new EPSON();

                    var detalleBytes = new List<byte[]>();

                    // --- Encabezado ---
                    detalleBytes.Add(ByteSplicer.Combine(
                          e.Initialize(),
                        e.CenterAlign(),
                         e.SetStyles(PrintStyle.Bold | PrintStyle.DoubleHeight),
                        e.PrintLine(L("TICKET DE VENTA")),
                        e.Initialize(),
                        e.CenterAlign(),
                        e.SetStyles(PrintStyle.Bold | PrintStyle.DoubleHeight),
                        e.PrintLine(L("DULCES LIMENOS ASTRID")),
                        e.SetStyles(PrintStyle.None),
                        e.PrintLine(L("RUC: 10775714323")),
                        e.PrintLine(L("Mercado Suarez Betto Daniel")),
                        e.PrintLine(L("Av. Lima Sur 211")),
                        e.PrintLine(L("Tel: 958 324 196")),
                        e.LeftAlign(),
                        e.PrintLine("--------------------------------"),
                        e.SetStyles(PrintStyle.Bold),
                        e.PrintLine(L($"ORDEN: #{venta.Id}")),
                        e.PrintLine(L($"FECHA: {DateTime.Now:dd/MM/yyyy HH:mm:ss}")),
                        e.SetStyles(PrintStyle.None),
                        e.PrintLine("--------------------------------"),
                        e.PrintLine(L("ITEM                       TOTAL")),
                        e.PrintLine("--------------------------------")
                    ));

                    // --- Detalle ---
                    foreach (var item in venta.Detalles)
                    {
                        string nombre = L((item.ProductoNombre ?? "").ToUpper());
                        string precio = $"S/ {item.PrecioUnitario * item.Cantidad:F2}";

                        if ((nombre.Contains("OFERTA") || nombre.Contains("PROMO")) && nombre.Contains(":"))
                        {
                            string lineaOferta = nombre.Split(':')[0].Trim();
                            string sabores = nombre.Split(':')[1].Trim().Replace(" + ", " / ");

                            detalleBytes.Add(ByteSplicer.Combine(
                                e.SetStyles(PrintStyle.Bold),
                                e.PrintLine(lineaOferta),
                                e.SetStyles(PrintStyle.None),
                                e.PrintLine($"  {sabores}"),
                                e.PrintLine($"                           {precio}")
                            ));
                        }
                        else
                        {
                            detalleBytes.Add(ByteSplicer.Combine(
                                e.PrintLine(nombre),
                                e.PrintLine($"                           {precio}")
                            ));
                        }
                    }

                    string mensajePromo = "";
                    if (venta.MontoTotal >= 25)
                        mensajePromo = "!Llevas 1 mazamorra GRATIS!";
                    else if (venta.MontoTotal >= 15)
                        mensajePromo = "!Llevas 1 gelatina GRATIS!";
                    else
                    {
                        decimal falta = 15 - venta.MontoTotal;
                        mensajePromo = $"Gasta S/ {falta:F2} mas y lleva";
                        // segunda línea:
                        // "1 gelatina GRATIS"
                    }

                    // --- Pie ---
                    detalleBytes.Add(ByteSplicer.Combine(
                        e.PrintLine("--------------------------------"),
                        e.SetStyles(PrintStyle.Bold),
                        e.PrintLine(L($"TOTAL A PAGAR: S/ {venta.MontoTotal:F2}")),
                        e.PrintLine(L($"PAGO CON: {venta.MetodoPago.ToUpper()}")),
                        e.SetStyles(PrintStyle.None),
                        e.PrintLine("--------------------------------"),

                        // --- PROMOCION ---
                        /**e.PrintLine("--------------------------------"),
                       e.SetStyles(PrintStyle.Bold),
                        e.PrintLine("* PROMOCIONES *"),
                        e.SetStyles(PrintStyle.None),
                        e.PrintLine("Compras desde S/ 15.00:"),
                        e.PrintLine("  + 1 gelatina GRATIS"),
                        e.PrintLine("Compras desde S/ 25.00:"),
                        e.PrintLine("  + 1 mazamorra GRATIS"),
                        e.PrintLine("--------------------------------"),**/

                        

                        // --- REDES SOCIALES ---
                        e.SetStyles(PrintStyle.Bold),
                        e.PrintLine("Siguenos en:Facebook, Instagram, Tiktok"),
                        e.SetStyles(PrintStyle.None),
                        e.PrintLine("Facebook: Dulces Limenos Astrid"),
                        e.PrintLine("WhatsApp: 958 324 196"),
                        e.PrintLine(""),

                        // --- QR (apunta a tu Facebook o WhatsApp) ---
                        e.SetStyles(PrintStyle.Bold),
                        e.PrintLine("Escanea para contactarnos:"),
                        e.SetStyles(PrintStyle.None)

                        


                    ));

                    // QR separado porque ByteSplicer necesita los bytes directos
                    detalleBytes.Add(GenerarQR("https://wa.me/51958324196"));

                    detalleBytes.Add(ByteSplicer.Combine(
                        e.CenterAlign(),
                        e.PrintLine(""),
                        e.PrintLine("wa.me/51958324196"),
                        e.PrintLine(""),
                        e.PrintLine(""),
                        e.FullCutAfterFeed(3),

                        e.CenterAlign(),
                        e.PrintLine(""),
                        e.PrintLine(L("!GRACIAS POR SU COMPRA!")),
                        e.PrintLine(L("Conserve su comprobante")),
                        e.PrintLine("")


                    ));


                    var todosLosBytes = ByteSplicer.Combine(detalleBytes.ToArray());
                    EnviarBytesAImpresora(PrinterName, todosLosBytes);
                    Console.WriteLine("Ticket impreso correctamente");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"ERROR IMPRESORA: {ex.Message}");
                }
            });
        }

        private void EnviarBytesAImpresora(string printerName, byte[] bytes)
        {
            if (!OpenPrinter(printerName, out IntPtr hPrinter, IntPtr.Zero))
                throw new Exception($"No se pudo abrir la impresora: {printerName}");

            var docInfo = new DOCINFO
            {
                pDocName = "Ticket",
                pOutputFile = null,
                pDataType = "RAW"
            };

            if (!StartDocPrinter(hPrinter, 1, ref docInfo))
            {
                ClosePrinter(hPrinter);
                throw new Exception("No se pudo iniciar el documento");
            }

            StartPagePrinter(hPrinter);

            IntPtr pBytes = Marshal.AllocCoTaskMem(bytes.Length);
            Marshal.Copy(bytes, 0, pBytes, bytes.Length);
            WritePrinter(hPrinter, pBytes, bytes.Length, out int written);
            Marshal.FreeCoTaskMem(pBytes);

            EndPagePrinter(hPrinter);
            EndDocPrinter(hPrinter);
            ClosePrinter(hPrinter);
        }
    }
}