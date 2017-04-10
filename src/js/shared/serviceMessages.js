export const serviceMessages = {}

for (const k of 'queryDocRoot queryDocPath openFiles openBook getDbValue setDbValue'.trim().split(/\s+/)) {
	serviceMessages[k] = k
}
