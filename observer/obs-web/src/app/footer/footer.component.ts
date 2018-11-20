import { Component, OnInit } from '@angular/core';
import { StateService } from '../state.service';
import { AppState } from '../_models/app-state';
import { Vessel } from '../_models/vessel';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  name: string;
  trip = this.stateSvc.currentState.trip
  searchConfig = ['trips', 'user-management', 'vessel-management', 'permits-management']
  createConfig = ['user-management', 'vessel-management', 'permits-management', 'trips']
  confirmConfig = ['user-preferences', 'ots-management', 'trip']

  constructor(
    private stateSvc: StateService
  ) { }

  ngOnInit() {
    this.name = this.stateSvc.currentState.name
    console.log(this.name)
  }

  clearTrip() {
    this.stateSvc.clearTrip()
  }
  
  openTrip() {
    this.stateSvc.currentState.trip.is_open = true
    console.log(this.stateSvc.currentState.trip.is_open)
  }

  closeTrip() {
    this.stateSvc.currentState.trip.is_open = false
    console.log(this.stateSvc.currentState.trip.is_open)
  }

  clearUser() {
    this.stateSvc.clearUser()
  }

  clearVessel() {
    this.stateSvc.clearVessel()
  }

  clearPermit() {
    this.stateSvc.clearPermit()
  }
}
