import ArticulosServicio from '../services/articulos-service.js';

export default class ArticulosControlador {
    constructor() {
        this.articulosServicio = new ArticulosServicio();
    }

    buscarTodos = async (req, res) => {
        try {
            const rows = await this.articulosServicio.buscarTodos();
            res.status(200).json(rows);
        } catch (error) {
            console.error('Error al buscar todos los artículos:', error.message);
            return res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }

    buscarPorId = async (req, res) =>{
        try {
            const {id_articulo} = req.params;
        const rows = await this.articulosServicio.buscarPorId(id_articulo);
        if(rows === null){
            return res.status(404).json({
                mensaje: 'Artículo no encontrado'
            });
        }
        res.status(200).json({ 
            articulo: rows 
        });

        } catch (error) {
            console.error('Error al buscar el artículo por ID:', error.message);
            return res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }

    crear = async(req, res) =>{
        try{
            const articulo = {
                id_area : req.body.id_area,
                id_categoria : req.body.id_categoria,
                descripcion : req.body.descripcion
            }
            const rows = await this.articulosServicio.crear(articulo);
            if(rows === null){
                return res.status(404).json({mensaje: 'Articulo no creado'});
            }
            return res.status(201).json({
                mensaje: 'Articulo creado exitosamente.',   
                articulo: rows 
            });
        }catch (error) {
            console.error('Error al crear el artículo:', error.message);
            return res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }

    borrar = async(req, res) =>{
        try{
            const{id_articulo} = req.params;
            const rows = await this.articulosServicio.borrar(id_articulo);
            if(rows === null){
                return res.status(404).json({mensaje: 'Articulo no encontrado'});
            }
            return res.status(200).json({mensaje: 'Articulo eliminado exitosamente.'});
        }catch (error) {
            console.error('Error al eliminar el artículo:', error.message);
            return res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }

    editar = async(req, res) =>{
        try{
            const id_articulo = req.params.id_articulo;
            const articulo = req.body;
            const rows = await this.articulosServicio.editar(id_articulo, articulo);
            if(rows === null){
                return res.status(404).json({mensaje: 'Articulo no encontrado'});
            }
            return res.status(200).json({
                mensaje: 'Articulo editado exitosamente.',
                articulo: rows
            });
        }catch (error) {
            console.error('Error al editar el artículo:', error.message);
            return res.status(500).json({
                error: 'Error interno del servidor'
            });
        }
    }
    }