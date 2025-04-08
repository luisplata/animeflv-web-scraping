import axios from 'axios';

export async function GetLastPaginationFromWebHook(
    url_webhook: string,
    type: string,
    headers: { [key: string]: string }
): Promise<number> {
    try {
        const response = await axios.get(`${url_webhook}/last-pagination/${type}`, {
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        });

        const pagination = response.data.page;

        console.log(`Última paginación obtenida: ${pagination}`);

        return pagination;
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            console.warn('No hay paginación guardada. Se usará 1 por defecto.');
            return 1; // fallback si no hay paginacion registrada
        }

        console.error('Error al obtener la última paginación:', error);
        throw error; // Error grave: otros códigos de error
    }
}


export async function SendLastPaginationToWebHook(
    url_webhook: string,
    type: string,
    page: number,
    headers: { [key: string]: string }
): Promise<void> {
    try {
        await axios.post(`${url_webhook}/last-pagination`, {
            type,
            page
        }, {
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        });

        console.log(`Paginación guardada correctamente. Type: ${type}, Page: ${page}`);
    } catch (error) {
        console.error('Error al guardar la paginación:', error);
        throw error; // lo propagas si quieres detener el flujo
    }
}

export function compareText(a, b) {
    return (a ?? '').trim().toLowerCase() === (b ?? '').trim().toLowerCase();
}

export function generateSlug(text) {
    return text
        .toLowerCase()
        .normalize('NFD') // eliminar tildes y caracteres raros
        .replace(/[\u0300-\u036f]/g, '') // eliminar restos de tildes
        .replace(/[^a-z0-9]+/g, '-') // todo lo que no sea letra o numero -> guion
        .replace(/^-+|-+$/g, ''); // quitar guiones al principio o final
}