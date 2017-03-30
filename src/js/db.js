import { app } from 'electron'
import Datastore from 'nedb'
import log from './logger'

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
		db.on('compaction.done', () => {
			cbCloseDB && cbCloseDB()
		})
	}
}

export function getDbValue(path, cb) {
	openDB(() => {
		path = typeof(path) === 'string' ? { path } : path
		db.find(path, (err, [ { value } ]) => {
			cb(value)
		})
	})
}

export function setDbValue(path, value) {
	openDB(() => {
		path = typeof(path) === 'string' ? { path } : path
		console.log('setDbValue', { path, value })
		db.update(path, { ...path, value}, { upsert: true })
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
