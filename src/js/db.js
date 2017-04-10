import { app } from 'electron'
import Datastore from 'nedb'
import log from './logger'

const db = new Datastore({ filename: `${app.getPath('userData')}/appdata/settings.db` })
	, TRIM_LIMITATION = 200

let dbOpen = false, untrimed = 0

export function openDB(cb) {
	if (dbOpen) {
		cb(db)
	} else {
		db.loadDatabase(() => {
			dbOpen = true
			cb(db)
			db.persistence.setAutocompactionInterval(1000*60*10)
		})
		db.on('compaction.done', () => {
			untrimed = 0
			cbCloseDB && cbCloseDB()
		})
	}
}

export function getDbValue(path, cb) {
	openDB(() => {
		path = typeof(path) === 'string' ? { path } : path
		db.find(path, (err, [ { value = null } = {} ] = []) => {
			cb(value)
		})
	})
}

export function setDbValue(path, value) {
	openDB(() => {
		path = typeof(path) === 'string' ? { path } : path
		log('setDbValue', { path, value })
		db.update(path, { ...path, value}, { upsert: true })
		if (++untrimed === TRIM_LIMITATION) {
			db.persistence.compactDatafile()
		}
	})
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

var cbCloseDB

export function closeDB(cb) {
	if (!dbOpen)
		return
	cbCloseDB = cb
	db.persistence.compactDatafile()
}
