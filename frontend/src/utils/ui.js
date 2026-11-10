// ====================================
// UTILIDADES DE DIÁLOGOS MODALES DEL PORTAL
// ====================================

(() => {
	const createModalShell = ({ title, type = 'info', maxWidth = '460px' }) => {
		const overlay = document.createElement('div');
		overlay.className = 'modal active portal-dialog-modal';
		overlay.setAttribute('role', 'dialog');
		overlay.setAttribute('aria-modal', 'true');

		const card = document.createElement('div');
		card.className = 'modal-content portal-dialog-content';
		card.style.maxWidth = maxWidth;

		const closeBtn = document.createElement('span');
		closeBtn.className = 'close-modal';
		closeBtn.setAttribute('role', 'button');
		closeBtn.setAttribute('aria-label', 'Cerrar');
		closeBtn.textContent = '×';

		const header = document.createElement('div');
		header.className = 'modal-header portal-dialog-header';

		const titleWrap = document.createElement('div');
		titleWrap.className = 'portal-dialog-title-wrap';

		if (type) {
			const icon = document.createElement('span');
			icon.className = `portal-dialog-icon portal-dialog-icon--${type}`;
			icon.setAttribute('aria-hidden', 'true');
			icon.textContent = type === 'success' ? '✓' : type === 'error' ? '!' : type === 'warning' ? '!' : 'i';
			titleWrap.appendChild(icon);
		}

		const heading = document.createElement('h3');
		heading.textContent = title;
		titleWrap.appendChild(heading);

		header.appendChild(titleWrap);

		const body = document.createElement('div');
		body.className = 'modal-body portal-dialog-body';

		const footer = document.createElement('div');
		footer.className = 'form-buttons portal-dialog-footer';

		card.appendChild(closeBtn);
		card.appendChild(header);
		card.appendChild(body);
		card.appendChild(footer);
		overlay.appendChild(card);

		return { overlay, closeBtn, body, footer };
	};

	const mountModal = (shell, onCancel, focusEl) => {
		document.body.appendChild(shell.overlay);

		const cleanup = () => {
			document.removeEventListener('keydown', handleKeydown);
			shell.overlay.remove();
		};

		const handleKeydown = (e) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				onCancel();
			}
		};

		shell.closeBtn.addEventListener('click', onCancel);
		shell.overlay.addEventListener('click', (e) => {
			if (e.target === shell.overlay) {
				onCancel();
			}
		});
		document.addEventListener('keydown', handleKeydown);

		if (focusEl) {
			requestAnimationFrame(() => focusEl.focus());
		}

		return cleanup;
	};

	const showAlert = ({ title = 'Aviso', message = '', type = 'info', confirmText = 'Aceptar' } = {}) => {
		return new Promise((resolve) => {
			const shell = createModalShell({ title, type });

			const text = document.createElement('p');
			text.className = 'portal-dialog-message';
			text.textContent = message;
			shell.body.appendChild(text);

			const okBtn = document.createElement('button');
			okBtn.type = 'button';
			okBtn.className = type === 'error' ? 'btn-submit portal-btn-danger' : 'btn-submit';
			okBtn.textContent = confirmText;
			shell.footer.appendChild(okBtn);

			let cleanup = () => {};
			const close = () => {
				cleanup();
				resolve(true);
			};

			okBtn.addEventListener('click', close);
			cleanup = mountModal(shell, close, okBtn);
		});
	};

	const showConfirm = ({
		title = 'Confirmar acción',
		message = '',
		type = 'warning',
		confirmText = 'Confirmar',
		cancelText = 'Cancelar',
		danger = false
	} = {}) => {
		return new Promise((resolve) => {
			const shell = createModalShell({ title, type });

			const text = document.createElement('p');
			text.className = 'portal-dialog-message';
			text.textContent = message;
			shell.body.appendChild(text);

			const cancelBtn = document.createElement('button');
			cancelBtn.type = 'button';
			cancelBtn.className = 'btn-cancel';
			cancelBtn.textContent = cancelText;

			const confirmBtn = document.createElement('button');
			confirmBtn.type = 'button';
			confirmBtn.className = danger ? 'btn-submit portal-btn-danger' : 'btn-submit';
			confirmBtn.textContent = confirmText;

			shell.footer.appendChild(confirmBtn);
			shell.footer.appendChild(cancelBtn);

			let cleanup = () => {};
			const finish = (result) => {
				cleanup();
				resolve(result);
			};

			confirmBtn.addEventListener('click', () => finish(true));
			cancelBtn.addEventListener('click', () => finish(false));
			cleanup = mountModal(shell, () => finish(false), confirmBtn);
		});
	};

	const showPrompt = ({
		title = 'Ingresar comentario',
		label = 'Descripción:',
		placeholder = '',
		defaultValue = '',
		confirmText = 'Aceptar',
		cancelText = 'Cancelar'
	} = {}) => {
		return new Promise((resolve) => {
			const shell = createModalShell({ title, type: null, maxWidth: '500px' });

			const form = document.createElement('form');
			form.className = 'portal-dialog-form';

			const group = document.createElement('div');
			group.className = 'form-group';
			group.style.marginBottom = '0';

			const labelEl = document.createElement('label');
			const inputId = `portal-prompt-input-${Date.now()}`;
			labelEl.setAttribute('for', inputId);
			labelEl.textContent = label;

			const textarea = document.createElement('textarea');
			textarea.id = inputId;
			textarea.placeholder = placeholder;
			textarea.value = defaultValue;
			textarea.rows = 4;

			group.appendChild(labelEl);
			group.appendChild(textarea);
			form.appendChild(group);
			shell.body.appendChild(form);

			const submitBtn = document.createElement('button');
			submitBtn.type = 'submit';
			submitBtn.className = 'btn-submit';
			submitBtn.textContent = confirmText;

			const cancelBtn = document.createElement('button');
			cancelBtn.type = 'button';
			cancelBtn.className = 'btn-cancel';
			cancelBtn.textContent = cancelText;

			shell.footer.appendChild(submitBtn);
			shell.footer.appendChild(cancelBtn);

			// Mover footer dentro del form para soportar Enter / submit
			form.appendChild(shell.footer);

			let cleanup = () => {};
			const finish = (result) => {
				cleanup();
				resolve(result);
			};

			form.addEventListener('submit', (e) => {
				e.preventDefault();
				finish(textarea.value.trim());
			});
			cancelBtn.addEventListener('click', () => finish(null));
			cleanup = mountModal(shell, () => finish(null), textarea);
		});
	};

	window.PortalUI = {
		alert: showAlert,
		confirm: showConfirm,
		prompt: showPrompt
	};
})();

