// ====================================
// EMPLEADO SISTEMAS - ARTÍCULOS
// ====================================

const API_BASE = 'http://localhost:3000/api';

let categoriasList = [];
let areasList = [];

// ========== MODALES UTILIDADES ==========
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'flex';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

function setupModalClosers() {
    document.querySelectorAll('.modal').forEach((modal) => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal.id);
        });

        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => closeModal(modal.id));
        }

        const cancelBtn = modal.querySelector('.btn-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => closeModal(modal.id));
        }
    });
}

// ========== CARGA DE SELECTS ==========
async function cargarCategoriasYAreas() {
    try {
        const [resCat, resArea] = await Promise.all([
            fetch(`${API_BASE}/categorias`),
            fetch(`${API_BASE}/areas`)
        ]);

        if (resCat.ok) {
            categoriasList = await resCat.json();
        }
        if (resArea.ok) {
            areasList = await resArea.json();
        }

        poblarSelects();
    } catch (error) {
        console.error('Error al cargar categorias o areas:', error);
    }
}

function poblarSelects() {
    const selectsCat = [document.getElementById('new-article-category'), document.getElementById('edit-article-category')];
    const selectsArea = [document.getElementById('new-article-area'), document.getElementById('edit-article-area')];

    selectsCat.forEach((sel) => {
        if (!sel) return;
        sel.innerHTML = '<option value="">-- Seleccionar Categoría --</option>';
        categoriasList.forEach((cat) => {
            const opt = document.createElement('option');
            opt.value = cat.id_categoria;
            opt.textContent = cat.descripcion;
            sel.appendChild(opt);
        });
    });

    selectsArea.forEach((sel) => {
        if (!sel) return;
        sel.innerHTML = '<option value="">-- Seleccionar Área --</option>';
        areasList.forEach((area) => {
            const opt = document.createElement('option');
            opt.value = area.id_area;
            opt.textContent = area.descripcion;
            sel.appendChild(opt);
        });
    });
}

// ========== RENDER ARTÍCULOS ==========
async function cargarArticulos() {
    const tbody = document.getElementById('articles-table-body');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_BASE}/articulos`);
        if (!res.ok) throw new Error('Error al obtener artículos');
        const articulos = await res.json();

        tbody.innerHTML = '';
        if (articulos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #888;">No hay artículos registrados.</td></tr>';
            return;
        }

        articulos.forEach((art) => {
            const codigo = `#${art.id_articulo}`;
            const tipo = art.categoria_nombre || 'Sin categoría';
            const descripcion = art.descripcion_articulo || art.descripcion || '—';
            const area = art.area_nombre || 'Sin área';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${codigo}</td>
                <td>${tipo}</td>
                <td>${descripcion}</td>
                <td>${area}</td>
                <td>
                    <button type="button" class="btn-action btn-edit-article" style="margin-right: 4px;">Editar</button>
                    <button type="button" class="btn-action btn-delete-article">Eliminar</button>
                </td>
            `;

            const btnEdit = row.querySelector('.btn-edit-article');
            btnEdit.addEventListener('click', () => {
                abrirEditarArticulo(art);
            });

            const btnDelete = row.querySelector('.btn-delete-article');
            btnDelete.addEventListener('click', async () => {
                const conf = confirm(`¿Estás seguro de que deseas eliminar el artículo ${codigo}?`);
                if (conf) {
                    await eliminarArticulo(art.id_articulo);
                }
            });

            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error al cargar artículos:', error);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Error al conectar con el servidor.</td></tr>';
    }
}

// ========== NUEVO ARTÍCULO ==========
function setupNuevoArticulo() {
    const btnNew = document.getElementById('btn-new-article');
    const formNew = document.getElementById('form-new-article');

    if (btnNew) {
        btnNew.addEventListener('click', () => {
            if (formNew) formNew.reset();
            openModal('modal-new-article');
        });
    }

    if (formNew) {
        formNew.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id_categoria = document.getElementById('new-article-category').value;
            const descripcion = document.getElementById('new-article-description').value;
            const id_area = document.getElementById('new-article-area').value;

            try {
                const res = await fetch(`${API_BASE}/articulos`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_categoria, descripcion, id_area })
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || 'Error al crear artículo');
                }

                closeModal('modal-new-article');
                formNew.reset();
                await cargarArticulos();
            } catch (error) {
                alert('Error al guardar el artículo: ' + error.message);
            }
        });
    }
}

// ========== EDITAR ARTÍCULO ==========
function abrirEditarArticulo(art) {
    document.getElementById('edit-article-id').value = art.id_articulo;
    document.getElementById('edit-article-category').value = art.id_categoria || '';
    document.getElementById('edit-article-description').value = art.descripcion_articulo || art.descripcion || '';
    document.getElementById('edit-article-area').value = art.id_area || '';
    openModal('modal-edit-article');
}

function setupEditarArticulo() {
    const formEdit = document.getElementById('form-edit-article');
    if (!formEdit) return;

    formEdit.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-article-id').value;
        const id_categoria = document.getElementById('edit-article-category').value;
        const descripcion = document.getElementById('edit-article-description').value;
        const id_area = document.getElementById('edit-article-area').value;

        try {
            const res = await fetch(`${API_BASE}/articulos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_categoria, descripcion, id_area })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Error al actualizar artículo');
            }

            closeModal('modal-edit-article');
            await cargarArticulos();
        } catch (error) {
            alert('Error al actualizar el artículo: ' + error.message);
        }
    });
}

// ========== ELIMINAR ARTÍCULO ==========
async function eliminarArticulo(id) {
    try {
        const res = await fetch(`${API_BASE}/articulos/${id}`, {
            method: 'PATCH'
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Error al eliminar artículo');
        }

        await cargarArticulos();
    } catch (error) {
        alert('Error al eliminar el artículo: ' + error.message);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    setupModalClosers();
    setupNuevoArticulo();
    setupEditarArticulo();
    await cargarCategoriasYAreas();
    await cargarArticulos();
});

