let matches = [];

async function loadData() {
    try {
        const response = await ApiService.getMatches();
        
        if(response["success"]){
            if (Array.isArray(response["matches"])) {
            matches = response["matches"];
            console.log("Matchs chargés :", matches);
        } else {
            console.error("Format inattendu :", response);
        }
        } else {
            console.error("Erreur :", response);
        }
       
    } catch (error) {
        console.error("Erreur lors du chargement des matchs :", error);
    }
}
function displayMatches(matches) {
            const matchList = document.getElementById('matchList');
            matchList.innerHTML = '';

           matches.forEach(match => {
                const homeTeam = match.home_team || match.homeTeam;
                const awayTeam = match.away_team || match.awayTeam;
                const matchDate = new Date(match.date);
                const daysUntilMatch = Math.ceil((matchDate - new Date()) / (1000 * 60 * 60 * 24));
                const earlyBooking = daysUntilMatch > 7;

                const matchCard = document.createElement('div');
                matchCard.className = 'match-card';
                matchCard.dataset.matchId = match.id;

                matchCard.innerHTML = `
                    <div class="match-info">
                        <div class="teams">${homeTeam} vs ${awayTeam}</div>
                        <div class="match-details">
                            <div>${formatDate(match.date)} à ${match.time}</div>
                            <div>${match.category === 'premium' ? '⭐ Match Premium' : '🏆 Match Standard'}</div>
                            ${earlyBooking ? '<div style="color: #27ae60;">📅 Réduction anticipée disponible</div>' : ''}
                        </div>
                    </div>
                `;

                matchCard.addEventListener('click', () => selectMatch(match));
                matchList.appendChild(matchCard);
            });
}
document.getElementById('searchInput').addEventListener('input', function (e) {
    const keyword = e.target.value.toLowerCase();
    const filtered = matches.filter(match =>
        match.home_team.toLowerCase().includes(keyword) ||
        match.away_team.toLowerCase().includes(keyword)
    );
    displayMatches(filtered);
});




        // Variables globales
        let selectedMatch = null;
        let selectedSection = null;
        let bookingData = {};

        // Initialisation
        document.addEventListener('DOMContentLoaded',async function() {
            await loadMatches();
            setupEventListeners();
        });

        async function loadMatches() {
            await loadData();
             displayMatches(matches);
       

        }

        function setupEventListeners() {
            // Sélection des tribunes
            document.querySelectorAll('.seating-section').forEach(section => {
                section.addEventListener('click', function() {
                    selectSection(this);
                });
            });

            // Changement de quantité
            document.getElementById('ticketQuantity').addEventListener('change', updatePrice);

            // Soumission du formulaire
            document.getElementById('bookingForm').addEventListener('submit', handleBooking);

            // Validation en temps réel
            document.querySelectorAll('input[required]').forEach(input => {
                input.addEventListener('input', validateForm);
            });
        }

        function selectMatch(match) {
            // Désélectionner le match précédent
            document.querySelectorAll('.match-card').forEach(card => {
                card.classList.remove('selected');
            });
            localStorage.setItem("selectMatchId",match.id)

            // Sélectionner le nouveau match
            document.querySelector(`[data-match-id="${match.id}"]`).classList.add('selected');
            selectedMatch = match;
            
            // Mettre à jour l'affichage
            document.getElementById('selectedMatch').textContent = `${match.home_team} vs ${match.away_team}`;
            
            updatePrice();
            validateForm();
        }

        function selectSection(sectionElement) {
            // Désélectionner la section précédente
            document.querySelectorAll('.seating-section').forEach(section => {
                section.classList.remove('selected');
            });

            // Sélectionner la nouvelle section
            sectionElement.classList.add('selected');
            selectedSection = {
                name: sectionElement.dataset.section,
                basePrice: parseInt(sectionElement.dataset.price)
            };

            // Mettre à jour l'affichage
            document.getElementById('selectedSection').textContent = selectedSection.name;
            
            updatePrice();
            validateForm();
        }

        function updatePrice() {
            if (!selectedMatch || !selectedSection) {
                document.getElementById('totalPrice').textContent = '0';
                return;
            }

            const quantity = parseInt(document.getElementById('ticketQuantity').value);
            const daysUntilMatch = Math.ceil((new Date(selectedMatch.date) - new Date()) / (1000 * 60 * 60 * 24));
            
            // Calcul du prix de base
            let unitPrice = selectedSection.basePrice * selectedMatch.base_price;
            
            // Réduction pour réservation anticipée (15% si plus de 7 jours)
            let discount = 0;
            if (daysUntilMatch > 7) {
                discount = unitPrice * 0.15;
                unitPrice -= discount;
            }

            const totalPrice = unitPrice * quantity;

            // Mise à jour de l'affichage
            document.getElementById('unitPrice').textContent = `${(selectedSection.basePrice * selectedMatch.base_price).toFixed(2)} €`;
            document.getElementById('earlyDiscount').textContent = discount > 0 ? `-${(discount * quantity).toFixed(2)} €` : '0 €';
            document.getElementById('totalPrice').textContent = totalPrice.toFixed(2);
            document.getElementById('ticketCount').textContent = quantity;
        }

        function validateForm() {
            const name = document.getElementById('customerName').value.trim();
            const email = document.getElementById('customerEmail').value.trim();
            const phone = document.getElementById('customerPhone').value.trim();
            
            const isValid = selectedMatch && selectedSection && name && email && phone;
            document.getElementById('bookBtn').disabled = !isValid;
        }

        function handleBooking(e) {
            e.preventDefault();
            
            if (!selectedMatch || !selectedSection) {
                showAlert('Veuillez sélectionner un match et une tribune.', 'error');
                return;
            }

            // Afficher le loader
            document.getElementById('loadingIndicator').style.display = 'block';
            document.getElementById('bookBtn').disabled = true;

            // Préparer les données de réservation
            const formData = new FormData(e.target);
            const bookingData = {
                match: selectedMatch,
                section: selectedSection,
                customerName: formData.get('customerName'),
                customerEmail: formData.get('customerEmail'),
                customerPhone: formData.get('customerPhone'),
                quantity: parseInt(formData.get('ticketQuantity')),
                totalPrice: parseFloat(document.getElementById('totalPrice').textContent)
            };

            // Simulation d'appel API
            setTimeout(() => {
                processBooking(bookingData);
            }, 2000);
        }

        function processBooking(data) {
            // Simulation du traitement de réservation
            const success = Math.random() > 0.1; // 90% de chance de succès

            document.getElementById('loadingIndicator').style.display = 'none';

            if (success) {
                const bookingId = generateBookingId();
                showAlert(
                    `Réservation confirmée ! Votre numéro de réservation est: ${bookingId}. Un email de confirmation a été envoyé à ${data.customerEmail}.`,
                    'success'
                );
                
                // Réinitialiser le formulaire
                document.getElementById('bookingForm').reset();
                resetSelection();
            } else {
                showAlert('Erreur lors de la réservation. Veuillez réessayer.', 'error');
                document.getElementById('bookBtn').disabled = false;
            }
        }

        function showAlert(message, type) {
            const alertContainer = document.getElementById('alertContainer');
            const alert = document.createElement('div');
            alert.className = `alert alert-${type}`;
            alert.textContent = message;
            
            alertContainer.innerHTML = '';
            alertContainer.appendChild(alert);
            
            // Faire défiler vers l'alerte
            alert.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Supprimer l'alerte après 5 secondes
            setTimeout(() => {
                alert.remove();
            }, 5000);
        }

        function resetSelection() {
            selectedMatch = null;
            selectedSection = null;
            
            document.querySelectorAll('.match-card, .seating-section').forEach(el => {
                el.classList.remove('selected');
            });
            
            document.getElementById('selectedMatch').textContent = 'Aucun';
            document.getElementById('selectedSection').textContent = 'Aucune';
            document.getElementById('totalPrice').textContent = '0';
            document.getElementById('unitPrice').textContent = '0 €';
            document.getElementById('earlyDiscount').textContent = '0 €';
            document.getElementById('ticketCount').textContent = '1';
            
            validateForm();
        }

        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        function generateBookingId() {
            return 'BK' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
        }

        // Simulation de données en temps réel
        setInterval(() => {
            // Mise à jour périodique des prix ou disponibilités
            // (en production, ceci viendrait d'une API)
        }, 30000);



document.addEventListener("DOMContentLoaded", () => {
    const userArea = document.getElementById("userArea");
    const userToken = localStorage.getItem("token");

    if (userToken) {
        const name = localStorage.getItem("userName") || "Nom inconnu";
        const email = localStorage.getItem("userEmail") || "Email inconnu";
        const phone = localStorage.getItem("userPhone") || "Non renseigné";
        const initial = name.charAt(0).toUpperCase();

        userArea.innerHTML = `
            <div class="profile-icon">
                ${initial}
                <div class="tooltip">
                    <p>Nom: ${name}</p>
                    <p>Email: ${email}</p>
                    <p>Tel: ${phone}</p>
                </div>
            </div>
            <button class="logout-button" onclick="logout()">Se déconnecter</button>
        `;

        // Remplir automatiquement le formulaire
        const nameInput = document.getElementById("customerName");
        const emailInput = document.getElementById("customerEmail");
        const phoneInput = document.getElementById("customerPhone");

        if (nameInput) nameInput.value = name;
        if (emailInput) emailInput.value = email;
        if (phoneInput) phoneInput.value = phone;

    } else {
        userArea.innerHTML = `
            <button class="login-button" onclick="window.location.href='authentification.html'">Se connecter</button>
        `;
    }
});

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userPhone");
    localStorage.removeItem("userPassword");
    location.reload();


}


 document.addEventListener('DOMContentLoaded', function () {
        // Définir le montant (tu peux le rendre dynamique plus tard)
        let totalAmount = 0;

        // Met à jour le montant automatiquement si le prix change
        const updatePayPalButton = () => {
            const priceElement = document.getElementById('totalPrice');
            if (!priceElement) return;

            const amount = parseFloat(priceElement.textContent || '0');
            if (!amount || isNaN(amount)) return;

            // Supprimer bouton existant
            const container = document.getElementById('paypal-button-container');
            container.innerHTML = '';

            paypal.Buttons({
                style: {
                    layout: 'horizontal',
                    color: 'gold',
                    shape: 'pill',
                    label: 'paypal'
                },
                createOrder: function(data, actions) {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: amount.toFixed(2),
                                currency_code: 'EUR'
                            },
                            description: 'Réservation de billets StadeFoot'
                        }]
                    });
                },
               onApprove: function(data, actions) {
                        return actions.order.capture().then(async function(details) {
                            alert('Paiement effectué avec succès par ' + details.payer.name.given_name + ' !');
                           const name = document.getElementById('customerName').value;
                            const email = document.getElementById('customerEmail').value;

                           const selectedMatchId = Number(localStorage.getItem("selectMatchId"));


                            // 1. Récupérer les données du formulaire
                            const reservationData = {
                                name: name, 
                                email:email,
                                match_id: selectedMatchId, 
                                section: document.getElementById('selectedSection').textContent,
                                quantity: parseInt(document.getElementById('ticketQuantity').value),
                                total_price: parseFloat(document.getElementById('totalPrice').textContent)
                            };
                            console.log(reservationData)

                            // 2. Envoyer la réservation au backend
                            const response = await ApiService.bookTicket(reservationData);

                            if (response.success) {
                                alert("Réservation confirmée ! Un email vous a été envoyé.");
                            } else {
                                alert("Erreur lors de l'enregistrement de la réservation.");
                            }
                        });
                    },

                onError: function(err) {
                    console.error('Erreur PayPal:', err);
                    alert('Erreur lors du paiement.');
                }
            }).render('#paypal-button-container');
        };

        // Rafraîchir le bouton quand le prix change
        const observer = new MutationObserver(updatePayPalButton);
        const priceSpan = document.getElementById('totalPrice');
        if (priceSpan) {
            observer.observe(priceSpan, { childList: true });
        }

        // Initialiser le bouton
        updatePayPalButton();
    });

