import { app } from 'electron'
import Datastore from 'nedb'

const db = new Datastore({ filename: `${app.getPath('appData')}/epub-reader/settings.db` })

let dbOpen = false

export function openDB(cb) {
	if (dbOpen) {
		cb(db)
	} else {
		db.loadDatabase(() => {
			dbOpen = true
			cb(db)
			db.persistence.setAutocompactionInterval(1000*60*30)
		})
	}
}

export function getMainWindowSettings(cb) {
	openDB(() => {
		db.find({ path: 'mainWindow' }, (err, [ settings = {} ]) => {
			cb(settings)
		})
	})
}

export function saveMainWindowSettings(settings) {
	openDB(() => {
		db.update({ path: 'mainWindow' }, { path: 'mainWindow', ...settings}, { upsert: true })
	})
}

export function closeDB() {
	if (!dbOpen)
		return
	db.persistence.compactDatafile()
}
