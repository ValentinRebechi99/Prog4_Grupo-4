import CategoriasDatos from '../repositories/categorias-repository.js';
import apicache from 'apicache';

export default class CategoriasServicio {

    constructor(){
        this.categoria = new CategoriasDatos();
    }

    buscarPorId = (id_categoria) => {
        return this.categoria.buscarPorId(id_categoria);
    }

    buscarTodos = () => {
        return this.categoria.buscarTodos();
    }

    crear = (categoria) => {
        apicache.clear();
        return this.categoria.crear(categoria);        
    }

    editar = (categoria) => {
        apicache.clear();
        return this.categoria.editar(categoria);
    }

    borrar = (id_categoria) => {
        apicache.clear();
        return this.categoria.borrar(id_categoria);
    }
}