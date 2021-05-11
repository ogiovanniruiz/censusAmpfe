import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MaterialModule } from '../material.module';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { CanvassComponent} from './canvass.component'
import { ParcelFormDialog } from './canvassDialogs/parcelFormDialog';

import { LeafletDrawModule } from '@asymmetrik/ngx-leaflet-draw';
import { StackedListDialog} from './canvassDialogs/stackedListDialog'

const routes: Routes = [
  { path: '', component: CanvassComponent},
];


@NgModule({
  declarations: [CanvassComponent,  StackedListDialog, ParcelFormDialog],
  entryComponents: [ParcelFormDialog, StackedListDialog],
  imports: [
    CommonModule,
    LeafletModule,
    MaterialModule,
    LeafletDrawModule,
    RouterModule.forChild(routes)
  ]
})
export class CanvassModule { }
