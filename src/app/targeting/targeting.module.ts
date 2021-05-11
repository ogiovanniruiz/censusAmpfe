import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { TargetingComponent} from './targeting.component';
import { MaterialModule } from '../material.module';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import {CensusTractDialog} from './targetDialogs/censustractDialog'
import { AssetDialog } from './targetDialogs/assetDialog';
import { FilterDialog } from './targetDialogs/filterDialog';
import { NonGeoTargetDialog } from './targetDialogs/nonGeoTargetDialog';
import { TargetSummaryDialog } from './targetDialogs/targetSummaryDialog';
import { LeafletDrawModule } from '@asymmetrik/ngx-leaflet-draw';
import { PolyTargetDialog } from './targetDialogs/polyTargetDialog';

const routes: Routes = [
  { path: '', component: TargetingComponent}
];

@NgModule({
  entryComponents: [CensusTractDialog, AssetDialog, FilterDialog, NonGeoTargetDialog, TargetSummaryDialog, PolyTargetDialog],
  declarations: [TargetingComponent, CensusTractDialog, AssetDialog, FilterDialog, NonGeoTargetDialog, TargetSummaryDialog, PolyTargetDialog  ],
  imports: [
    CommonModule,
    MaterialModule,
    LeafletModule,
    LeafletDrawModule,
    RouterModule.forChild(routes),
  ]
})
export class TargetingModule { }
