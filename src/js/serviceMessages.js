export const serviceMessages = {}

for (const k of 'docPath openFiles openBook'.trim().split(/\s+/)) {
	serviceMessages[k] = k
}
