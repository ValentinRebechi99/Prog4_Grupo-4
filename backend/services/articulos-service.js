import ArticulosDatos from '../repositories/articulos-repository.js';

export default class ArticulosServicio {
    constructor() {
        this.articulos = new ArticulosDatos();
    }

    buscarTodos = async () => {
        return await this.articulos.buscarTodos();
    }

    buscarPorId = (id_articulo) =>{
        return this.articulos.buscarPorId(id_articulo);
    }

    crear = (articulo) => {
        apicache.clear();
        return this.articulos.crear(articulo);
    }

    editar = async (id_articulo, articulo) => {
        const articuloExistente = await this.articulos.buscarPorId(id_articulo);
        if(articuloExistente === null){
            return null;
        }
        apicache.clear();
        return this.articulos.editar(id_articulo, articulo);
    }

    borrar = async (id_articulo) => {
        const articuloExistente = await this.articulos.buscarPorId(id_articulo);
        if(articuloExistente === null){
            return null;
        }
        apicache.clear();
        return this.articulos.borrar(id_articulo);
    }
    
}
