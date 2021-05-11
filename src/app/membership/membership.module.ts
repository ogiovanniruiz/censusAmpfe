import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MembershipComponent } from './membership.component';
import { Routes, RouterModule } from '@angular/router';
import { MaterialModule } from '../material.module';
import { MemberDialog } from './membershipDialogs/memberDialog';

const routes: Routes = [
  { path: '', component: MembershipComponent}
]

@NgModule({
  declarations: [MembershipComponent, MemberDialog],
  entryComponents:[MemberDialog],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule.forChild(routes),
  ]
})
export class MembershipModule { }
