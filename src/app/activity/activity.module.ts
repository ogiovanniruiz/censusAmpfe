import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';
import { Routes, RouterModule } from '@angular/router';
import {ActivityComponent} from './activity.component'
import {ActivityDialog} from './activityDialog/activityDialog'
import {ActivityImpressionsSubmitDialog} from './activityDialog/activityImpressionsSubmitDialog'

const routes: Routes = [
  { path: '', component: ActivityComponent}
];

@NgModule({
  declarations: [ActivityComponent, ActivityDialog, ActivityImpressionsSubmitDialog],
  entryComponents: [ActivityDialog, ActivityImpressionsSubmitDialog],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule.forChild(routes)
  ]
})
export class ActivityModule { }
