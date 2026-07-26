const API_URL = import.meta.env.VITE_API_URL

export function apiUrl(path: string) {
    return `${API_URL}/${path}`
}

export function authHeader(token: string) {
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    }
}

export async function apiFetch(
    url: string,
    options: RequestInit = {},
): Promise<Response> {
    const res = await fetch(url, options)

    if (res.status === 401) {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }

    return res
}


