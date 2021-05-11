import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import {TextingComponent} from './texting.component'
import { MaterialModule } from '../material.module';

const routes: Routes = [
  { path: '', component: TextingComponent}
];

@NgModule({
  declarations: [TextingComponent],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule.forChild(routes),
  ]
})
export class TextingModule { }
