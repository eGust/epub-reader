import { PackageManager } from '../../epub/package_manager';

(async () => {
  console.log('debug');
})();

interface DebugData {
  pm: PackageManager;
}

const dbg: DebugData = {
  pm: new PackageManager(),
};

declare interface Window {
  dbg?: DebugData;
}

(window as Window).dbg = dbg;
