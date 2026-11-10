// ====================================
// FUNCIONALIDAD DEL FORMULARIO DE LOGIN
// ====================================

document.addEventListener('DOMContentLoaded', () => {
	const loginForm = document.getElementById('login-form');
	const emailInput = document.getElementById('email');
	const passwordInput = document.getElementById('password');
	const passwordToggle = document.getElementById('password-toggle');
	const formMessage = document.getElementById('form-message');
	const forgotLink = document.getElementById('forgot-link');

	// ====================================
	// TOGGLE DE VISIBILIDAD DE CONTRASEÑA
	// ====================================

	passwordToggle?.addEventListener('click', (e) => {
		e.preventDefault();
		const isPassword = passwordInput.type === 'password';
		passwordInput.type = isPassword ? 'text' : 'password';
		passwordToggle.textContent = isPassword ? 'Ocultar' : 'Mostrar';
		passwordToggle.setAttribute('aria-label', isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña');
	});

	// ====================================
	// VALIDACIÓN DEL FORMULARIO
	// ====================================

	const validateEmail = (email) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$|^[a-zA-Z0-9._-]+$/;
		return emailRegex.test(email);
	};

	const validatePassword = (password) => {
		return password && password.length >= 4;
	};

	const showMessage = (message, type = 'error') => {
		formMessage.textContent = message;
		formMessage.className = `form-message ${type}`;
		formMessage.setAttribute('role', 'alert');

		if (type === 'success') {
			setTimeout(() => {
				formMessage.className = 'form-message';
			}, 3000);
		}
	};

	const clearMessage = () => {
		formMessage.className = 'form-message';
		formMessage.textContent = '';
	};

	// ====================================
	// MANEJO DEL ENVÍO DEL FORMULARIO
	// ====================================

	loginForm?.addEventListener('submit', async (e) => {
		e.preventDefault();
		clearMessage();

		const email = emailInput.value.trim();
		const password = passwordInput.value.trim();
		const remember = Boolean(loginForm.querySelector('input[name="remember"]')?.checked);
		const submitButton = loginForm.querySelector('.submit-button');

		// Validaciones
		if (!email) {
			showMessage('Por favor ingresá tu usuario o correo electrónico.');
			emailInput.focus();
			return;
		}

		if (!validateEmail(email)) {
			showMessage('Por favor ingresá un usuario o correo válido.');
			emailInput.focus();
			return;
		}

		if (!password) {
			showMessage('Por favor ingresá tu contraseña.');
			passwordInput.focus();
			return;
		}

		if (!validatePassword(password)) {
			showMessage('La contraseña debe tener al menos 4 caracteres.');
			passwordInput.focus();
			return;
		}

		submitButton.disabled = true;
		submitButton.textContent = 'Iniciando sesión...';

		try {
			const response = await fetch('http://localhost:3000/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ usuario: email, contrasenia: password })
			});

			const data = await response.json().catch(() => ({}));

			if (!response.ok) {
				let errorMsg = 'Nombre de usuario y/o contraseña incorrectos.';
				if (typeof data.mensaje === 'string') {
					errorMsg = data.mensaje;
				} else if (data.mensaje && typeof data.mensaje === 'object') {
					const firstError = Object.values(data.mensaje).find((item) => item?.msg);
					if (firstError?.msg) errorMsg = firstError.msg;
				} else if (data.error) {
					errorMsg = data.error;
				}
				showMessage(errorMsg);
				return;
			}

			const token = data.token;
			const usuario = data.usuario || window.PortalAuth?.parseToken(token);
			const destino = window.PortalAuth?.getHomePathForRole(usuario?.rol);

			if (!token || !destino) {
				showMessage('Tu usuario no tiene un rol válido asignado para ingresar al portal.');
				return;
			}

			window.PortalAuth.saveSession(token, usuario, remember);
			showMessage('¡Sesión iniciada correctamente!', 'success');

			setTimeout(() => {
				window.location.href = destino;
			}, 400);
		} catch (error) {
			showMessage('No se pudo conectar con el servidor. Verificá que el backend esté activo.');
		} finally {
			submitButton.disabled = false;
			submitButton.innerHTML = 'Ingresar <span aria-hidden="true">→</span>';
		}
	});

	// ====================================
	// LIMPIAR MENSAJE DE ERROR AL EDITAR
	// ====================================

	[emailInput, passwordInput].forEach((input) => {
		input?.addEventListener('input', clearMessage);
	});

	// ====================================
	// ENLACE "¿LA OLVIDASTE?"
	// ====================================

	forgotLink?.addEventListener('click', (e) => {
		e.preventDefault();
		showMessage('Por favor, contactá a soporte para recuperar tu contraseña.', 'info');

		// En una aplicación real:
		// window.location.href = '/recover-password';
	});

	// ====================================
	// ENTER PARA ENVIAR FORMULARIO
	// ====================================

	[emailInput, passwordInput].forEach((input) => {
		input?.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') {
				loginForm.dispatchEvent(new Event('submit'));
			}
		});
	});

	// ====================================
	// ACCESIBILIDAD: ANUNCIAR ESTADO
	// ====================================

	const announceToScreenReader = (message) => {
		const announcement = document.createElement('div');
		announcement.setAttribute('role', 'status');
		announcement.setAttribute('aria-live', 'polite');
		announcement.className = 'sr-only';
		announcement.textContent = message;
		document.body.appendChild(announcement);

		setTimeout(() => announcement.remove(), 1000);
	};

	// ====================================
	// EFECTO DE ENFOQUE EN INPUTS
	// ====================================

	[emailInput, passwordInput].forEach((input) => {
		input?.addEventListener('focus', () => {
			input.parentElement.style.boxShadow = '0 0 0 3px rgba(0, 132, 209, 0.1)';
		});

		input?.addEventListener('blur', () => {
			input.parentElement.style.boxShadow = '';
		});
	});
});

// ====================================
// OCULTAR MENSAJE DE ERROR AL SALIR
// ====================================

window.addEventListener('beforeunload', () => {
	const formMessage = document.getElementById('form-message');
	if (formMessage) {
		formMessage.className = 'form-message';
	}
});
