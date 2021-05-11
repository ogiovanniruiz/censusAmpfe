import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent} from './dashboard.component';
import { MaterialModule } from '../material.module';
import { OrgsDialog } from './orgsDialog';

const routes: Routes = [
  { path: '', component: DashboardComponent}
];


@NgModule({
  entryComponents: [OrgsDialog],
  declarations: [DashboardComponent, OrgsDialog],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule.forChild(routes),
  ]
})
export class DashboardModule { }
