// ====================================
// VARIABLES GLOBALES
// ====================================

let incidenciasActuales = [];
let incidenciasCompletas = [];
let empleadosSistemas = [];
let incidenciaSeleccionada = null;

// ====================================
// INICIALIZACIÓN
// ====================================

document.addEventListener('DOMContentLoaded', function () {
	inicializarApp();
});

function inicializarApp() {
	// Cargar datos (simulados, sin datos reales)
	cargarEmpleados();
	cargarIncidencias();

	// Configurar eventos de menú
	configurarMenuLateral();

	// Configurar eventos de filtros
	configurarFiltros();

	// Actualizar estadísticas del dashboard
	actualizarEstadisticas();
}

// ====================================
// MENÚ LATERAL - NAVEGACIÓN
// ====================================

function configurarMenuLateral() {
	const menuItems = document.querySelectorAll('.menu-item');

	menuItems.forEach((item) => {
		item.addEventListener('click', function () {
			const seccion = this.getAttribute('data-section');
			cambiarSeccion(seccion);
		});
	});
}

function cambiarSeccion(seccion) {
	// Remover clase active de todas las secciones
	const secciones = document.querySelectorAll('.content-section');
	secciones.forEach((sec) => sec.classList.remove('active'));

	// Remover clase active de todos los items del menú
	const menuItems = document.querySelectorAll('.menu-item');
	menuItems.forEach((item) => item.classList.remove('active'));

	// Activar sección seleccionada
	const seccionActiva = document.getElementById(seccion);
	if (seccionActiva) {
		seccionActiva.classList.add('active');
	}

	// Activar item del menú
	document.querySelector(`[data-section="${seccion}"]`).classList.add('active');

	// Si es incidencias, actualizar tabla
	if (seccion === 'incidencias') {
		actualizarTablaIncidencias();
	}

	// Si es reportes, actualizar tabla
	if (seccion === 'reportes') {
		actualizarTablaReportes();
	}
}

// ====================================
// CARGAR DATOS (SIMULADOS)
// ====================================

function cargarEmpleados() {
	// Simulación de empleados del área de sistemas
	// El usuario no quiere datos, así que esto queda vacío
	empleadosSistemas = [];
}

function cargarIncidencias() {
	// Simulación de incidencias
	// El usuario no quiere datos para rellenar las tablas
	incidenciasActuales = [];
	incidenciasCompletas = [];
}

// ====================================
// DASHBOARD - ESTADÍSTICAS
// ====================================

function actualizarEstadisticas() {
	// Estos valores se actualizarían basándose en los datos reales
	// Por ahora, inicializamos en 0 ya que no hay datos

	// Estadísticas por estado
	document.getElementById('stat-pendientes').textContent = '0';
	document.getElementById('stat-proceso').textContent = '0';
	document.getElementById('stat-resueltas').textContent = '0';
	document.getElementById('stat-canceladas').textContent = '0';

	// Estadísticas por fecha
	document.getElementById('stat-hoy').textContent = '0';
	document.getElementById('stat-semana').textContent = '0';
	document.getElementById('stat-mes').textContent = '0';
	document.getElementById('stat-total').textContent = '0';

	// Estadísticas por prioridad
	document.getElementById('stat-criticas').textContent = '0';
	document.getElementById('stat-altas').textContent = '0';
	document.getElementById('stat-medias').textContent = '0';
	document.getElementById('stat-bajas').textContent = '0';
}

// ====================================
// TABLA DE INCIDENCIAS PENDIENTES
// ====================================

function actualizarTablaIncidencias() {
	const tbody = document
		.getElementById('incidencias-table')
		.querySelector('tbody');
	tbody.innerHTML = '';

	// Filtrar solo incidencias pendientes
	const incidenciasPendientes = incidenciasActuales.filter(
		(inc) => inc.estado === 'Pendiente'
	);

	// Si no hay incidencias pendientes, mostrar mensaje vacío
	if (incidenciasPendientes.length === 0) {
		const fila = document.createElement('tr');
		fila.innerHTML =
			'<td colspan="6" style="text-align: center; color: var(--gray-500); padding: 2rem;">No hay incidencias pendientes</td>';
		tbody.appendChild(fila);
		return;
	}

	incidenciasPendientes.forEach((incidencia) => {
		const fila = document.createElement('tr');
		fila.innerHTML = `
            <td>${incidencia.codigo}</td>
            <td>${incidencia.articulo}</td>
            <td><span class="badge badge-${incidencia.prioridad.toLowerCase()}">${incidencia.prioridad}</span></td>
            <td><span class="badge badge-${incidencia.estado.toLowerCase()}">${incidencia.estado}</span></td>
            <td>${incidencia.empleado || 'Sin asignar'}</td>
            <td>
                <button class="btn-action btn-assign" onclick="abrirModalAsignar('${incidencia.codigo}')">Asignar</button>
                <button class="btn-action btn-cancel-incident" onclick="cancelarIncidencia('${incidencia.codigo}')">Cancelar</button>
            </td>
        `;
		tbody.appendChild(fila);
	});
}

// ====================================
// GESTIONAR INCIDENCIAS
// ====================================

function abrirModalAsignar(codigoIncidencia) {
	incidenciaSeleccionada = codigoIncidencia;

	// Cargar empleados en el select
	const selectEmpleados = document.getElementById('empleado-select');
	selectEmpleados.innerHTML = '<option value="">Seleccione un empleado...</option>';

	empleadosSistemas.forEach((empleado) => {
		const option = document.createElement('option');
		option.value = empleado.id;
		option.textContent = empleado.nombre;
		selectEmpleados.appendChild(option);
	});

	// Mostrar modal
	document.getElementById('modal-asignar').classList.add('active');
}

function cerrarModalAsignar() {
	document.getElementById('modal-asignar').classList.remove('active');
	incidenciaSeleccionada = null;
	document.getElementById('empleado-select').value = '';
}

function confirmarAsignacion() {
	const empleadoId = document.getElementById('empleado-select').value;

	if (!empleadoId) {
		alert('Por favor, selecciona un empleado');
		return;
	}

	// Encontrar el empleado seleccionado
	const empleadoSeleccionado = empleadosSistemas.find(
		(emp) => emp.id == empleadoId
	);

	if (empleadoSeleccionado) {
		// Actualizar la incidencia con el empleado asignado
		const incidencia = incidenciasActuales.find(
			(inc) => inc.codigo === incidenciaSeleccionada
		);

		if (incidencia) {
			incidencia.empleado = empleadoSeleccionado.nombre;

			// Aquí se haría la petición al servidor para actualizar
			console.log(
				`Incidencia ${incidenciaSeleccionada} asignada a ${empleadoSeleccionado.nombre}`
			);

			// Actualizar tabla
			actualizarTablaIncidencias();

			// Cerrar modal
			cerrarModalAsignar();

			// Mostrar confirmación
			alert(
				`Incidencia asignada a ${empleadoSeleccionado.nombre} exitosamente`
			);
		}
	}
}

function cancelarIncidencia(codigoIncidencia) {
	const confirmacion = confirm(
		`¿Desea cancelar esta incidencia?\n\nCódigo: ${codigoIncidencia}`
	);

	if (confirmacion) {
		// Encontrar y actualizar la incidencia
		const incidencia = incidenciasActuales.find(
			(inc) => inc.codigo === codigoIncidencia
		);

		if (incidencia) {
			incidencia.estado = 'Cancelado';

			// Aquí se haría la petición al servidor para actualizar
			console.log(`Incidencia ${codigoIncidencia} cancelada`);

			// Actualizar tabla
			actualizarTablaIncidencias();

			// Actualizar estadísticas
			actualizarEstadisticas();

			// Mostrar confirmación
			alert('Incidencia cancelada exitosamente');
		}
	}
}

// ====================================
// TABLA DE REPORTES
// ====================================

function actualizarTablaReportes() {
	const tbody = document
		.getElementById('reportes-table')
		.querySelector('tbody');
	tbody.innerHTML = '';

	// Aplicar filtros
	const datosFiltrados = aplicarFiltrosReportes();

	// Si no hay incidencias, mostrar mensaje vacío
	if (datosFiltrados.length === 0) {
		const fila = document.createElement('tr');
		fila.innerHTML =
			'<td colspan="6" style="text-align: center; color: var(--gray-500); padding: 2rem;">No hay incidencias que coincidan con los filtros</td>';
		tbody.appendChild(fila);
		return;
	}

	datosFiltrados.forEach((incidencia) => {
		const fila = document.createElement('tr');
		const fechaFormato = new Date(incidencia.fecha).toLocaleDateString(
			'es-ES'
		);
		fila.innerHTML = `
            <td>${incidencia.codigo}</td>
            <td>${fechaFormato}</td>
            <td>${incidencia.articulo}</td>
            <td><span class="badge badge-${incidencia.prioridad.toLowerCase()}">${incidencia.prioridad}</span></td>
            <td><span class="badge badge-${incidencia.estado.toLowerCase()}">${incidencia.estado}</span></td>
            <td>${incidencia.empleado || 'Sin asignar'}</td>
        `;
		tbody.appendChild(fila);
	});
}

// ====================================
// FILTROS DE REPORTES
// ====================================

function configurarFiltros() {
	const filtros = document.querySelectorAll(
		'#filter-codigo, #filter-fecha, #filter-articulo, #filter-prioridad, #filter-estado, #filter-empleado'
	);

	filtros.forEach((filtro) => {
		filtro.addEventListener('change', actualizarTablaReportes);
		filtro.addEventListener('input', actualizarTablaReportes);
	});

	document
		.getElementById('btn-limpiar-filtros')
		.addEventListener('click', limpiarFiltros);
}

function aplicarFiltrosReportes() {
	const codigo = document
		.getElementById('filter-codigo')
		.value.toLowerCase()
		.trim();
	const fecha = document.getElementById('filter-fecha').value;
	const articulo = document
		.getElementById('filter-articulo')
		.value.toLowerCase()
		.trim();
	const prioridad = document.getElementById('filter-prioridad').value;
	const estado = document.getElementById('filter-estado').value;
	const empleado = document
		.getElementById('filter-empleado')
		.value.toLowerCase()
		.trim();

	return incidenciasCompletas.filter((incidencia) => {
		// Filtro por código
		if (codigo && !incidencia.codigo.toLowerCase().includes(codigo)) {
			return false;
		}

		// Filtro por fecha
		if (fecha) {
			const fechaIncidencia = new Date(incidencia.fecha)
				.toISOString()
				.split('T')[0];
			if (fechaIncidencia !== fecha) {
				return false;
			}
		}

		// Filtro por artículo
		if (articulo && !incidencia.articulo.toLowerCase().includes(articulo)) {
			return false;
		}

		// Filtro por prioridad
		if (prioridad && incidencia.prioridad !== prioridad) {
			return false;
		}

		// Filtro por estado
		if (estado && incidencia.estado !== estado) {
			return false;
		}

		// Filtro por empleado
		if (empleado) {
			const empleadoIncidencia = (incidencia.empleado || '')
				.toLowerCase()
				.trim();
			if (!empleadoIncidencia.includes(empleado)) {
				return false;
			}
		}

		return true;
	});
}

function limpiarFiltros() {
	document.getElementById('filter-codigo').value = '';
	document.getElementById('filter-fecha').value = '';
	document.getElementById('filter-articulo').value = '';
	document.getElementById('filter-prioridad').value = '';
	document.getElementById('filter-estado').value = '';
	document.getElementById('filter-empleado').value = '';

	actualizarTablaReportes();
}

// ====================================
// UTILIDADES
// ====================================

// Función para formatear fechas
function formatearFecha(fecha) {
	return new Date(fecha).toLocaleDateString('es-ES', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	});
}

// Función para obtener badge de prioridad
function getBadgePrioridad(prioridad) {
	const badges = {
		Crítica: 'badge-crítica',
		Alta: 'badge-alta',
		Media: 'badge-media',
		Baja: 'badge-baja',
	};
	return badges[prioridad] || '';
}

// Función para obtener badge de estado
function getBadgeEstado(estado) {
	const badges = {
		Pendiente: 'badge-pendiente',
		'En Proceso': 'badge-en-proceso',
		Resuelto: 'badge-resuelto',
		Cancelado: 'badge-cancelado',
	};
	return badges[estado] || '';
}
