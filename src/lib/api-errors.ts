export type ApiErrorCode =
	| "INVALID_BODY"
	| "MISSING_FIELD"
	| "INVALID_SLUG"
	| "POST_NOT_FOUND"
	| "SLUG_CONFLICT"
	| "VALIDATION_ERROR";

export type ApiError = { error: string; code: ApiErrorCode; fields?: string[] };

export function apiError(status: number, error: string, code: ApiErrorCode, fields?: string[]): Response {
	const body: ApiError = fields ? { error, code, fields } : { error, code };
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

export function badRequest(error: string, code: ApiErrorCode = "INVALID_BODY", fields?: string[]): Response {
	return apiError(400, error, code, fields);
}

export function notFound(error = "Post not found", code: ApiErrorCode = "POST_NOT_FOUND"): Response {
	return apiError(404, error, code);
}

export function conflict(error: string, code: ApiErrorCode = "SLUG_CONFLICT"): Response {
	return apiError(409, error, code);
}

export function validationError(error: string, fields?: string[]): Response {
	return apiError(422, error, "VALIDATION_ERROR", fields);
}
