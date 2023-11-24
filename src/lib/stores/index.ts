import { writable } from 'svelte/store';

export const isLoading = writable(false);
export const currentUser = writable<null | any>(null);
