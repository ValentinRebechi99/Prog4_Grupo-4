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

		// Simular envío (en una aplicación real, aquí irían las credenciales al servidor)
		submitButton.disabled = true;
		submitButton.textContent = 'Iniciando sesión...';

		try {
			// Simular llamada al servidor
			await new Promise((resolve) => setTimeout(resolve, 1500));

			// Aquí iría la lógica real de autenticación
			showMessage('¡Sesión iniciada correctamente!', 'success');

			// Simular redirección (comentado para demostración)
			// setTimeout(() => {
			//     window.location.href = '/dashboard';
			// }, 1000);
		} catch (error) {
			showMessage('Error al iniciar sesión. Por favor, intenta nuevamente.');
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
