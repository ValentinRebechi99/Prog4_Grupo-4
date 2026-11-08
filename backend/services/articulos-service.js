import ArticulosDatos from '../repositories/articulos-repository.js';

export default class ArticulosServicio {
    constructor() {
        this.articuloRepo = new ArticulosDatos();
    }

    buscarTodos = async () => {
        return await this.articuloRepo.buscarTodos();
    }
}