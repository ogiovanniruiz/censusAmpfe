import { Component, OnInit,  NgZone , ElementRef, Inject, QueryList, ViewChild,} from '@angular/core';
import * as L from 'leaflet';
import {MatDialog} from '@angular/material';
import {ActivityService} from '../services/activity/activity.service'
import {ParcelFormDialog} from './canvassDialogs/parcelFormDialog'
import {StackedListDialog} from './canvassDialogs/stackedListDialog'
import {UserService} from '../services/user/user.service'
import {CanvassService} from '../services/canvass/canvass.service'
import {ScriptService} from '../services/script/script.service'
import { ConnectionService, ConnectionServiceModule } from 'ng-connection-service';
import { GeoJsonObject } from 'geojson';
import { Router } from "@angular/router";
import { environment } from '../../environments/environment';
import { StorageMap } from '@ngx-pwa/local-storage';

declare global {
  interface Window { GlobalSelected: any; }
}

@Component({
  selector: 'app-canvass',
  templateUrl: './canvass.component.html',
  styleUrls: ['./canvass.component.scss']
})

export class CanvassComponent implements OnInit {

  @ViewChild('toggleCreationStatus', {static: false}) toggleCreationStatus:ElementRef;


  logo_dir = environment.LOGO_DIR;
  parcelDataLayer = []
  personDataLayer = []

  isConnected = true;
  connectionStatus = "Online"

  creatingHousehold: Boolean = false;
  clickingParcel:Boolean = false;

  canvassLoaded: Boolean = false;
  map;
  moveMarkerMode: Boolean = false;
  objectBeingMoved;

  constructor( public dialog: MatDialog, private scriptService: ScriptService,private canvassService: CanvassService, private activityService: ActivityService, 
               public userService: UserService, private connectionService: ConnectionService, public zone: NgZone, public router: Router, private storage: StorageMap) { 
                this.connectionService.monitor().subscribe(isConnected => {
                  this.isConnected = isConnected;
                  if(this.isConnected){ this.connectionStatus = "Online"}
                  else{this.connectionStatus = "Offline"}
                })
               }

  options = {
              layers: [L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 20, attribution: '...' })],
              zoom: 12,
              center:  L.latLng(33.971839, -117.381739),
              zoomControl: false,
            };

  bounds: any;
  layers = []
  activity: Object;
  center: L.LatLng = this.options.center
  zoom;
  tracking = false;
  newLocation;

  ngOnInit() {
    this.canvassLoaded = true;
    
    var campaignID = parseInt(localStorage.getItem('campaignID'))
    var activityID = localStorage.getItem('activityID')
    var activityType = localStorage.getItem('activityType')

    this.getActivity(campaignID, activityID,activityType);
    this.locateUser();
  }

  onMapReady(map: L.Map){
    this.map = map
    map.addControl(L.control.zoom({ position: 'topright' }));
    
  }

  getActivity(campaignID: Number, activityID: string,activityType: string){
    this.activityService.getActivity(campaignID, activityID, activityType).subscribe(activity =>{
      this.activity = activity
      this.getCanvassPolygon(activity);
      
      if(localStorage.getItem('mapSavedActivityID') === localStorage.getItem('activityID')){
        
        this.redrawDataLayers()
        this.canvassLoaded = false;

      }else{
        localStorage.setItem('mapSavedActivityID', activity['_id'])

        this.getCanvassParcels(activity);
      }
      
      var scriptIDs = activity['activityMetaData']['activityScriptIDs']
      this.getActivityScripts(scriptIDs)
    })
  }

  getCanvassPolygon(activity: Object){
    
    var targetIDs = activity['activityMetaData']['targetIDs']
    this.canvassService.getCanvassPolygon(targetIDs).subscribe((data: any) =>{
      let layer = L.geoJSON(data, {onEachFeature: onEachFeature.bind(this)});
      this.center = new L.LatLng(parseFloat(data[0].geometry.coordinates[0][0][0][1]), parseFloat(data[0].geometry.coordinates[0][0][0][0]))
      this.zoom = 12;
      
      function onEachFeature(feature: any, layer: any){
        layer.setStyle({color: 'green'}).on('mouseup', this.polygonMouseUp, this)
                                        .on("mousedown", this.polygonMouseDown, this);
      }

      this.layers.push(layer);
    })
  }

  polygonMouseDown(){
    this.map.on('mousedown', (e)=>{
      if(this.creatingHousehold){
        window.GlobalSelected = {location: {coordinates: [e['latlng']['lng'],e['latlng']['lat'] ], type: "Point"}}
      }

      if(this.moveMarkerMode){
        this.newLocation = {coordinates: [e['latlng']['lng'],e['latlng']['lat'] ], type: "Point"}
      }
      
    });  
  }

  polygonMouseUp(){
    if(this.creatingHousehold){
      this.openCanvassForm()
    }
    if(this.moveMarkerMode){
      this.moveMarker(this.newLocation)
      this.moveMarkerMode = false
    }
  }

  moveMarker(location){
    for(var i = 0; i < this.personDataLayer.length; i++){
      if(this.objectBeingMoved.data._id === this.personDataLayer[i]._id){
        this.personDataLayer[i].address.location = location
        this.canvassService.storePeople(this.personDataLayer)   
        break
      } 
    }

    this.canvassService.updateMarkerLocation(location, this.objectBeingMoved).subscribe(result =>{
      this.redrawDataLayers()
      this.map.panTo(new L.LatLng(parseFloat(result['address']['location']['coordinates'][1]), parseFloat(result['address']['location']['coordinates'][0])));
    })
  }

  getCanvassParcels(activity: Object){
    var targetIDs = activity['activityMetaData']['targetIDs']
    this.canvassService.getCanvassParcels(targetIDs).subscribe((data: any) =>{
      let parcelLayer = L.geoJSON(data, {onEachFeature: onEachFeature.bind(this)});
      function onEachFeature(feature: any, layer: any){
        var addressString = ""

        if(feature.properties.address.streetNum) addressString += feature.properties.address.streetNum + " "
        if(feature.properties.address.prefix) addressString += feature.properties.address.prefix + " "
        if(feature.properties.address.street) addressString += feature.properties.address.street + " "
        if(feature.properties.address.suffix) addressString += feature.properties.address.suffix + " "
        layer.setStyle({color: 'grey'}).bindTooltip(addressString)
        this.parcelDataLayer.push(feature)
      }

      this.canvassService.storeParcels(this.parcelDataLayer)
      parcelLayer['id'] = "PARCELS"  
      this.layers.push(parcelLayer);
      this.getCanvassResidents(activity);
    })
  }

  getCanvassResidents(activity: Object){
    var targetIDs = activity['activityMetaData']['targetIDs']

    this.canvassService.getCanvassResidents(targetIDs).subscribe(data =>{
      var residentLayer = new L.LayerGroup();
      residentLayer['id'] = "RESIDENTS"
      var orgID = localStorage.getItem('orgID')
      console.log(activity)

      for(var i = 0; i < data['nonTargetResidents'].length; i++){
        var lat = data['nonTargetResidents'][i].address.location.coordinates[1]
        var lng = data['nonTargetResidents'][i].address.location.coordinates[0]
        let circleOptions = {radius: 5}

        
        for(var j = 0; j < data['nonTargetResidents'][i].canvassContactHistory.length; j++){
          if(data['nonTargetResidents'][i]['canvassContactHistory'][j]){
            if(data['nonTargetResidents'][i]['canvassContactHistory'][j].activityID === activity['_id']){
            if(data['nonTargetResidents'][i].canvassContactHistory[j].identified){
              circleOptions['color'] = "green"
              break
            }

            if(!data['nonTargetResidents'][i].canvassContactHistory[j].identified){
              if(data['nonTargetResidents'][i].canvassContactHistory[j].refused){
                circleOptions['color'] = "red"
                break
              }
            }

            if(!data['nonTargetResidents'][i].canvassContactHistory[j].identified){
              if(data['nonTargetResidents'][i].canvassContactHistory[j].nonResponse){
                circleOptions['color'] = "purple"
                break
              }
            }
          }
          }
        }

        for(var j = 0; j < data['nonTargetResidents'][i]['petitionContactHistory']['length']; j++){

          if(data['nonTargetResidents'][i]['petitionContactHistory'][j]['identified']){
            circleOptions['color'] = "green"
            break
          }
        }
        
        if(data['nonTargetResidents'][i].membership){
          for( var j = 0; j < data['nonTargetResidents'][i].membership.length; j++){
            if(data['nonTargetResidents'][i].membership[j].orgID != orgID){
              circleOptions['color'] = "yellow"
              break
            }
          }
        }

        let circle = L.circle([lat,lng], circleOptions)

        if(circleOptions['color'] === "yellow"){
          circle.bindTooltip('This is a member of another organization.')

        }else{
          circle.on('mouseup', this.openCanvassForm, this).on("mousedown", this.layerClicked, data['nonTargetResidents'][i])
        }

        residentLayer.addLayer(circle) 
        this.personDataLayer.push(data['nonTargetResidents'][i])
      
      }

      for(var i = 0; i < data['targetResidents'].length; i++){
        var lat = data['targetResidents'][i].address.location.coordinates[1]
        var lng = data['targetResidents'][i].address.location.coordinates[0]
        let circleOptions = {radius: 5}

        
        for(var j = 0; j < data['targetResidents'][i]['canvassContactHistory']['length']; j++){
          if(data['targetResidents'][i]['canvassContactHistory'][j]){
            if(data['targetResidents'][i]['canvassContactHistory'][j]['identified']){
              circleOptions['color'] = "green"
              break
            }

            if(!data['targetResidents'][i]['canvassContactHistory'][j]['identified']){
              if(data['targetResidents'][i]['canvassContactHistory'][j]['refused']){
                circleOptions['color'] = "red"
                break
              }
            }

            if(!data['targetResidents'][i].canvassContactHistory[j].identified){
              if(data['targetResidents'][i].canvassContactHistory[j].nonResponse){
                circleOptions['color'] = "purple"
                break
              }
            } 
          }
        }

        for(var j = 0; j < data['targetResidents'][i]['petitionContactHistory']['length']; j++){

          if(data['targetResidents'][i]['petitionContactHistory'][j]['identified']){
            circleOptions['color'] = "green"
            break
          }
        }

        var circle = L.circle([lat,lng], circleOptions).on('mouseup', this.openCanvassForm, this)
                                                       .on("mousedown", this.layerClicked, data['targetResidents'][i])
        residentLayer.addLayer(circle) 
        this.personDataLayer.push(data['targetResidents'][i])

      }

      this.canvassService.storePeople(this.personDataLayer)
      this.layers.push(residentLayer);
      this.canvassLoaded = false;
    })
  }

  get selectedLayer(){
    return window.GlobalSelected
  }

  public layerClicked(){
    window.GlobalSelected = this
  }

  redrawDataLayers(){
    if(this.creatingHousehold){
      this.redrawCanvassResidents()
      this.redrawCanvassParcels()
    } else{
      this.redrawCanvassParcels()
      this.redrawCanvassResidents()
    }
  }

  redrawCanvassParcels(){
    for (var i = 0; i< this.layers.length; i++ ){
      if(this.layers[i]['id'] === "PARCELS") {this.layers.splice(i, 1)}
    }
    this.canvassService.getStoredParcels().subscribe((parcelDataLayer: GeoJsonObject) =>{      
      let parcelLayer = L.geoJSON(parcelDataLayer, {onEachFeature: onEachFeature.bind(this)});
      function onEachFeature(feature: any, layer: any){

        var addressString = ""

        if(feature.properties.address.streetNum) addressString += feature.properties.address.streetNum + " "
        if(feature.properties.address.prefix) addressString += feature.properties.address.prefix  + " "
        if(feature.properties.address.street) addressString += feature.properties.address.street  + " "
        if(feature.properties.address.suffix) addressString += feature.properties.address.suffix

        if(this.creatingHousehold) { 
          layer.bringToBack().setStyle({color: 'grey'}).on("mousedown", this.layerClicked, feature)
                                                       .on('mousedown', this.openCanvassForm, this)
                                                       .bindTooltip(addressString)
                                                       
        }
        else {layer.setStyle({color: 'grey'}).bindTooltip(addressString)}
      }
      parcelLayer['id'] = "PARCELS"  
      this.layers.push(parcelLayer);
    })
  }

  redrawCanvassResidents(){
    this.personDataLayer = []

    var orgID = localStorage.getItem('orgID')
    var activityID = localStorage.getItem('activityID');
    for (var i = 0; i< this.layers.length; i++ ){
      if(this.layers[i]['id'] === "RESIDENTS") {this.layers.splice(i, 1)}
    }

    var residentLayer = new L.LayerGroup();
    residentLayer['id'] = "RESIDENTS";

    this.canvassService.getStoredPeople().subscribe((personDataLayer:[]) =>{

      for(var i = 0; i < personDataLayer.length; i++){
        var lat = personDataLayer[i]['address']['location']['coordinates'][1]
        var lng = personDataLayer[i]['address']['location']['coordinates'][0]

        let circleOptions = {radius: 5}

        for(var j = 0; j < personDataLayer[i]['canvassContactHistory']['length']; j++){
          if(personDataLayer[i]['canvassContactHistory'][j]){
            if(personDataLayer[i]['canvassContactHistory'][j]['activityID'] === activityID){
              if(personDataLayer[i]['canvassContactHistory'][j]['identified']){
                circleOptions['color'] = "green"
                break
              }
            
              if(!personDataLayer[i]['canvassContactHistory'][j]['identified']){
                if(personDataLayer[i]['canvassContactHistory'][j]['refused']){
                  circleOptions['color'] = "red"
                  break
                }
              }

              if(!personDataLayer[i]['canvassContactHistory'][j]['identified']){
                if(personDataLayer[i]['canvassContactHistory'][j]['nonResponse']){
                  circleOptions['color'] = "purple"
                  break
                }
              }
            }
          }
        }

        for(var j = 0; j < personDataLayer[i]['petitionContactHistory']['length']; j++){
          if(personDataLayer[i]['petitionContactHistory'][j]['identified']){
            circleOptions['color'] = "green"
            break
          }
        }

        if(personDataLayer[i]['membership']){
          for( var j = 0; j < personDataLayer[i]['membership']['length']; j++){
            if(personDataLayer[i]['membership'][j]['orgID'] != orgID){
              circleOptions['color'] = "yellow"
            }
          }
        }

        let circle = L.circle([lat,lng], circleOptions)

        if(circleOptions['color'] === "yellow"){
          circle.bindTooltip('This is a member of another organization.')

        }else{
          circle.on('mouseup', this.openCanvassForm, this).on("mousedown", this.layerClicked, personDataLayer[i])
        }

        this.personDataLayer.push(personDataLayer[i])

        residentLayer.addLayer(circle)       
      }

      this.layers.push(residentLayer);
    })
  }

  async openCanvassForm(){ 
    var address = {}
    var location = {}
    var stacked = []

    var parcelLocation = {}

    if(this.selectedLayer.properties){ //Parcel was selected
      address = this.selectedLayer.properties.address;
      parcelLocation = this.selectedLayer.properties.location;
      await this.map.on('mousedown', (e)=>{
        location = {coordinates: [e['latlng']['lng'],e['latlng']['lat'] ], type: "Point"}
      }); 
    
    } else if(this.selectedLayer.address){//Person was selected

      address = this.selectedLayer.address
      location = this.selectedLayer.address.location

      for (var i = 0; i < this.personDataLayer['length']; i++) {
        if (location['coordinates'][0] === this.personDataLayer[i]['address']['location']['coordinates'][0] &&
            location['coordinates'][1] === this.personDataLayer[i]['address']['location']['coordinates'][1] &&
            //address['unit'] != this.personDataLayer[i]['address']['unit'] &&
            address['unit']
          
          ) {
          stacked.push(this.personDataLayer[i]);
        }
      }

    }else if(this.selectedLayer.location){
      location = this.selectedLayer.location
    } //Map was selected

 
    if(stacked.length > 1 && !stacked.every( (val, i, arr) => val.address.unit === arr[0].address.unit)){
      this.openStackedList(stacked)

      return
    }

    this.zone.run(() => {
      const dialogRef = this.dialog.open(ParcelFormDialog, { maxWidth: '100vw',
                                                             maxHeight: '100vh',
                                                             height: '100%',
                                                             width: '100%', data: {
                                                                                  parcelLocation: parcelLocation,
                                                                                  address: address,
                                                                                  location: location, 
                                                                                  activity: this.activity, 
                                                                                  userCoordinates: this.center, 
                                                                                  connected: this.isConnected} , disableClose: true });
      
      dialogRef.afterClosed().subscribe(result => {

        this.creatingHousehold = false;
        this.redrawDataLayers()
      });
    });
  }


  openStackedList(stacked){
    this.zone.run(() => {
      const dialogRef = this.dialog.open(StackedListDialog, {data: {stacked: stacked}} );
      
      dialogRef.afterClosed().subscribe(result => {
        //console.log(result);
        if(result){
          this.moveMarkerMode = true;
          this.objectBeingMoved = result
          
        }
      });
    });

  }

  toggleCreationTool(){
    if(this.creatingHousehold){
      this.creatingHousehold = false;
    } else{
      this.creatingHousehold = true;
    }

    this.redrawDataLayers()
  }

  reloadMap(){
    localStorage.removeItem('mapSavedActivityID')
    location.reload(true)
  }

  getActivityScripts(scriptIDs){
    this.scriptService.getActivityScripts(scriptIDs).subscribe((scripts: []) =>{
      this.canvassService.storeScripts(scripts);
    })
  }

  locateUser(){
    this.userService.getUserLocation();
    this.userService.userLocation.subscribe(result=>{

      if(result){
        for( var i = 0; i < this.layers.length; i++){ 
          if ( this.layers[i].id === "USERLOC") {
            this.layers.splice(i, 1); 
          }
        }

        localStorage.setItem('userLocation', [result['coords'].latitude, result['coords'].longitude].toString())
        
        var userLocationIcon = L.icon({ 
          iconUrl: '../assets/here.png',
          iconSize: [25, 25],
          iconAnchor: [0, 0],
          shadowUrl: '../assets/marker-shadow.png',
        });
    
        var marker = L.marker([result['coords'].latitude, result['coords'].longitude], {icon: userLocationIcon
        }).bindTooltip("You are here.");
    
        marker['id'] = "USERLOC"  
        this.layers.push(marker);
      }
    })
  }

  trackUserLocation(){

    if(this.tracking){
      this.tracking = false;
    }else{
      this.tracking = true;
    }

    var userLocation = localStorage.getItem('userLocation').split(",")

    if(this.tracking){
      this.center = new L.LatLng(parseFloat(userLocation[0]), parseFloat(userLocation[1]))
      this.zoom = 18;
    }
    this.locateUser()
  }
}
