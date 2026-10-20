import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const response = await fetch('/boilerplate.txt');
	const boilerplate = response.ok ? await response.text() : '';

	return {
		boilerplate
	};
};
