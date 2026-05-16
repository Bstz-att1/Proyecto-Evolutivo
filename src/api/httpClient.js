import { authRefresh } from './auth.api.js';
import { getSession, clearSession, updateSessionTokens } from '../services/authService.js';

let refreshPromise = null;

async function requestTokenRefresh() {
    if (!refreshPromise) {
        refreshPromise = (async () => {
            const { refreshToken } = getSession();

            if (!refreshToken) {
                throw new Error('No hay refresh token disponible');
            }

            const response = await authRefresh(refreshToken);
            const data = response?.data || response;

            if (!data?.accessToken || !data?.refreshToken) {
                throw new Error('Respuesta inválida en refresh token');
            }

            updateSessionTokens(data.accessToken, data.refreshToken);
            return data.accessToken;
        })().finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise;
}

function withAccessToken(headers = {}) {
    const { accessToken } = getSession();
    return {
        ...headers,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
    };
}

function dispatchSessionExpired() {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
    }
}

export async function authFetch(url, options = {}, retry = true) {
    const initialHeaders = options.headers || {};
    const requestOptions = {
        ...options,
        headers: withAccessToken(initialHeaders)
    };

    let response = await fetch(url, requestOptions);

    if (response.status !== 401 || !retry) {
        return response;
    }

    try {
        const newAccessToken = await requestTokenRefresh();

        const retryHeaders = {
            ...initialHeaders,
            Authorization: `Bearer ${newAccessToken}`
        };

        response = await fetch(url, {
            ...options,
            headers: retryHeaders
        });

        return response;
    } catch (error) {
        clearSession();
        dispatchSessionExpired();
        throw error;
    }
}
