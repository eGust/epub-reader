import { extname } from 'path';

const { body } = document;

const acceptable = (dt: DataTransfer): File[] | boolean => {
  if (!dt) return false;

  const files = Array.from(dt.files);
  if (files.length) {
    const epubFiles = files.filter(({ type, name }) => (
      type.startsWith('application/epub') || extname(name).toLowerCase() === '.epub'
    ));
    return epubFiles;
  }

  const items = Array.from(dt.items);
  if (!items.length) return false;

  const epubItem = items.find(({ kind, type }) => (
    kind === 'file' && type.startsWith('application/epub')
  ));
  return !!epubItem;
};

const handleDragEventRejected = (ev: DragEvent): boolean => {
  const { dataTransfer } = ev;
  if (!dataTransfer) return true;

  if (acceptable(dataTransfer)) return false;

  dataTransfer.effectAllowed = 'none';
  dataTransfer.dropEffect = 'none';
  return true;
};

const onDragStart = (ev: DragEvent) => {
  ev.preventDefault();
  ev.stopPropagation();
  handleDragEventRejected(ev);
};

const onDragEnd = (ev: DragEvent) => {
  ev.preventDefault();
  ev.stopPropagation();
  handleDragEventRejected(ev);
};

const onDrop = (ev: DragEvent) => {
  ev.preventDefault();
  ev.stopPropagation();
  console.log('onDrop');
  if (!ev.dataTransfer) return;

  const files = acceptable(ev.dataTransfer);
  console.info('onDrop', { files });
  if (!Array.isArray(files)) {
    if (files) {
      console.error('files should be File[]');
    } else {
      console.log('no files!');
    }
    return;
  }

  console.log(files);
};

body.addEventListener('drag', onDragStart, true);
body.addEventListener('dragenter', onDragStart, true);
body.addEventListener('dragstart', onDragStart, true);
body.addEventListener('dragenter', onDragStart, true);
body.addEventListener('dragover', onDragStart, true);

body.addEventListener('dragend', onDragEnd, true);
body.addEventListener('dragleave', onDragEnd, true);
body.addEventListener('drop', onDrop, true);
