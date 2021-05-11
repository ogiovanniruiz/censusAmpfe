import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AssetComponent} from './asset.component';
import { MaterialModule } from '../material.module';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { LeafletDrawModule } from '@asymmetrik/ngx-leaflet-draw';
import {AssetSurveyDialog} from './assetSurvey'
import { EditAssetDialog } from './dialogs/editAsset';
import { SearchAddressDialog} from './dialogs/searchAddress'
import { CreateParcelDialog } from './dialogs/createParcelDialog';
//import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';

const routes: Routes = [
  { path: '', component: AssetComponent}
];

@NgModule({
  declarations: [AssetComponent, AssetSurveyDialog, EditAssetDialog, SearchAddressDialog, CreateParcelDialog],
  entryComponents: [AssetSurveyDialog, EditAssetDialog, SearchAddressDialog, CreateParcelDialog],
  imports: [
    CommonModule,
    MaterialModule,
    LeafletModule,
    LeafletDrawModule,
    RouterModule.forChild(routes),
  ]
})
export class AssetModule { }
