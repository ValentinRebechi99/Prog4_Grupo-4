// ====================================
// GESTIÓN DE DATOS EN LOCALSTORAGE
// ====================================

class EmployeeSystemsManager {
    constructor() {
        this.incidentsKey = 'employee_systems_incidents';
        this.incidentCounterKey = 'incident_counter_emp';
        this.initializeCounters();
    }

    initializeCounters() {
        if (!localStorage.getItem(this.incidentCounterKey)) {
            localStorage.setItem(this.incidentCounterKey, '5000');
        }
    }

    getNextIncidentCode() {
        let counter = parseInt(localStorage.getItem(this.incidentCounterKey)) || 5000;
        counter++;
        localStorage.setItem(this.incidentCounterKey, counter);
        return `INC-${counter}`;
    }

    // ========== ARTÍCULOS ==========
    async getArticles() {
        try {
            const respuesta = await fetch('http://localhost:3000/api/articulos');
            return await respuesta.json();
        } catch (error) {
            console.error('Error al pedir articulos:', error);
            return [];
        }
    }

    async getArticleById(id) {
        const respuesta = await fetch(`http://localhost:3000/api/articulos/${id}`);
        if (!respuesta.ok) throw new Error('Artículo no encontrado');
        return await respuesta.json();
    }

    async createArticle(datos) {
        const res = await fetch('http://localhost:3000/api/articulos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Error al crear artículo');
        }
        return await res.json();
    }

    async updateArticle(id, datos) {
        const respuesta = await fetch(`http://localhost:3000/api/articulos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        if (!respuesta.ok) {
            const errorData = await respuesta.json();
            throw new Error(errorData.error || 'Error al actualizar el artículo');
        }
        return await respuesta.json();
    }

    async bajaLogicaArticulo(id) {
        const res = await fetch(`http://localhost:3000/api/articulos/${id}`, {
            method: 'PATCH'
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Error al dar de baja el artículo');
        }
        return await res.json();
    }

    // ========== CATEGORÍAS ==========
    async getCategories() {
        try {
            const res = await fetch('http://localhost:3000/api/categorias');
            if (!res.ok) throw new Error('Error al obtener categorías');
            return await res.json();
        } catch (error) {
            console.error('Error en getCategories:', error);
            return [];
        }
    }

    async getCategoryById(id) {
        const respuesta = await fetch(`http://localhost:3000/api/categorias/${id}`);
        if (!respuesta.ok) throw new Error('No se pudo obtener la categoría');
        return await respuesta.json();
    }

    async createCategory(descripcion) {
        const respuesta = await fetch('http://localhost:3000/api/categorias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descripcion })
        });
        if (!respuesta.ok) {
            const errorData = await respuesta.json();
            throw new Error(errorData.error || 'Error al crear la categoría');
        }
        return await respuesta.json();
    }

    async updateCategory(id, descripcion) {
        const respuesta = await fetch(`http://localhost:3000/api/categorias/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descripcion })
        });
        if (!respuesta.ok) {
            const errorData = await respuesta.json();
            throw new Error(errorData.error || 'Error al actualizar la categoría');
        }
        return await respuesta.json();
    }

    async bajaLogicaCategoria(id) {
        const respuesta = await fetch(`http://localhost:3000/api/categorias/${id}`, {
            method: 'PATCH'
        });
        if (!respuesta.ok) {
            const errorData = await respuesta.json();
            throw new Error(errorData.error || 'Error al procesar la baja');
        }
        return await respuesta.json();
    }

    // ========== ÁREAS ==========
    async getAreas() {
        const res = await fetch('http://localhost:3000/api/areas');
        if (!res.ok) throw new Error('Error al obtener áreas');
        return await res.json();
    }

    // ========== INCIDENCIAS (Temporalmente LocalStorage) ==========
    getIncidents() {
        const data = localStorage.getItem(this.incidentsKey);
        return data ? JSON.parse(data) : [];
    }

    addIncident(articleCode, priority) {
        const incidents = this.getIncidents();
        const newIncident = {
            code: this.getNextIncidentCode(),
            articleCode: articleCode,
            priority: priority,
            status: 'Abierta',
            createdAt: new Date().toISOString()
        };
        incidents.push(newIncident);
        localStorage.setItem(this.incidentsKey, JSON.stringify(incidents));
        return newIncident;
    }

    finalizeIncident(code) {
        let incidents = this.getIncidents();
        const incident = incidents.find(inc => inc.code === code);
        if (incident) {
            incident.status = 'Cerrada';
            localStorage.setItem(this.incidentsKey, JSON.stringify(incidents));
        }
    }

    deleteIncident(code) {
        let incidents = this.getIncidents();
        incidents = incidents.filter(inc => inc.code !== code);
        localStorage.setItem(this.incidentsKey, JSON.stringify(incidents));
    }
}

// ====================================
// GESTIÓN DE UI
// ====================================

class EmployeeSystemsUI {
    constructor() {
        this.manager = new EmployeeSystemsManager();
        this.init();
    }

    init() {
        this.setupMenuListeners();
        this.setupModalsGenericClose();
        this.setupNewArticleButton();
        this.setupNewArticleForm();
        this.setupEditArticleForm();
        this.setupCategoryModals();
        this.setupCategoryForm();
        this.setupEditCategoryForm();

        this.renderArticlesTable();
        this.renderCategoriesTable();
        this.renderIncidentsTable();
    }

    // ========== MENÚ LATERAL ==========
    setupMenuListeners() {
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(item.dataset.section);
            });
        });
    }

    switchSection(sectionId) {
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });

        const selectedSection = document.getElementById(sectionId);
        if (selectedSection) {
            selectedSection.classList.add('active');
        }

        document.querySelector(`[data-section="${sectionId}"]`)?.classList.add('active');

        if (sectionId === 'articles') {
            this.renderArticlesTable();
        } else if (sectionId === 'incidents') {
            this.renderIncidentsTable();
        } else if (sectionId === 'categories') {
            this.renderCategoriesTable();
        }
    }

    // ========== ARTÍCULOS: TABLA ==========
    async renderArticlesTable() {
        const articles = await this.manager.getArticles();
        const tbody = document.getElementById('articles-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (!Array.isArray(articles) || articles.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay artículos registrados</td></tr>';
            return;
        }

        articles.forEach(art => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${art.id_articulo}</td>
                <td>${art.categoria_nombre || 'Sin categoría'}</td>
                <td>${art.descripcion_articulo}</td>
                <td>${art.area_nombre || 'Sin área'}</td>
                <td>
                    <button type="button" class="btn-edit-article" data-id="${art.id_articulo}">Editar</button>
                    <button type="button" class="btn-delete-article" data-id="${art.id_articulo}">Baja</button>
                </td>
            `;

            const btnEdit = row.querySelector('.btn-edit-article');
            if (btnEdit) {
                btnEdit.addEventListener('click', () => {
                    this.openEditArticleModal(art.id_articulo);
                });
            }

            const btnDelete = row.querySelector('.btn-delete-article');
            if (btnDelete) {
                btnDelete.addEventListener('click', async () => {
                    if (confirm(`¿Dar de baja el artículo "${art.descripcion_articulo}"?`)) {
                        await this.manager.bajaLogicaArticulo(art.id_articulo);
                        await this.renderArticlesTable();
                    }
                });
            }

            tbody.appendChild(row);
        });
    }

    // ========== ARTÍCULOS: SELECTS DINÁMICOS ==========
    async populateArticleSelects(categorySelectId, areaSelectId) {
        const catSelect = document.getElementById(categorySelectId);
        const areaSelect = document.getElementById(areaSelectId);

        const [categorias, areas] = await Promise.all([
            this.manager.getCategories(),
            this.manager.getAreas()
        ]);

        if (catSelect) {
            catSelect.innerHTML = '<option value="">-- Seleccionar Categoría --</option>';
            categorias.forEach(cat => {
                catSelect.innerHTML += `<option value="${cat.id_categoria}">${cat.descripcion}</option>`;
            });
        }

        if (areaSelect) {
            areaSelect.innerHTML = '<option value="">-- Seleccionar Área --</option>';
            areas.forEach(ar => {
                areaSelect.innerHTML += `<option value="${ar.id_area}">${ar.descripcion}</option>`;
            });
        }
    }

    // ========== ARTÍCULOS: ALTA ==========
    setupNewArticleButton() {
        const btnNew = document.getElementById('btn-new-article');
        if (!btnNew) return;

        btnNew.addEventListener('click', async () => {
            await this.populateArticleSelects('new-article-category', 'new-article-area');
            this.openModal('modal-new-article');
        });
    }

    setupNewArticleForm() {
        const form = document.getElementById('form-new-article');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const selectCat = document.getElementById('new-article-category');
            const inputDesc = document.getElementById('new-article-description');
            const selectArea = document.getElementById('new-article-area');

            const id_categoria = Number(selectCat?.value);
            const descripcion = inputDesc?.value.trim();
            const id_area = Number(selectArea?.value);

            if (!id_categoria || !descripcion || !id_area) {
                alert('Por favor selecciona una categoría, un área y completa la descripción.');
                return;
            }

            try {
                await this.manager.createArticle({ id_categoria, descripcion, id_area });
                form.reset();
                this.closeModal('modal-new-article');
                await this.renderArticlesTable();
                alert('Artículo creado con éxito');
            } catch (error) {
                alert('Error al crear el artículo: ' + error.message);
            }
        });
    }

    // ========== ARTÍCULOS: EDICIÓN ==========
    async openEditArticleModal(id) {
        try {
            await this.populateArticleSelects('edit-article-category', 'edit-article-area');
            const articulo = await this.manager.getArticleById(id);

            document.getElementById('edit-article-id').value = articulo.id_articulo;
            document.getElementById('edit-article-description').value = articulo.descripcion;
            document.getElementById('edit-article-category').value = articulo.id_categoria;
            document.getElementById('edit-article-area').value = articulo.id_area;

            this.openModal('modal-edit-article');
        } catch (error) {
            console.error('Error en openEditArticleModal:', error);
            alert('No se pudo abrir el modal de edición: ' + error.message);
        }
    }

    setupEditArticleForm() {
        const form = document.getElementById('form-edit-article');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const id = document.getElementById('edit-article-id').value;
            const id_categoria = Number(document.getElementById('edit-article-category').value);
            const descripcion = document.getElementById('edit-article-description').value.trim();
            const id_area = Number(document.getElementById('edit-article-area').value);

            if (!descripcion || !id_categoria || !id_area) {
                alert('Por favor completa todos los campos.');
                return;
            }

            try {
                await this.manager.updateArticle(id, { id_categoria, descripcion, id_area });
                this.closeModal('modal-edit-article');
                await this.renderArticlesTable();
                alert('Artículo actualizado con éxito.');
            } catch (error) {
                alert('Error al guardar cambios: ' + error.message);
            }
        });
    }

    // ========== CATEGORÍAS ==========
    setupCategoryModals() {
        const btnNewCategory = document.getElementById('btn-new-category');
        if (btnNewCategory) {
            btnNewCategory.addEventListener('click', () => {
                this.openModal('modal-new-category');
            });
        }
    }

    setupCategoryForm() {
        const form = document.getElementById('form-new-category');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const inputDesc = document.getElementById('category-description');
            const descripcion = inputDesc ? inputDesc.value.trim() : '';

            if (!descripcion) {
                alert('Por favor, ingresa una descripción para la categoría.');
                return;
            }

            try {
                await this.manager.createCategory(descripcion);
                form.reset();
                this.closeModal('modal-new-category');
                await this.renderCategoriesTable();
                alert('Categoría creada exitosamente.');
            } catch (error) {
                alert('Error al crear la categoría: ' + error.message);
            }
        });
    }

    async renderCategoriesTable() {
        const categories = await this.manager.getCategories();
        const tbody = document.getElementById('categories-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (!categories || categories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay categorías registradas</td></tr>';
            return;
        }

        categories.forEach(cat => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${cat.id_categoria}</td>
                <td>${cat.descripcion}</td>
                <td>${cat.activo === 1 ? 'Activo' : 'Inactivo'}</td>
                <td>
                    <button type="button" class="btn-edit-category" style="padding: 0.35rem 0.6rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Editar</button>
                    <button type="button" class="btn-delete-category" style="padding: 0.35rem 0.6rem; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">Baja</button>
                </td>
            `;

            const btnEdit = row.querySelector('.btn-edit-category');
            if (btnEdit) {
                btnEdit.addEventListener('click', () => {
                    this.openEditCategoryModal(cat.id_categoria);
                });
            }

            const btnDelete = row.querySelector('.btn-delete-category');
            if (btnDelete) {
                btnDelete.addEventListener('click', async () => {
                    if (confirm(`¿Dar de baja la categoría "${cat.descripcion}"?`)) {
                        await this.manager.bajaLogicaCategoria(cat.id_categoria);
                        await this.renderCategoriesTable();
                    }
                });
            }

            tbody.appendChild(row);
        });
    }

    async openEditCategoryModal(id) {
        try {
            const categoria = await this.manager.getCategoryById(id);
            const inputId = document.getElementById('edit-category-id');
            const inputDesc = document.getElementById('edit-category-description');

            if (inputId) inputId.value = categoria.id_categoria;
            if (inputDesc) inputDesc.value = categoria.descripcion;

            this.openModal('modal-edit-category');
        } catch (error) {
            alert('Error al obtener la categoría: ' + error.message);
        }
    }

    setupEditCategoryForm() {
        const form = document.getElementById('form-edit-category');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-category-id').value;
            const inputDesc = document.getElementById('edit-category-description');
            const descripcion = inputDesc ? inputDesc.value.trim() : '';

            if (!descripcion) {
                alert('La descripción no puede estar vacía.');
                return;
            }

            try {
                await this.manager.updateCategory(id, descripcion);
                this.closeModal('modal-edit-category');
                await this.renderCategoriesTable();
                alert('Categoría actualizada con éxito');
            } catch (error) {
                alert('Error al modificar la categoría: ' + error.message);
            }
        });
    }

    // ========== INCIDENCIAS ==========
    renderIncidentsTable() {
        const incidents = this.manager.getIncidents();
        const tbody = document.getElementById('incidents-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (incidents.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #999;">No hay incidencias asignadas</td></tr>';
            return;
        }

        incidents.forEach(incident => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${incident.code}</td>
                <td>${incident.articleCode}</td>
                <td>${incident.priority}</td>
                <td>${incident.status}</td>
                <td>
                    ${incident.status === 'Abierta' ?
                    `<button class="btn-finalize" data-code="${incident.code}" style="padding: 0.5rem 1rem; background: #00a854; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 0.5rem;">Finalizar</button>`
                    :
                    '<span style="color: #999;">Finalizada</span>'
                    }
                </td>
            `;

            const btnFinalize = row.querySelector('.btn-finalize');
            if (btnFinalize) {
                btnFinalize.addEventListener('click', () => {
                    this.manager.finalizeIncident(incident.code);
                    this.renderIncidentsTable();
                });
            }

            tbody.appendChild(row);
        });
    }

    // ========== MODALES: UTILIDADES ==========
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    setupModalsGenericClose() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });

            const closeBtn = modal.querySelector('.close-modal');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.closeModal(modal.id);
                });
            }

            const cancelBtn = modal.querySelector('.btn-cancel');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    this.closeModal(modal.id);
                });
            }
        });
    }
}

// ====================================
// INICIALIZACIÓN
// ====================================
document.addEventListener('DOMContentLoaded', () => {
    new EmployeeSystemsUI();
});