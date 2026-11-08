import AreasServicio from '../services/areas-service.js';

export default class AreasControlador {

    constructor (){
        this.area = new AreasServicio();
    }

    buscarTodos = async (req, res) => {
        try {
            const rows = await this.area.buscarTodos();

            if (rows === null) {
                return res.status(404).json({ mensaje: 'No se encontraron áreas.' });
            }

            res.status(200).json({ areas: rows });

        } catch (error) {
            console.error('Error al obtener todas las áreas:', error.message);
            return res.status(500).json({ 
                error: 'Error interno del servidor.' 
            });
        }
    }
}