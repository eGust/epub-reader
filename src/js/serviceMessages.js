export const serviceMessages = {}

for (const k of 'queryDocPath openFiles openBook'.trim().split(/\s+/)) {
	serviceMessages[k] = k
}
