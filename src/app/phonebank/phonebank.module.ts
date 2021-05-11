import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import {PhonebankComponent} from './phonebank.component'
import { MaterialModule } from '../material.module';


const routes: Routes = [
  { path: '', component: PhonebankComponent}
]


@NgModule({
  declarations: [PhonebankComponent],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule.forChild(routes),
  ]
})
export class PhonebankModule { }
