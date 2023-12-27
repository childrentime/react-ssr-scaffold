import { startClient, page } from '/Users/lianwenwu/work/github/react-ssr-scaffold/pages/personal_center.ts';
import { clientController } from '/Users/lianwenwu/work/github/react-ssr-scaffold/core/store/clientController.tsx';
Promise.resolve(typeof startClient === 'function' && startClient()).then(() => clientController(page));