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
	getArticles() {
		const data = localStorage.getItem(this.articlesKey);
		return data ? JSON.parse(data) : [];
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
	getCategories() {
		const data = localStorage.getItem(this.categoriesKey);
		return data ? JSON.parse(data) : [];
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

	getArticleById(code) {
		const articles = this.getArticles();
		return articles.find(art => art.code === code);
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
		const formNewArticle = document.getElementById('form-new-article');
		const modal = document.getElementById('modal-new-article');

		// Abrir modal
		btnNewArticle.addEventListener('click', () => {
			this.openModal('modal-new-article');
		});

		// Cerrar modal - botones
		this.setupCloseModalButtons(modal);

		// Enviar formulario
		formNewArticle.addEventListener('submit', (e) => {
			e.preventDefault();
			this.handleNewArticle();
		});

		// Cerrar modal al hacer click fuera
		modal.addEventListener('click', (e) => {
			if (e.target === modal) {
				this.closeModal('modal-new-article');
			}
		});
	}

	handleNewArticle() {
		const type = document.getElementById('article-type').value.trim();
		const description = document.getElementById('article-description').value.trim();
		const area = document.getElementById('article-area').value.trim();

		if (!type || !description || !area) {
			alert('Por favor completa todos los campos');
			return;
		}

		this.manager.addArticle(type, description, area);
		this.resetForm('form-new-article');
		this.closeModal('modal-new-article');
		this.renderArticlesTable();
	}

	renderArticlesTable() {
		const articles = this.manager.getArticles();
		const tbody = document.getElementById('articles-table-body');

		tbody.innerHTML = '';

		if (articles.length === 0) {
			tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #999;">No hay artículos registrados</td></tr>';
			return;
		}

		articles.forEach(article => {
			const row = document.createElement('tr');
			row.innerHTML = `
				<td>${article.code}</td>
				<td>${article.type}</td>
				<td>${article.description}</td>
				<td>${article.area}</td>
				<td>
					<button class="btn-delete" data-code="${article.code}" style="padding: 0.5rem 1rem; background: #d32f2f; color: white; border: none; border-radius: 4px; cursor: pointer;">Eliminar</button>
				</td>
			`;

			const btnDelete = row.querySelector('.btn-delete');
			btnDelete.addEventListener('click', () => {
				if (confirm('¿Estás seguro de que deseas eliminar este artículo?')) {
					this.manager.deleteArticle(article.code);
					this.renderArticlesTable();
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

		// Abrir modal
		btnNewCategory.addEventListener('click', () => {
			this.openModal('modal-new-category');
		});

		// Cerrar modal - botones
		this.setupCloseModalButtons(modal);

		// Enviar formulario
		formNewCategory.addEventListener('submit', (e) => {
			e.preventDefault();
			this.handleNewCategory();
		});

		// Cerrar modal al hacer click fuera
		modal.addEventListener('click', (e) => {
			if (e.target === modal) {
				this.closeModal('modal-new-category');
			}
		});
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

	renderCategoriesTable() {
		const categories = this.manager.getCategories();
		const tbody = document.getElementById('categories-table-body');

		tbody.innerHTML = '';

		if (categories.length === 0) {
			tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem; color: #999;">No hay categorías registradas</td></tr>';
			return;
		}

		categories.forEach(category => {
			const row = document.createElement('tr');
			row.innerHTML = `
				<td>${category.code}</td>
				<td>${category.description}</td>
				<td>${category.status}</td>
				<td>
					<button class="btn-delete" data-code="${category.code}" style="padding: 0.5rem 1rem; background: #d32f2f; color: white; border: none; border-radius: 4px; cursor: pointer;">Eliminar</button>
				</td>
			`;

			const btnDelete = row.querySelector('.btn-delete');
			btnDelete.addEventListener('click', () => {
				if (confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
					this.manager.deleteCategory(category.code);
					this.renderCategoriesTable();
				}
			});

			tbody.appendChild(row);
		});
	}

	// ========== INCIDENCIAS ==========
	renderIncidentsTable() {
		const incidents = this.manager.getIncidents();
		const tbody = document.getElementById('incidents-table-body');

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
}

// ====================================
// INICIALIZAR CUANDO DOM ESTÉ LISTO
// ====================================

document.addEventListener('DOMContentLoaded', () => {
	new EmployeeSystemsUI();
});
