import { NgModule } from '@angular/core';
import { Ng5SliderModule } from 'ng5-slider';
import 'hammerjs';
import { MatInputModule, 
         MatButtonModule, 
         MatSelectModule, 
         
         MatCardModule,
         MatToolbarModule,
         MatSidenavModule,
         MatGridListModule,
         MatListModule,
         MatMenuModule,
         MatExpansionModule,
         MatButtonToggleModule,
         MatTooltipModule,
         MatRadioModule,
         MatCheckboxModule,
         MatTabsModule,
         MatProgressSpinnerModule,
         MatDialogModule,
         MatTreeModule,
         MatAutocompleteModule,
         MatProgressBarModule,
         MatSlideToggleModule,
         MatPaginatorModule,
         MatSortModule,
         MatTableModule,
         MatDatepickerModule,
         MatNativeDateModule
        } from '@angular/material';

import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { FlexLayoutModule } from "@angular/flex-layout";
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [],
  imports: [

    MatIconModule,
    MatButtonModule,
    MatInputModule, 
    MatSelectModule,
    MatCardModule,
    MatToolbarModule,
    MatSidenavModule,
    MatGridListModule,
    MatListModule,
    MatMenuModule,
    MatExpansionModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatRadioModule,
    MatCheckboxModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTreeModule,
    MatAutocompleteModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatSortModule,
    Ng5SliderModule,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule,

    FlexLayoutModule,
    ReactiveFormsModule,
    FormsModule,

  ],
  exports:[

    MatIconModule,
    MatButtonModule,
    MatInputModule, 
    MatSelectModule,
    MatCardModule,
    MatToolbarModule,
    MatSidenavModule,
    MatGridListModule,
    MatListModule,
    MatMenuModule,
    MatExpansionModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatRadioModule,
    MatCheckboxModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTreeModule,
    MatAutocompleteModule,
    MatProgressBarModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    MatSortModule,
    Ng5SliderModule,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule,

    FlexLayoutModule,
    ReactiveFormsModule,
    FormsModule,
  ]
})
export class MaterialModule { }
