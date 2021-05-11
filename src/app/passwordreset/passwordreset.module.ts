import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { PasswordresetComponent} from './passwordreset.component';
import { MaterialModule } from '../material.module';
import {PasswordResetDialog} from './passwordresetDialog';

const routes: Routes = [
  { path: '', component: PasswordresetComponent}
];

@NgModule({
  entryComponents: [PasswordResetDialog],
  declarations: [PasswordresetComponent, PasswordResetDialog],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule.forChild(routes),
  ]
})
export class PasswordresetModule { }
