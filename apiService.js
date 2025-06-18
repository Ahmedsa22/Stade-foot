class ApiService {
    static async register(data) {
        return await this.post('register', data);
    }

    static async login(data) {
        return await this.post('login', data);
    }

    static async bookTicket(data) {
        return await this.post('reserve', data);
    }

    static async getMatches() {
        return await this.post('matches');
    }

    static async post(action, data = {}) {
        try {
            const response = await fetch(`http://localhost/match/index.php?action=${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            console.log(response)
            return await response.json();
        } catch (err) {
            console.error("Erreur API :", err);
            return { success: false, message: "Erreur de communication avec le serveur." };
        }
    }
}
