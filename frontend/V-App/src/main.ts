import { platformNativeScript, runNativeScriptAngularApp } from '@nativescript/angular';
import '@angular/compiler';

import { AppModule } from './app/app.module';

runNativeScriptAngularApp({
  appModuleBootstrap: () => platformNativeScript().bootstrapModule(AppModule),
});

