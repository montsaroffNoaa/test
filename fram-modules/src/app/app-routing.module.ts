import { NgModule, OnInit } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './screens/home/home.component';
import { CatchComponent } from 'fram-catch';
import { SpecimensComponent } from 'fram-specimens';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'catch', component: CatchComponent },
  { path: 'specimens', component: SpecimensComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}


