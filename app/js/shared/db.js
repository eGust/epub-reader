import {
  app,
} from 'electron';
import Datastore from 'nedb';

const db = new Datastore({
  filename: `${app.getPath('userData')}/appdata/settings.db`,
});

const TRIM_LIMITATION = 200
let dbOpen = false;
let untrimmed = 0;

export function openDB(cb) {
  if (dbOpen) {
    cb(db)
  } else {
    db.loadDatabase(() => {
      dbOpen = true
      cb(db)
      db.persistence.setAutocompactionInterval(1000 * 60 * 10)
    })
    db.on('compaction.done', () => {
      untrimmed = 0
      if (cbCloseDB) cbCloseDB()
    })
  }
}

export function getDbValue(path, cb) {
  openDB(() => {
    const p = typeof (path) === 'string' ? {
      path,
    } : path;

    db.find(p, (err, [{
      value = null,
    } = {}] = []) => {
      cb(value)
    })
  })
}

export function setDbValue(path, value) {
  openDB(() => {
    const p = typeof (path) === 'string' ? {
      path,
    } : path;
    db.update(p, { ...p,
      value,
    }, {
      upsert: true,
    })

    untrimmed += 1;
    if (untrimmed === TRIM_LIMITATION) {
      db.persistence.compactDatafile()
    }
  })
}

export function getMainWindowSettings(cb) {
  openDB(() => {
    db.find({
      path: 'mainWindow',
    }, (err, [settings = {}]) => {
      cb(settings)
    })
  })
}

export function saveMainWindowSettings(settings) {
  openDB(() => {
    db.update({
      path: 'mainWindow',
    }, {
      path: 'mainWindow',
      ...settings,
    }, {
      upsert: true,
    })
  })
}

let cbCloseDB;

export function closeDB(cb) {
  if (!dbOpen)
    return;
  cbCloseDB = cb;
  db.persistence.compactDatafile();
}
