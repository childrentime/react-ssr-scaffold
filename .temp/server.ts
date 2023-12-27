
import { page as home } from '/Users/lianwenwu/work/github/react-ssr-scaffold/pages/home.ts';

// import { page as personal_center } from '/Users/lianwenwu/work/github/react-ssr-scaffold/pages/personal_center.ts';
const personal_center = {};

import { Header } from '/Users/lianwenwu/work/github/react-ssr-scaffold/layouts/Header';

import { setConfig } from '/Users/lianwenwu/work/github/react-ssr-scaffold/server/runtime.config.ts';

const pages = { home, personal_center };

const layouts = { Header };

const assets = __non_webpack_require__('../webpack-assets.json');

setConfig({ pages, assets, layouts });
