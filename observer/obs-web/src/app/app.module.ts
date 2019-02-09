import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {
  MatCardModule,
  MatDialogModule,
  MatListModule,
  MatOptionModule,
  MatSelectModule,
  MatInputModule,
  MatToolbarModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatSnackBarModule,
  MatMenuModule,
  MatIconModule,
  MatSlideToggleModule,
  MatAutocompleteModule,
  MatButtonToggleModule,
  MatTableModule,
  MatBadgeModule,
  MatBottomSheetModule,
  MatButtonModule
} from '@angular/material';

import { RouterModule, Routes } from '@angular/router';
import { identifierModuleUrl } from '@angular/compiler';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { MultiSelectModule } from 'primeng/multiselect';

import {ChartModule} from 'primeng/chart';

import { MenuComponent } from './_screens/menu/menu.component';
import { VesselPermitsComponent } from './_screens/vessel-permits/vessel-permits.component';
import { TripsComponent } from './_screens/trips/trips.component';
import { OTSManagementComponent } from './_screens/ots-management/ots-management.component';
import { UserManagementComponent } from './_screens/user-management/user-management.component';
import { UserConfigComponent } from './_screens/user-config/user-config.component';
import { VesselsComponent } from './_screens/vessels/vessels.component';
import { PermitsComponent } from './_screens/permits/permits.component';
import { TripDetailComponent } from './_screens/trip-detail/trip-detail.component';
import { MessagesComponent } from './_screens/messages/messages.component';
import { FooterComponent } from './_screens/footer/footer.component';
import { HeaderComponent } from './_screens/header/header.component';
import { UserComponent } from './_screens/user/user.component';
import { VesselDetailComponent } from './_screens/vessel-detail/vessel-detail.component';
import { PermitDetailComponent } from './_screens/permit-detail/permit-detail.component';
import { MessageDetailComponent } from './_screens/message-detail/message-detail.component';
import { HomeComponent } from './_screens/home/home.component';

import { DataService } from './_services/data/data.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { OtsTargetDetailComponent } from './_screens/ots-target-detail/ots-target-detail.component';

const appRoutes: Routes = [
  { path: 'home',             component: HomeComponent },
  { path: 'ots-management',   component: OTSManagementComponent },
  { path: 'ots-target-detail' ,component: OtsTargetDetailComponent }, 
  { path: 'manage-users',     component: UserManagementComponent },
  { path: 'user',             component: UserComponent },
  { path: 'trips',            component: TripsComponent },
  { path: 'trip',             component: TripDetailComponent },
  { path: 'message-detail',   component: MessageDetailComponent },
  { path: 'user-config',      component: UserConfigComponent },
  { path: 'manage-vessels',   component: VesselsComponent },
  { path: 'vessel-detail',    component: VesselDetailComponent },
  { path: 'manage-permits',   component: PermitsComponent },
  { path: 'permit-detail',    component: PermitDetailComponent },
  // { path: 'vessel-permits',component: VesselPermitsComponent },
  { path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
];

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    VesselPermitsComponent,
    TripsComponent,
    OTSManagementComponent,
    UserManagementComponent,
    UserConfigComponent,
    VesselsComponent,
    PermitsComponent,
    TripDetailComponent,
    MessagesComponent,
    FooterComponent,
    HeaderComponent,
    UserComponent,
    VesselDetailComponent,
    PermitDetailComponent,
    MessageDetailComponent,
    HomeComponent,
    OtsTargetDetailComponent,
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    ),
    BrowserModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatDialogModule,
    MatListModule,
    MatOptionModule,
    MatSelectModule,
    MatInputModule,
    MatToolbarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatMenuModule,
    MatIconModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
    MatButtonToggleModule,
    MatTableModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ToggleButtonModule,
    SelectButtonModule,
    DropdownModule,
    CalendarModule,
    CardModule,
    HttpClientModule,
    MultiSelectModule,
    ChartModule,
  ],
  providers: [
    DataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
