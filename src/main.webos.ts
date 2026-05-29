import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig).catch((err) => {
  const div = document.createElement('div');
  div.style.cssText =
    'position:fixed;top:0;left:0;right:0;bottom:0;background:#550;color:#fff;' +
    'padding:60px;z-index:99999;font-size:26px;line-height:1.5;word-break:break-all;overflow:auto';
  div.textContent = `BOOTSTRAP ERROR\n\n${err?.message ?? err}\n\n${err?.stack ?? ''}`;
  document.body.appendChild(div);
});
