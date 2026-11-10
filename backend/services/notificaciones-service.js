import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from 'fs';
import path from "path";
import { fileURLToPath } from "url";

export default class NotificacionesServicio {

    enviarCorreo = async (datosCorreo) => {
        try {
            console.log("--- DATOS CRUDOS RECIBIDOS EN ENVIAR CORREO ---", JSON.stringify(datosCorreo, null, 2));

            if (!datosCorreo) {
                console.error("No hay datos para enviar el correo.");
                return false;
            }

            let incidencia = datosCorreo;
            if (Array.isArray(datosCorreo)) {
                incidencia = datosCorreo[0];
            } else if (datosCorreo.rows && Array.isArray(datosCorreo.rows)) {
                incidencia = datosCorreo.rows[0];
            }

            if (!incidencia) {
                console.error("Objeto de incidencia vacío.");
                return false;
            }

            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const plantillaPath = path.join(__dirname, '../utiles/handlebars/plantilla.hbs');

            const plantillaTemp = fs.readFileSync(plantillaPath, 'utf-8');
            const plantilla = handlebars.compile(plantillaTemp);

            // Mapeo unificado que soporta el formato detallado o el formato resumido (resolución/destinario)
            const datos = {
                id_incidencia: incidencia.id_incidencia || incidencia.id || 'N/A',
                creado_por_nombre: incidencia.creado_por_nombre || incidencia.nombre_usuario || incidencia.usuario || 'Estimado/a',
                articulo_descripcion: incidencia.articulo_descripcion || incidencia.articulo || incidencia.descripcion_articulo || 'Artículo asociado',
                estado: incidencia.estado || (incidencia.resolucion ? 'Actualizada / Procesada' : 'Actualizado'),
                descripcion_resolucion: incidencia.descripcion_resolucion || incidencia.resolucion || incidencia.detalle || 'Sin detalles adicionales'
            };

            const emailDestino = incidencia.email_usuario || incidencia.email || incidencia.destinario;

            console.log("--- DATOS FINALES PARA HANDLEBARS ---", JSON.stringify(datos, null, 2));
            console.log("--- CORREO DESTINO ---", emailDestino);

            if (!emailDestino) {
                console.error("❌ Error: El correo del usuario está vacío o no está definido.");
                return false;
            }

            const correoHtml = plantilla(datos);

            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.CORREO_USER,
                    pass: process.env.CORREO_PASS
                }
            });

            const correoConf = {
                from: process.env.CORREO_USER,
                to: emailDestino,
                subject: `Actualización de Incidencia #${datos.id_incidencia}`,
                html: correoHtml
            };

            const info = await transporter.sendMail(correoConf);
            console.log('✅ Correo de notificación enviado con éxito:', info.response);
            return true;

        } catch (error) {
            console.error('❌ Error enviando correo electrónico:', error);
            return false;
        }
    }
}