/**
 * API Client voor Systeemplafond Rekenmachine
 * Communicatie met Python Flask backend
 */

const API_BASE_URL = 'https://systeemplafondcalculator.onrender.com/api';

console.log('API initialized with base URL:', API_BASE_URL);

class API {
    /**
     * Health check
     */
    static async health() {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            return await response.json();
        } catch (error) {
            console.error('Health check failed:', error);
            return null;
        }
    }

    /**
     * Bereken materialen
     */
    static async bereken(vierkante_meters, strekkende_meters, systeem) {
        try {
            console.log('Calling API.bereken with:', {vierkante_meters, strekkende_meters, systeem});
            
            const response = await fetch(`${API_BASE_URL}/bereken`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    vierkante_meters: vierkante_meters,
                    strekkende_meters: strekkende_meters,
                    systeem: systeem
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Berekening mislukt');
            }

            const data = await response.json();
            console.log('✓ API Response:', data);
            return data;
        } catch (error) {
            console.error('✗ API Error:', error);
            throw error;
        }
    }

    /**
     * Bereken vierkante meters van afmetingen
     */
    static async berekenAfmetingen(lengte, breedte) {
        try {
            const response = await fetch(`${API_BASE_URL}/bereken-afmetingen`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lengte: lengte,
                    breedte: breedte
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Berekening afmetingen mislukt');
            }

            return await response.json();
        } catch (error) {
            console.error('Error calculating dimensions:', error);
            throw error;
        }
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}
