// ====================================
// EMPLEADO SISTEMAS - CATEGORÍAS
// ====================================

const API_BASE = 'http://localhost:3000/api';

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

// ========== RENDER CATEGORÍAS ==========
async function cargarCategorias() {
    const tbody = document.getElementById('categories-table-body');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_BASE}/categorias`);
        if (!res.ok) throw new Error('Error al obtener categorías');
        const categorias = await res.json();

        tbody.innerHTML = '';
        if (categorias.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #888;">No hay categorías registradas.</td></tr>';
            return;
        }

        categorias.forEach((cat) => {
            const codigo = `#${cat.id_categoria}`;
            const descripcion = cat.descripcion || '—';
            const estado = cat.activo === 1 || cat.activo === true || cat.activo === undefined ? 'Activo' : 'Inactivo';
            const badgeEstado = `<span class="badge ${estado === 'Activo' ? 'badge-resuelto' : 'badge-cancelado'}">${estado}</span>`;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${codigo}</td>
                <td>${descripcion}</td>
                <td>${badgeEstado}</td>
                <td>
                    <button type="button" class="btn-action btn-edit-category" style="margin-right: 4px;">Editar</button>
                    <button type="button" class="btn-action btn-delete-category">Eliminar</button>
                </td>
            `;

            const btnEdit = row.querySelector('.btn-edit-category');
            btnEdit.addEventListener('click', () => {
                abrirEditarCategoria(cat);
            });

            const btnDelete = row.querySelector('.btn-delete-category');
            btnDelete.addEventListener('click', async () => {
                const conf = confirm(`¿Estás seguro de que deseas eliminar la categoría ${codigo}?`);
                if (conf) {
                    await eliminarCategoria(cat.id_categoria);
                }
            });

            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error al cargar categorías:', error);
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Error al conectar con el servidor.</td></tr>';
    }
}

// ========== NUEVA CATEGORÍA ==========
function setupNuevaCategoria() {
    const btnNew = document.getElementById('btn-new-category');
    const formNew = document.getElementById('form-new-category');

    if (btnNew) {
        btnNew.addEventListener('click', () => {
            if (formNew) formNew.reset();
            openModal('modal-new-category');
        });
    }

    if (formNew) {
        formNew.addEventListener('submit', async (e) => {
            e.preventDefault();
            const descripcion = document.getElementById('category-description').value;

            try {
                const res = await fetch(`${API_BASE}/categorias`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ descripcion })
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || 'Error al crear categoría');
                }

                closeModal('modal-new-category');
                formNew.reset();
                await cargarCategorias();
            } catch (error) {
                alert('Error al guardar la categoría: ' + error.message);
            }
        });
    }
}

// ========== EDITAR CATEGORÍA ==========
function abrirEditarCategoria(cat) {
    document.getElementById('edit-category-id').value = cat.id_categoria;
    document.getElementById('edit-category-description').value = cat.descripcion || '';
    openModal('modal-edit-category');
}

function setupEditarCategoria() {
    const formEdit = document.getElementById('form-edit-category');
    if (!formEdit) return;

    formEdit.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-category-id').value;
        const descripcion = document.getElementById('edit-category-description').value;

        try {
            const res = await fetch(`${API_BASE}/categorias/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ descripcion })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Error al actualizar categoría');
            }

            closeModal('modal-edit-category');
            await cargarCategorias();
        } catch (error) {
            alert('Error al actualizar la categoría: ' + error.message);
        }
    });
}

// ========== ELIMINAR CATEGORÍA ==========
async function eliminarCategoria(id) {
    try {
        const res = await fetch(`${API_BASE}/categorias/${id}`, {
            method: 'DELETE'
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Error al eliminar categoría');
        }

        await cargarCategorias();
    } catch (error) {
        alert('Error al eliminar la categoría: ' + error.message);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    setupModalClosers();
    setupNuevaCategoria();
    setupEditarCategoria();
    await cargarCategorias();
});

