/**
 * ============================================================================
 * CLIQUE SEGURO - SCRIPT PRINCIPAL (Sem Modo Foco)
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    // ========================================================================
    // 1. INICIALIZAÇÃO E TRANSIÇÕES DE PÁGINA (Linha do Tempo Refinada)
    // ========================================================================
    requestAnimationFrame(() => body.classList.add('page-loaded'));

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn[href]');
        if (!btn || btn.classList.contains('is-active-lock')) return;

        e.preventDefault();

        // ⏱️ PAINEL DE CONTROLE DE TEMPOS (em milissegundos)
        // Todos contam a partir do momento do clique (0ms)
        const t_afundar      = 1;    // Botão desce
        const t_sumir_texto  = 1;  // O texto começa a desaparecer
        const t_aparecer_roda = 1;  // A rodinha de loading surge
        const t_saida_pagina = 600; // A tela começa a escurecer (fade out)
        const t_redirecionar = 1400; // O navegador muda de página

        setTimeout(() => {
            btn.classList.add('is-active-lock');
        }, t_afundar);

        setTimeout(() => {
            btn.classList.add('text-hide');
        }, t_sumir_texto);

        setTimeout(() => {
            btn.classList.add('is-loading');
        }, t_aparecer_roda);

        setTimeout(() => {
            body.classList.add('page-exit');
        }, t_saida_pagina);

        setTimeout(() => {
            window.location.href = btn.getAttribute('href');
        }, t_redirecionar);
    });
    
    // ========================================================================
    // 2. CABEÇALHO INTELIGENTE E MENU SLIDER
    // ========================================================================
    const header = document.querySelector('header');
    if (header) {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    header.classList.toggle('header-scrolled', window.scrollY > 60);
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    const nav = document.querySelector('nav');
    if (nav) {
        let indicator = nav.querySelector('.nav-indicator') || (() => {
            const ind = document.createElement('div');
            ind.className = 'nav-indicator';
            return nav.appendChild(ind);
        })();

        let activeLink = nav.querySelector('a.active');

        const moveIndicator = (el) => {
            if (!el) return;
            indicator.style.cssText = `width:${el.offsetWidth}px; height:${el.offsetHeight}px; left:${el.offsetLeft}px; top:${el.offsetTop}px; opacity:1;`;
        };

        nav.addEventListener('mouseover', (e) => {
            if (e.target.tagName === 'A') moveIndicator(e.target);
        });

        nav.addEventListener('mouseleave', () => {
            activeLink ? moveIndicator(activeLink) : indicator.style.opacity = '0';
        });

        if (activeLink) requestAnimationFrame(() => moveIndicator(activeLink));
    }

    // ========================================================================
    // 3. LÓGICA DE SANFONAS SIMPLES (ABRIR E FECHAR)
    // ========================================================================
    document.addEventListener('click', (e) => {
        const faqQuestion = e.target.closest('.faq-question');
        if (faqQuestion) {
            e.preventDefault();
            const currentItem = faqQuestion.parentElement;
            const isActive = currentItem.classList.contains('active');

            // Fecha todas as sanfonas ativas
            document.querySelectorAll('.faq-item.active').forEach(item => {
                item.classList.remove('active');
            });

            // Se a que foi clicada não estava ativa, abre-a
            if (!isActive) {
                currentItem.classList.add('active');
                // Opcional: focar no primeiro input quando abre
                setTimeout(() => currentItem.querySelector('input')?.focus(), 300);
            }
        }
    });

    // ========================================================================
    // 4. LÓGICA DOS FORMULÁRIOS DE CÓDIGO (LOGIN/REGISTRO)
    // ========================================================================
    const setupCodeHandler = (btnId, groupId, nameId, contactId) => {
        const btn = document.getElementById(btnId);
        if (!btn) return;

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const nameInput = document.getElementById(nameId);
            const contactInput = document.getElementById(contactId);
            const group = document.getElementById(groupId);

            if (!nameInput.value.trim() || !contactInput.value.trim()) {
                alert('Por favor, preencha todos os campos antes de continuar.');
                return nameInput.focus();
            }

            // Revela a caixa do código SMS/WhatsApp
            group.style.display = 'flex';
            btn.style.display = 'none';

            // Bloqueia os inputs anteriores
            nameInput.disabled = contactInput.disabled = true;
            nameInput.style.opacity = contactInput.style.opacity = '0.6';

            // Foca no input do código
            group.querySelector('.code-input')?.focus();
        });
    };

    setupCodeHandler('btn-get-code-login', 'login-code-group', 'login-nome', 'login-contato');
    setupCodeHandler('btn-get-code-register', 'register-code-group', 'register-nome', 'register-contato');
});

// ============================================================================
// 5. CORREÇÃO DE NAVEGAÇÃO BFCache (iOS/Safari)
// ============================================================================
window.addEventListener('pageshow', (e) => {
    if (e.persisted || (window.performance && window.performance.navigation.type === 2)) {
        document.body.classList.remove('page-exit');
        
        // Limpa todas as classes e estilos aplicados durante a animação
        document.querySelectorAll('.btn').forEach(b => {
            b.classList.remove('is-loading');
            b.classList.remove('is-active-lock');
            b.style.color = ''; // Devolve o texto ao botão
        });
    }
});