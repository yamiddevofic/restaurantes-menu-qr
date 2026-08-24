// Regenera la imagen QR de todas las mesas existentes con la URL absoluta
// del menú público (QR_BASE_URL del .env o el argumento recibido).
// Mantiene el qr_code de cada mesa: solo recalcula la imagen.
// Uso: node scripts/regenerar-qrs.js [URL_BASE]   (si no se pasa URL_BASE usa QR_BASE_URL)
const path = require('path');
const mongoose = require('mongoose');
const QRCode = require('qrcode');
require('dotenv').config({ path: path.join(__dirname, '..', 'app', '.env') });

const Restaurante = require('../app/models/Restaurante');

const base = process.argv[2] || process.env.QR_BASE_URL;
if (!base) {
    console.error('Define QR_BASE_URL en backend/app/.env o pasa la URL como argumento.');
    process.exit(1);
}

const uri = process.env.MONGO_URI || `mongodb+srv://yamiddev_db_user:${process.env.pass}@cluster-dev.loe0ymb.mongodb.net/qrta?appName=Cluster-Dev`;

(async () => {
    try {
        await mongoose.connect(uri);
        const restaurantes = await Restaurante.find();
        let total = 0;
        for (const restaurante of restaurantes) {
            let cambios = 0;
            for (const mesa of restaurante.mesas) {
                const menuUrl = `${base}/api/restaurantes/menu/${mesa.qr_code}`;
                mesa.qr_image = await QRCode.toDataURL(menuUrl);
                cambios++;
            }
            if (cambios > 0) {
                await restaurante.save();
                total += cambios;
                console.log(`- ${restaurante.nombre}: ${cambios} QR regenerados`);
            }
        }
        console.log(`Listo: ${total} QR regenerados con base ${base}`);
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
})();