// categorias.js - Gestión del BREAD de Categorías
const API_URL = 'http://localhost:3000/api/categorias';

document.addEventListener('DOMContentLoaded', () => {
    // 1. [BROWSE] Cargar el listado de categorías al entrar a la página
    cargarCategorias();

    // 2. [ADD] Escuchar el envío del formulario para crear nueva categoría
    const formNueva = document.getElementById('formNuevaCategoria');
    if (formNueva) {
        formNueva.addEventListener('submit', agregarCategoria);
    }

    // 3. [EDIT] Escuchar el envío del formulario para guardar los cambios editados
    const formEditar = document.getElementById('formEditarCategoria');
    if (formEditar) {
        formEditar.addEventListener('submit', guardarEdicionCategoria);
    }
});

/**
 * BROWSE: Obtiene todas las categorías activas del servidor y limpia/renderiza la tabla
 */
async function cargarCategorias() {
    try {
        const respuesta = await fetch(API_URL);
        if (!respuesta.ok) throw new Error('Error al conectar con la API de la municipalidad');
        
        const categorias = await respuesta.json();
        renderizarTablaCategorias(categorias);
    } catch (error) {
        console.error('Error al cargar categorías:', error);
        alert('No se pudieron obtener las categorías desde el servidor.');
    }
}

/**
 * RENDERIZAR: Recorre el array JSON e inyecta dinámicamente las filas (tr) y celdas (td)
 */
function renderizarTablaCategorias(categorias) {
    const tbody = document.getElementById('tabla-categorias');
    if (!tbody) return;
    
    tbody.innerHTML = ''; // Limpiar registros previos de la tabla

    categorias.forEach(cat => {
        const row = document.createElement('tr');

        // Celda: Número ID
        const tdId = document.createElement('td');
        tdId.textContent = cat.idCategoria; // IMPORTANTE: Usa camelCase mapeado por tu DTO de respuesta
        row.appendChild(tdId);

        // Celda: Descripción
        const tdDesc = document.createElement('td');
        tdDesc.textContent = cat.descripcion;
        row.appendChild(tdDesc);

        // Celda: Acciones (Editar / Eliminar)
        const tdAcciones = document.createElement('td');
        tdAcciones.className = 'text-center';

        // Botón para iniciar el flujo de Edición (Read)
        const btnEdit = document.createElement('button');
        btnEdit.className = 'btn btn-sm btn-outline-primary me-2';
        btnEdit.innerHTML = '⚙️ Editar';
        btnEdit.addEventListener('click', () => abrirModalEdicion(cat.idCategoria, cat.descripcion));
        tdAcciones.appendChild(btnEdit);

        // Botón para iniciar el flujo de Baja Lógica (Delete)
        const btnDelete = document.createElement('button');
        btnDelete.className = 'btn btn-sm btn-outline-danger';
        btnDelete.innerHTML = '🗑️ Eliminar';
        btnDelete.addEventListener('click', () => eliminarCategoria(cat.idCategoria));
        tdAcciones.appendChild(btnDelete);

        row.appendChild(tdAcciones);
        tbody.appendChild(row);
    });
}

/**
 * ADD: Envía la descripción al backend para registrar un nuevo registro
 */
async function agregarCategoria(event) {
    event.preventDefault();
    const inputDesc = document.getElementById('categoria-descripcion');
    if (!inputDesc) return;

    try {
        const respuesta = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descripcion: inputDesc.value })
        });

        if (!respuesta.ok) {
            const errData = await respuesta.json();
            throw new Error(errData.error || 'Fallo en la creación.');
        }

        inputDesc.value = ''; // Limpiar el campo del formulario
        
        // Ocultar modal de Bootstrap de forma nativa
        const modalEl = document.getElementById('modalNuevaCategoria');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();

        alert('Categoría registrada con éxito.');
        cargarCategorias(); // Recargar el listado completo
    } catch (error) {
        alert(`Error al registrar: ${error.message}`);
    }
}

/**
 * READ: Captura los datos de la fila y los inyecta en los campos ocultos y visibles del formulario de edición
 */
function abrirModalEdicion(id, descripcion) {
    document.getElementById('edit-categoria-id').value = id;
    document.getElementById('edit-categoria-descripcion').value = descripcion;

    const modalEl = document.getElementById('modalEditarCategoria');
    const modalInstance = new bootstrap.Modal(modalEl);
    modalInstance.show();
}

/**
 * EDIT: Envía los cambios de la descripción de vuelta al backend vía PUT
 */
async function guardarEdicionCategoria(event) {
    event.preventDefault();
    const id = document.getElementById('edit-categoria-id').value;
    const descripcion = document.getElementById('edit-categoria-descripcion').value;

    try {
        const respuesta = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descripcion })
        });

        if (!respuesta.ok) {
            const errData = await respuesta.json();
            throw new Error(errData.error || 'Fallo al actualizar.');
        }

        const modalEl = document.getElementById('modalEditarCategoria');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();

        alert('Categoría modificada con éxito.');
        cargarCategorias(); // Recargar para reflejar la modificación
    } catch (error) {
        alert(`Error al modificar: ${error.message}`);
    }
}

/**
 * DELETE: Ejecuta la baja lógica de la categoría solicitando confirmación previa
 */
async function eliminarCategoria(id) {
    if (!confirm('¿Está seguro de que desea eliminar permanentemente esta categoría del sistema municipal?')) return;

    try {
        const respuesta = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!respuesta.ok) {
            const errData = await respuesta.json();
            throw new Error(errData.error || 'Fallo en la eliminación.');
        }

        alert('Categoría dada de baja correctamente.');
        cargarCategorias(); // Recargar tabla para quitar el elemento
    } catch (error) {
        alert(`Error al eliminar: ${error.message}`);
    }
}
