// ====================================
// GESTIÓN DE DATOS EN LOCALSTORAGE
// ====================================

class EmployeeSystemsManager {
	constructor() {
		this.articlesKey = 'employee_systems_articles';
		this.categoriesKey = 'employee_systems_categories';
		this.incidentsKey = 'employee_systems_incidents';
		this.articleCounterKey = 'article_counter_emp';
		this.categoryCounterKey = 'category_counter_emp';
		this.incidentCounterKey = 'incident_counter_emp';
		this.initializeCounters();
	}

	initializeCounters() {
		if (!localStorage.getItem(this.articleCounterKey)) {
			localStorage.setItem(this.articleCounterKey, '1000');
		}
		if (!localStorage.getItem(this.categoryCounterKey)) {
			localStorage.setItem(this.categoryCounterKey, '2000');
		}
		if (!localStorage.getItem(this.incidentCounterKey)) {
			localStorage.setItem(this.incidentCounterKey, '5000');
		}
	}

	getNextArticleCode() {
		let counter = parseInt(localStorage.getItem(this.articleCounterKey)) || 1000;
		counter++;
		localStorage.setItem(this.articleCounterKey, counter);
		return `ART-${counter}`;
	}

	getNextCategoryCode() {
		let counter = parseInt(localStorage.getItem(this.categoryCounterKey)) || 2000;
		counter++;
		localStorage.setItem(this.categoryCounterKey, counter);
		return `CAT-${counter}`;
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
			const articulos = await respuesta.json();
			return articulos;
		} catch (error) {
			console.error('Error al pedir articulo', error);
			return [];
		}
	}

	addArticle(type, description, area) {
		const articles = this.getArticles();
		const newArticle = {
			code: this.getNextArticleCode(),
			type: type,
			description: description,
			area: area
		};
		articles.push(newArticle);
		localStorage.setItem(this.articlesKey, JSON.stringify(articles));
		return newArticle;
	}

	deleteArticle(code) {
		let articles = this.getArticles();
		articles = articles.filter(art => art.code !== code);
		localStorage.setItem(this.articlesKey, JSON.stringify(articles));
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

	addCategory(description, status) {
		const categories = this.getCategories();
		const newCategory = {
			code: this.getNextCategoryCode(),
			description: description,
			status: status
		};
		categories.push(newCategory);
		localStorage.setItem(this.categoriesKey, JSON.stringify(categories));
		return newCategory;
	}

	deleteCategory(code) {
		let categories = this.getCategories();
		categories = categories.filter(cat => cat.code !== code);
		localStorage.setItem(this.categoriesKey, JSON.stringify(categories));
	}

	// ========== INCIDENCIAS ==========
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

	async getArticleById(id) {
		try {
			const respuesta = await fetch(`http://localhost:3000/api/articulos/${id}`);
			if (!respuesta.ok) throw new Error('Artículo no encontrado');
			return await respuesta.json();
		} catch (error) {
			console.error('Error al obtener artículo:', error);
			throw error;
		}
	}

	async nuevoArticulo(articuloData) {
		try {
			const respuesta = await fetch('http://localhost:3000/api/articulos', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(articuloData)
			});

			if (!respuesta.ok) {
				throw new Error(`Error en la petición: ${respuesta.status}`);
			}

			return await respuesta.json();
		} catch (error) {
			console.error('Error al guardar artículo:', error);
			throw error;
		}
	}

	async bajaLogicaArticulo(id) {
		try {
			const respuesta = await fetch(`http://localhost:3000/api/articulos/${id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!respuesta.ok) {
				throw new Error(`Error al dar de baja: ${respuesta.status}`);
			}

			return await respuesta.json();
		} catch (error) {
			console.error('Error en bajaLogicaArticulo:', error);
			throw error;
		}
	}

	async modificarArticulo(id, data) {
		try {
			const respuesta = await fetch(`http://localhost:3000/api/articulos/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});

			if (!respuesta.ok) {
				throw new Error(`Error al modificar: ${respuesta.status}`);
			}

			return await respuesta.json();
		} catch (error) {
			console.error('Error en modificarArticulo:', error);
			throw error;
		}
	}

	async createCategory(descripcion) {
		try {
			const respuesta = await fetch('http://localhost:3000/api/categorias', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ descripcion })
			});

			if (!respuesta.ok) {
				const errorData = await respuesta.json();
				throw new Error(errorData.error || 'Error al crear la categoría');
			}

			return await respuesta.json();
		} catch (error) {
			console.error('Error en createCategory:', error);
			throw error;
		}
	}

	async bajaLogicaCategoria(id) {
		try {
			const respuesta = await fetch(`http://localhost:3000/api/categorias/${id}`, {
				method: 'PATCH'
			});

			if (!respuesta.ok) {
				const errorData = await respuesta.json();
				throw new Error(errorData.error || 'Error al procesar la baja');
			}

			return await respuesta.json();
		} catch (error) {
			console.error('Error en bajaLogicaCategoria:', error);
			throw error;
		}
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
		this.setupArticleModals();
		this.setupCategoryModals();
		this.renderArticlesTable();
		this.renderCategoriesTable();
		this.renderIncidentsTable();
		this.setupEditArticleModal();
		this.setupCategoryForm();
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
		// Remover clase active de todas las secciones
		document.querySelectorAll('.content-section').forEach(section => {
			section.classList.remove('active');
		});

		// Remover clase active de todos los items del menú
		document.querySelectorAll('.menu-item').forEach(item => {
			item.classList.remove('active');
		});

		// Activar la sección seleccionada
		const selectedSection = document.getElementById(sectionId);
		if (selectedSection) {
			selectedSection.classList.add('active');
		}

		// Activar el item del menú
		document.querySelector(`[data-section="${sectionId}"]`)?.classList.add('active');

		// Actualizar datos si es necesario
		if (sectionId === 'articles') {
			this.renderArticlesTable();
		} else if (sectionId === 'incidents') {
			this.renderIncidentsTable();
		} else if (sectionId === 'categories') {
			this.renderCategoriesTable();
		}
	}

	// ========== MODALES - ARTÍCULOS ==========
	setupArticleModals() {
		const btnNewArticle = document.getElementById('btn-new-article');
		const modal = document.getElementById('modal-new-article');
		const formNewArticle = document.getElementById('form-new-article');

		// Abrir modal con botón + NUEVO
		if (btnNewArticle && modal) {
			btnNewArticle.addEventListener('click', () => {
				this.openModal('modal-new-article');
			});
		}

		if (modal) {
			this.setupCloseModalButtons(modal);

			// Cerrar al hacer clic en el fondo gris
			modal.addEventListener('click', (e) => {
				if (e.target === modal) {
					this.closeModal('modal-new-article');
				}
			});

			// Capturar clic directo en el botón GUARDAR ARTÍCULO
			const btnSubmit = modal.querySelector('button[type="submit"]') ||
				modal.querySelector('.btn-primary') ||
				modal.querySelector('.btn-confirm');
			if (btnSubmit) {
				btnSubmit.addEventListener('click', (e) => {
					e.preventDefault();
					this.handleNewArticle();
				});
			}
		}

		// Respaldo por evento submit del form
		if (formNewArticle) {
			formNewArticle.addEventListener('submit', (e) => {
				e.preventDefault();
				this.handleNewArticle();
			});
		}
	}

	async handleNewArticle() {
		const modal = document.getElementById('modal-new-article');

		// Busca los inputs por ID o por etiqueta dentro del modal
		const inputTipo = document.getElementById('article-type') ||
			modal?.querySelector('input[type="text"]');
		const inputDescripcion = document.getElementById('article-description') ||
			modal?.querySelector('textarea');

		const tipo = inputTipo ? inputTipo.value.trim() : '';
		const descripcion = inputDescripcion ? inputDescripcion.value.trim() : '';

		if (!descripcion && !tipo) {
			alert('Por favor, ingresa los datos del artículo.');
			return;
		}

		const textoFinal = tipo && descripcion ? `${tipo} - ${descripcion}` : (descripcion || tipo);

		try {
			await this.manager.nuevoArticulo({
				descripcion: textoFinal,
				id_area: 1,
				id_categoria: 1
			});

			// Limpiar inputs manualmente
			if (inputTipo) inputTipo.value = '';
			if (inputDescripcion) inputDescripcion.value = '';

			this.closeModal('modal-new-article');
			await this.renderArticlesTable();
		} catch (error) {
			console.error(error);
			alert('Error al guardar. Revisa la consola y que server.js esté corriendo.');
		}
	}

	async renderArticlesTable() {
		const articles = await this.manager.getArticles();
		const tbody = document.getElementById('articles-table-body');
		const emptyState = document.getElementById('articles-empty');

		if (!tbody) return;
		tbody.innerHTML = '';

		if (!articles || articles.length === 0) {
			if (emptyState) emptyState.style.display = 'block';
			return;
		}

		if (emptyState) emptyState.style.display = 'none';

		articles.forEach(article => {
			const row = document.createElement('tr');
			row.innerHTML = `
                <td>${article.id_articulo}</td>
                <td>Área: ${article.id_area} | Cat: ${article.id_categoria}</td>
                <td>${article.descripcion}</td>
                <td>
                    <div style="display: flex; gap: 0.3rem;">
                        <!-- BOTÓN EDITAR (CONSUME EL GET /api/articulos/:id) -->
                        <button class="btn-edit-article" data-id="${article.id_articulo}" style="padding: 0.35rem 0.6rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Editar
                        </button>
                        <!-- BOTÓN BAJA LÓGICA -->
                        <button class="btn-delete-article" data-id="${article.id_articulo}" style="padding: 0.35rem 0.6rem; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Baja
                        </button>
                    </div>
                </td>
            `;

			// Enlazar el clic de Editar pasando el ID
			const btnEdit = row.querySelector('.btn-edit-article');
			btnEdit.addEventListener('click', () => {
				this.openEditModal(article.id_articulo);
			});

			// Enlazar el clic de Baja
			const btnDelete = row.querySelector('.btn-delete-article');
			btnDelete.addEventListener('click', async () => {
				const confirmar = confirm(`¿Estás seguro de que deseas dar de baja el artículo "${article.descripcion}"?`);
				if (confirmar) {
					try {
						await this.manager.bajaLogicaArticulo(article.id_articulo);
						await this.renderArticlesTable();
					} catch (error) {
						alert('No se pudo procesar la baja del artículo.');
					}
				}
			});

			tbody.appendChild(row);
		});
	}
	// ========== MODALES - CATEGORÍAS ==========
	setupCategoryModals() {
		const btnNewCategory = document.getElementById('btn-new-category');
		const formNewCategory = document.getElementById('form-new-category');
		const modal = document.getElementById('modal-new-category');

		if (btnNewCategory && modal) {
			btnNewCategory.addEventListener('click', () => {
				this.openModal('modal-new-category');
			});
		}

		if (modal) {
			this.setupCloseModalButtons(modal);

			modal.addEventListener('click', (e) => {
				if (e.target === modal) {
					this.closeModal('modal-new-category');
				}
			});
		}

		if (formNewCategory) {
			formNewCategory.addEventListener('submit', (e) => {
				e.preventDefault();
				this.handleNewCategory();
			});
		}
	}

	handleNewCategory() {
		const description = document.getElementById('category-description').value.trim();
		const status = document.getElementById('category-status').value.trim();

		if (!description || !status) {
			alert('Por favor completa todos los campos');
			return;
		}

		this.manager.addCategory(description, status);
		this.resetForm('form-new-category');
		this.closeModal('modal-new-category');
		this.renderCategoriesTable();
	}

	async renderCategoriesTable() {
		// 1. Pide las categorías a la base de datos mediante la API
		const categories = await this.manager.getCategories();

		const tbody = document.getElementById('categories-table-body');
		const emptyState = document.getElementById('categories-empty'); // O el elemento que muestra "No hay categorías registradas"

		if (!tbody) return;
		tbody.innerHTML = '';

		if (!categories || categories.length === 0) {
			if (emptyState) emptyState.style.display = 'block';
			return;
		}

		if (emptyState) emptyState.style.display = 'none';

		// 2. Dibuja cada fila con los datos reales de PostgreSQL
		categories.forEach(cat => {
			const row = document.createElement('tr');
			row.innerHTML = `
            <td>${cat.id_categoria}</td>
            <td>${cat.descripcion}</td>
            <td>${cat.activo === 1 ? 'Activo' : 'Inactivo'}</td>
            <td>
                <div style="display: flex; gap: 0.3rem;">
                    <button class="btn-edit-category" data-id="${cat.id_categoria}" style="padding: 0.35rem 0.6rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Editar
                    </button>
                    <button class="btn-delete-category" data-id="${cat.id_categoria}" style="padding: 0.35rem 0.6rem; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Baja
                    </button>
                </div>
            </td>
        `;
			tbody.appendChild(row);
			const btnDelete = row.querySelector('.btn-delete-category');
			btnDelete.addEventListener('click', async () => {
				const confirmar = confirm(`¿Estás seguro de dar de baja la categoría "${cat.descripcion}"?`);
				if (confirmar) {
					try {
						await this.manager.bajaLogicaCategoria(cat.id_categoria);
						await this.renderCategoriesTable(); // Refresca la tabla automáticamente
					} catch (error) {
						alert('No se pudo procesar la baja: ' + error.message);
					}
				}
			});
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
			const article = this.manager.getArticleById(incident.articleCode);
			const articleName = article ? article.type : 'No encontrado';

			const row = document.createElement('tr');
			row.innerHTML = `
				<td>${incident.code}</td>
				<td>${articleName}</td>
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

	// ========== MODALES - FUNCIONES GENÉRICAS ==========
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

	setupCloseModalButtons(modal) {
		// Cerrar con X
		const closeBtn = modal.querySelector('.close-modal');
		if (closeBtn) {
			closeBtn.addEventListener('click', () => {
				this.closeModal(closeBtn.dataset.modal);
			});
		}

		// Cerrar con botón Cancelar
		const cancelBtn = modal.querySelector('.btn-cancel');
		if (cancelBtn) {
			cancelBtn.addEventListener('click', () => {
				this.closeModal(cancelBtn.dataset.modal);
			});
		}
	}

	resetForm(formId) {
		const form = document.getElementById(formId);
		if (form) {
			form.reset();
		}
	}

	setupEditArticleModal() {
		const modal = document.getElementById('modal-edit-article');
		const form = document.getElementById('form-edit-article');

		if (modal) {
			this.setupCloseModalButtons(modal);
			modal.addEventListener('click', (e) => {
				if (e.target === modal) this.closeModal('modal-edit-article');
			});
		}

		if (form) {
			form.addEventListener('submit', async (e) => {
				e.preventDefault();
				const id = document.getElementById('edit-article-id').value;
				const descripcion = document.getElementById('edit-article-description').value.trim();

				if (!descripcion) {
					alert('La descripción no puede estar vacía');
					return;
				}

				try {
					await this.manager.modificarArticulo(id, { descripcion });
					this.closeModal('modal-edit-article');
					await this.renderArticlesTable();
				} catch (error) {
					alert('Error al actualizar el artículo');
				}
			});
		}
	}

	async openEditModal(id) {
		try {
			// Consulta el endpoint GET /api/articulos/:id (Read)
			const article = await this.manager.getArticleById(id);

			// Rellena los campos con la respuesta fresca de la base de datos
			document.getElementById('edit-article-id').value = article.id_articulo;
			document.getElementById('edit-article-description').value = article.descripcion;

			this.openModal('modal-edit-article');
		} catch (error) {
			alert('No se pudo cargar la información del artículo.');
		}
	}

	setupCategoryForm() {
		const form = document.getElementById('form-new-category');
		if (!form) return;

		form.addEventListener('submit', async (e) => {
			e.preventDefault();
			const input = document.getElementById('category-description');
			const descripcion = input ? input.value.trim() : '';

			if (!descripcion) {
				alert('Ingresa una descripción para la categoría.');
				return;
			}

			try {
				await this.manager.createCategory(descripcion);
				form.reset();
				if (typeof this.closeModal === 'function') {
					this.closeModal('modal-new-category');
				}
				alert('Categoría creada con éxito');
				// Si ya tienes la tabla de categorías, acá llamarás a this.renderCategoriesTable();
			} catch (error) {
				alert('No se pudo guardar la categoría.');
			}
		});
	}
	setupCategoryForm() {
		// ID del formulario del modal de nueva categoría
		const form = document.getElementById('form-new-category');
		if (!form) return;

		form.addEventListener('submit', async (e) => {
			e.preventDefault();
			const inputDesc = document.getElementById('category-description'); // o el ID de tu input
			const descripcion = inputDesc ? inputDesc.value.trim() : '';

			if (!descripcion) {
				alert('Por favor, ingresa una descripción para la categoría.');
				return;
			}

			try {
				// Llama al POST /api/categorias a través del manager
				await this.manager.createCategory(descripcion);

				// Limpia y cierra el modal
				form.reset();
				this.closeModal('modal-new-category'); // Ajusta con tu función/ID de modal

				// Vuelve a renderizar la tabla para mostrar la nueva categoría recién insertada
				await this.renderCategoriesTable();
				alert('Categoría creada exitosamente.');
			} catch (error) {
				alert('Error al crear la categoría: ' + error.message);
			}
		});
	}
}

// ====================================
// INICIALIZAR CUANDO DOM ESTÉ LISTO
// ====================================

document.addEventListener('DOMContentLoaded', () => {
	new EmployeeSystemsUI();
});
