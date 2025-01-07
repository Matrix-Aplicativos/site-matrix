
export function getUserFromToken(token: string): Number | null{
    try {
        const parts = token.split(".");
        if (parts.length !== 3) {
            throw new Error("Token Inválido");
        }

        const payload = atob(parts[1]);
        const decoded = JSON.parse(payload);

        return decoded.user ?? null;
    } catch (error) {
        console.error("Error decoding token:", error);
        return null;
    }
}