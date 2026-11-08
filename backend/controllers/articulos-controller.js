import ArticulosServicio from '../services/articulos-service.js';

export default class ArticulosControlador {
    constructor() {
        this.articulosServicio = new ArticulosServicio();
    }

    buscarTodos = async (req, res) => {
        try {
            const articulos = await this.articulosServicio.buscarTodos();
            return res.status(200).json(articulos);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}