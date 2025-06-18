  // Variables globales
        let selectedUserType = 'client';

        // Initialisation
        document.addEventListener('DOMContentLoaded', function() {
            setupEventListeners();
            selectUserType('client');
        });

        function setupEventListeners() {
            // Navigation entre onglets
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    switchTab(this.dataset.tab);
                });
            });

            // Sélection du type d'utilisateur
            document.querySelectorAll('.user-type-card').forEach(card => {
                card.addEventListener('click', function() {
                    selectUserType(this.dataset.type);
                });
            });

            // Soumission des formulaires
            document.getElementById('loginForm').addEventListener('submit', handleLogin);
            document.getElementById('registerForm').addEventListener('submit', handleRegister);

            // Validation en temps réel
            document.getElementById('confirmPassword').addEventListener('input', validatePasswordMatch);
            document.getElementById('registerPassword').addEventListener('input', validatePasswordMatch);
        }

        function switchTab(tabName) {
            // Mettre à jour les boutons
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

            // Mettre à jour les formulaires
            document.querySelectorAll('.auth-form').forEach(form => {
                form.classList.remove('active');
            });
            document.getElementById(tabName + 'Form').classList.add('active');

            // Effacer les alertes
            clearAlerts();
        }

        function selectUserType(type) {
            selectedUserType = type;
            
            document.querySelectorAll('.user-type-card').forEach(card => {
                card.classList.remove('selected');
            });
            document.querySelector(`[data-type="${type}"]`).classList.add('selected');

            // Afficher des champs supplémentaires pour admin si nécessaire
            if (type === 'admin') {
                // Vous pouvez ajouter des champs spécifiques aux admins ici
                console.log('Mode administrateur sélectionné');
            }
        }

        function togglePassword(fieldId) {
            const field = document.getElementById(fieldId);
            const toggle = field.nextElementSibling;
            
            if (field.type === 'password') {
                field.type = 'text';
                toggle.textContent = '🙈';
            } else {
                field.type = 'password';
                toggle.textContent = '👁️';
            }
        }

        function validatePasswordMatch() {
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const confirmField = document.getElementById('confirmPassword');
            
            if (confirmPassword && password !== confirmPassword) {
                confirmField.style.borderColor = '#e74c3c';
                showAlert('Les mots de passe ne correspondent pas', 'danger');
            } else {
                confirmField.style.borderColor = '#e9ecef';
                clearAlerts();
            }
        }



async function handleLogin(e) {
    e.preventDefault();

    const btn = e.target.querySelector('.btn');
    const formData = new FormData(e.target);
    
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
        showAlert('Veuillez remplir tous les champs', 'danger');
        return;
    }

    btn.classList.add('loading');
    btn.textContent = '';

    try {
        console.log("Appel API login avec:", {email, password});
        const response = await ApiService.login({ email, password });
        console.log("Réponse API:", response);

        if (response.success) {
            localStorage.setItem('token', response.user.id);
            localStorage.setItem("userName", response.user.name) ;
            localStorage.setItem("userEmail", response.user.email) ;
            localStorage.setItem("userPhone", response.user.phone);
            showAlert('Connexion réussie !', 'success');
            setTimeout(() => window.location.href = 'main.html', 1500);
        } else {
            showAlert('Erreur de connexion : ' + response.message, 'danger');
        }
    } catch (error) {
        console.error("Erreur API:", error);
        showAlert('Une erreur est survenue.', 'danger');
    } finally {
        btn.classList.remove('loading');
        btn.textContent = 'Se connecter';
    }
}

async function handleRegister(e) {
    e.preventDefault();

    const btn = e.target.querySelector('.btn');
    const formData = new FormData(e.target);

    // Validation
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const terms = formData.get('terms');

    if (!name || !email || !phone || !password || !confirmPassword) {
        showAlert('Veuillez remplir tous les champs', 'danger');
        return;
    }

    if (password !== confirmPassword) {
        showAlert('Les mots de passe ne correspondent pas', 'danger');
        return;
    }

    if (password.length < 6) {
        showAlert('Le mot de passe doit contenir au moins 6 caractères', 'danger');
        return;
    }

    if (!terms) {
        showAlert('Veuillez accepter les conditions d\'utilisation', 'danger');
        return;
    }

    // Animation de chargement
    btn.classList.add('loading');
    btn.textContent = '';

    try {
        const userData = {
            name,
            email,
            phone,
            password,
            userType: selectedUserType
        };

        // Appel réel à l'API
        const response = await ApiService.register(userData);

        if (response.success) {
            showAlert(`Compte ${selectedUserType} créé avec succès ! Vérifiez votre email pour l'activation.`, 'success');

            // Réinitialiser le formulaire
            e.target.reset();
            selectUserType('client');

            // Basculer vers la connexion après 3 secondes
            setTimeout(() => {
                switchTab('login');
                showAlert('Vous pouvez maintenant vous connecter', 'info');
            }, 3000);
        } else {
            showAlert(response.message || 'Erreur lors de la création du compte.', 'danger');
        }
    } catch (error) {
        console.error(error);
        showAlert('Erreur serveur ou réseau. Veuillez réessayer plus tard.', 'danger');
    } finally {
        btn.classList.remove('loading');
        btn.textContent = 'Créer mon compte';
    }
}


        function socialLogin(provider) {
            showAlert(`Connexion via ${provider} en cours...`, 'info');
            
            // Simulation de connexion sociale
            setTimeout(() => {
                showAlert(`Connexion ${provider} réussie ! Redirection...`, 'success');
                setTimeout(() => {
                    window.location.href = '#booking-platform';
                }, 2000);
            }, 1500);
        }

        function showForgotPassword() {
            const email = prompt('Entrez votre adresse email pour réinitialiser votre mot de passe:');
            
            if (email && email.includes('@')) {
                showAlert('Un email de réinitialisation a été envoyé à ' + email, 'success');
            } else if (email) {
                showAlert('Adresse email invalide', 'danger');
            }
        }

        function showAlert(message, type) {
            const alertContainer = document.getElementById('alertContainer');
            const alert = document.createElement('div');
            alert.className = `alert alert-${type}`;
            
            // Icône selon le type
            let icon = '';
            switch(type) {
                case 'success': icon = '✅'; break;
                case 'danger': icon = '❌'; break;
                case 'warning': icon = '⚠️'; break;
                case 'info': icon = 'ℹ️'; break;
                default: icon = 'ℹ️';
            }
            
            alert.innerHTML = `${icon} ${message}`;
            
            // Supprimer les alertes précédentes
            alertContainer.innerHTML = '';
            alertContainer.appendChild(alert);
            
            // Faire défiler vers l'alerte
            alert.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Supprimer l'alerte après 5 secondes (sauf pour les succès qui restent plus longtemps)
            const timeout = type === 'success' ? 8000 : 5000;
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.remove();
                }
            }, timeout);
        }

        function clearAlerts() {
            const alertContainer = document.getElementById('alertContainer');
            alertContainer.innerHTML = '';
        }

        function goToBooking() {
            showAlert('Redirection vers la plateforme de réservation...', 'info');
            setTimeout(() => {
                // Ici vous pourriez rediriger vers votre page de réservation
                console.log('Redirection vers la réservation');
            }, 1000);
        }

            // Animation d'entrée pour les éléments
        function animateElement(element, animationClass) {
            element.classList.add(animationClass);
            setTimeout(() => {
                element.classList.remove(animationClass);
            }, 600);
        }


        // Sauvegarde locale des préférences utilisateur
        function saveUserPreferences(preferences) {
            localStorage.setItem('stadeFoot_preferences', JSON.stringify(preferences));
        }

        function loadUserPreferences() {
            const saved = localStorage.getItem('stadeFoot_preferences');
            return saved ? JSON.parse(saved) : null;
        }


        // Validation de la force du mot de passe
        function checkPasswordStrength(password) {
            let strength = 0;
            let feedback = [];

            if (password.length >= 8) strength++;
            else feedback.push('Au moins 8 caractères');

            if (/[a-z]/.test(password)) strength++;
            else feedback.push('Une minuscule');

            if (/[A-Z]/.test(password)) strength++;
            else feedback.push('Une majuscule');

            if (/[0-9]/.test(password)) strength++;
            else feedback.push('Un chiffre');

            if (/[^A-Za-z0-9]/.test(password)) strength++;
            else feedback.push('Un caractère spécial');

            return {
                score: strength,
                feedback: feedback,
                level: strength < 2 ? 'Faible' : strength < 4 ? 'Moyen' : 'Fort'
            };
        }

   

        // Initialisation finale
        window.addEventListener('load', function() {
            
            // Animation d'entrée
            const container = document.querySelector('.auth-container');
            container.style.opacity = '0';
            setTimeout(() => {
                container.style.transition = 'opacity 0.5s ease';
                container.style.opacity = '1';
            }, 100);
            
            // Message de bienvenue après un délai
            setTimeout(() => {
                if (!document.querySelector('.alert')) {
                    showAlert('Bienvenue sur StadeFoot ! 🏟️', 'info');
                }
            }, 2000);
        });

        // Export des fonctions principales pour utilisation externe
        window.StadeFootAuth = {
            login: handleLogin,
            register: handleRegister,
            socialLogin: socialLogin,
            showAlert: showAlert,
            switchTab: switchTab
        };


 

       