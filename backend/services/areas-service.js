import AreasDatos from '../repositories/areas-repository.js';
import apicache from 'apicache';

export default class AreasServicio {

    constructor(){
        this.area = new AreasDatos();
    }

    buscarTodos = () => {
        return this.area.buscarTodos();
    }
}