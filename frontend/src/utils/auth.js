// ====================================
// UTILIDADES DE SESIÓN Y CONTROL DE ROLES
// ====================================

(() => {
	const TOKEN_KEY = 'auth_token';
	const USER_KEY = 'auth_usuario';

	// Rutas iniciales permitidas por rol (relativas a la raíz de frontend)
	const ROLE_ROUTES = {
		1: 'src/pages/director/director-dashboard.html',
		2: 'src/pages/empleado-sistemas/sistemas-incidencias.html',
		3: 'src/pages/empleado-municipal/municipal-incidencias.html'
	};

	const resolveAppPath = (relativePath) => {
		const isInsidePages = window.location.pathname.includes('/src/pages/');
		const prefix = isInsidePages ? '../../..' : '.';
		return `${prefix}/${relativePath}`;
	};

	const parseToken = (token) => {
		if (!token || typeof token !== 'string') return null;
		const parts = token.split('.');
		if (parts.length !== 3) return null;

		try {
			const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
			const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
			const json = decodeURIComponent(
				atob(padded)
					.split('')
					.map((ch) => `%${`00${ch.charCodeAt(0).toString(16)}`.slice(-2)}`)
					.join('')
			);
			return JSON.parse(json);
		} catch {
			return null;
		}
	};

	const isTokenValid = (token) => {
		const payload = parseToken(token);
		if (!payload) return false;
		if (payload.exp && payload.exp * 1000 <= Date.now()) {
			return false;
		}
		return true;
	};

	const clearSession = () => {
		localStorage.removeItem(TOKEN_KEY);
		localStorage.removeItem(USER_KEY);
		sessionStorage.removeItem(TOKEN_KEY);
		sessionStorage.removeItem(USER_KEY);
	};

	const saveSession = (token, usuario, remember = false) => {
		clearSession();
		const storage = remember ? localStorage : sessionStorage;
		storage.setItem(TOKEN_KEY, token);
		if (usuario) {
			storage.setItem(USER_KEY, JSON.stringify(usuario));
		}
	};

	const getSession = () => {
		const token = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
		if (!token || !isTokenValid(token)) {
			clearSession();
			return null;
		}

		const rawUser = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
		let usuario = null;
		if (rawUser) {
			try {
				usuario = JSON.parse(rawUser);
			} catch {
				usuario = null;
			}
		}

		if (!usuario) {
			usuario = parseToken(token);
		}

		return { token, usuario };
	};

	const getHomePathForRole = (rol) => {
		const route = ROLE_ROUTES[Number(rol)];
		return route ? resolveAppPath(route) : null;
	};

	const requireRole = (allowedRoles = []) => {
		const session = getSession();
		if (!session) {
			window.location.replace(resolveAppPath('index.html'));
			return false;
		}

		const rol = Number(session.usuario?.rol);
		if (allowedRoles.includes(rol)) {
			return true;
		}

		const fallbackHome = getHomePathForRole(rol);
		if (fallbackHome) {
			window.location.replace(fallbackHome);
		} else {
			clearSession();
			window.location.replace(resolveAppPath('index.html'));
		}
		return false;
	};

	const authHeaders = (extraHeaders = {}) => {
		const session = getSession();
		if (!session?.token) return { ...extraHeaders };
		return {
			...extraHeaders,
			Authorization: `Bearer ${session.token}`
		};
	};

	window.PortalAuth = {
		parseToken,
		saveSession,
		clearSession,
		getSession,
		getHomePathForRole,
		requireRole,
		authHeaders
	};

	document.addEventListener('DOMContentLoaded', () => {
		document.querySelectorAll('.logout-btn').forEach((btn) => {
			btn.addEventListener('click', () => {
				clearSession();
			});
		});
	});

	const rolesAttr = document.currentScript?.getAttribute('data-roles');
	if (rolesAttr) {
		const allowedRoles = rolesAttr
			.split(',')
			.map((r) => Number(r.trim()))
			.filter((r) => Number.isInteger(r) && r > 0);
		requireRole(allowedRoles);
	}
})();

