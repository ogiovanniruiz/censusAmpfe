import { Component, OnInit, NgZone } from '@angular/core';
import * as L from 'leaflet';
import {MatDialog, SELECT_ITEM_HEIGHT_EM} from '@angular/material';
import {AssetSurveyDialog} from './assetSurvey'
import {ParcelService} from '../services/parcel/parcel.service'
import 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/images/marker-icon.png'
import {EditAssetDialog} from './dialogs/editAsset'
import { fromEventPattern } from 'rxjs';
import {SearchAddressDialog} from './dialogs/searchAddress'
import {UserService} from '../services/user/user.service'
import {CreateParcelDialog} from './dialogs/createParcelDialog'


declare global {
  interface Window { GlobalSelected: any; }
}

@Component({
  selector: 'app-asset',
  templateUrl: './asset.component.html',
  styleUrls: ['./asset.component.scss']
})
export class AssetComponent implements OnInit {

  constructor( public dialog: MatDialog, public zone: NgZone, private parcel: ParcelService, public userService: UserService ) { }
  layers = []
  assetLayers = []
  layersControl: any;
  leafletMap: any;
  userProfile: Object;
  assetMapUserLvl: String
  jsonPolygonCreated: any;
  map: any;
  bounds: any;
  center;
  zoom = 9

  options = {
    layers: [L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '...' })],
    zoom: 10,
    center: [33.971839, -117.381739],
  };

  drawOptions = {
    position: 'topright',
    draw: {
      marker: false,
      polygon: {allowIntersection: false,
                shapeOptions: {
                color: 'red'
                }},
      polyline: false,
      circle: false,
      rectangle: false,
      circlemarker: false
    }
  };

  mapMoved(e: any){
    if (e.target._zoom >= 15){
      this.bounds = this.leafletMap.getBounds();
      this.getParcels(); 
    } else {
      for( var i = 0; i < this.layers.length; i++){ 
        if ( this.layers[i].id === "PARCELS") {
          this.layers.splice(i, 1); 
        }
      }
    }
  }

  onMapReady(map: L.Map){
    this.leafletMap = map;
    setTimeout(function(){ map.invalidateSize()}, 500);
  }

  drawCreated(draw: any){
    this.jsonPolygonCreated = draw.layer.toGeoJSON()
    if (this.assetMapUserLvl === "TRIAL"){
      draw.layer.bindTooltip("Request permission to create a Parcel.")
    } else{
      draw.layer.on('click', this.createNewParcel, this).bindTooltip("Click to create a new Parcel.")
    }
  }

  search(){
    this.zone.run(() => {
      const dialogRef = this.dialog.open(SearchAddressDialog);
      dialogRef.afterClosed().subscribe(result => {
        if(result){
          this.center = [result.coords[1], result.coords[0]]
          this.zoom = 16;
          this.populateMapWithSearchResults(this.center, result['address'])
        }
      });
    })
  }

  populateMapWithSearchResults(result, address){

    var myIcon = L.icon({ 
      iconUrl: '../assets/redMarker.png', // pull out values as desired from the feature feature.properties.style.externalGraphic.
      iconSize: [25, 41],
      iconAnchor: [11, 41],
      popupAnchor: [-3, -76],
      shadowUrl: '../assets/marker-shadow.png',
      shadowSize: [68, 95],
      shadowAnchor: [22, 94]
    });

    var survey = address
    var searchResultLayer = new L.LayerGroup();
    searchResultLayer['id'] = "SEARCHRESULTS"

    var marker = L.marker(result, {icon: myIcon}).bindTooltip(survey);

    searchResultLayer.addLayer(marker)
    this.layers.push(searchResultLayer); 
  }

  createNewParcel(markerData: any){
    this.jsonPolygonCreated['properties']['location'] = {type: "Point", coordinates: [markerData.latlng.lng, markerData.latlng.lat]}
    this.zone.run(() => {
      console.log("CREATING")
      const dialogRef = this.dialog.open(CreateParcelDialog, {data: this.jsonPolygonCreated});
      dialogRef.afterClosed().subscribe(result => {
        if(result){
          this.getParcels()
          var map = this.map.featureGroup;
          map.eachLayer(function (layer) {map.removeLayer(layer);});
        }
      });
    })
  }

  createNewAsset(){
    if (this.assetMapUserLvl != "TRIAL"){
      this.zone.run(() => {
        const dialogRef = this.dialog.open(AssetSurveyDialog, {data: this.selectedAsset});
        dialogRef.afterClosed().subscribe(result => {
          if(result){
            this.getParcels()
            this.getAssets();
          }
        });
      });
    }
  }

  editAsset(){
    if (this.assetMapUserLvl === "ADMINISTRATOR"){
      this.zone.run(() => {
        const dialogRef = this.dialog.open(EditAssetDialog, {data: this.selectedAsset});
        dialogRef.afterClosed().subscribe(result => {
          if(result){
            if(result.mode === "DELETE"){
              if (confirm('Are you sure you want to delete this asset?')) {
                this.parcel.deleteAsset(this.selectedAsset).subscribe(result=>{
                  this.getParcels()
                  this.getAssets();
                })
              }
            } else{
              this.getParcels()
              this.getAssets();
            }
          }
        });
      });
    }
  }

  getAssets(){
    var myIcon = L.icon({ 
      iconUrl: '../assets/marker-icon.png', // pull out values as desired from the feature feature.properties.style.externalGraphic.
      iconSize: [25, 41],
      iconAnchor: [11, 41],
      popupAnchor: [-3, -76],
      shadowUrl: '../assets/marker-shadow.png',
      shadowSize: [68, 95],
      shadowAnchor: [22, 94]
    });

    var parishIcon = L.icon({ 
      iconUrl: '../assets/redFlag.png', // pull out values as desired from the feature feature.properties.style.externalGraphic.
      iconSize: [25, 41],
      iconAnchor: [11, 41],
      popupAnchor: [-3, -76],
      shadowUrl: '../assets/marker-shadow.png',
      shadowSize: [68, 95],
      shadowAnchor: [22, 94]
    });

    for( var i = 0; i < this.layers.length; i++){ 
      if ( this.layers[i].id === "ASSETS") {
        this.layers.splice(i, 1); 
      }
    }

    var assetLayer = new L.LayerGroup();
    assetLayer['id'] = "ASSETS"

    var filter = ""
    this.parcel.getAssets(filter).subscribe(result=>{

      for(var i = 0; i < result.length; i++ ){

        if (result[i].properties.asset){

          var survey = ""
          for(var j = 0; j < result[i].properties.asset.idResponses.length; j++ ){

            if(result[i].properties.asset.idResponses[j].question != "Hours of Operation"){
              survey = survey + result[i].properties.asset.idResponses[j].question + ": " 
                              + JSON.stringify(result[i].properties.asset.idResponses[j].responses) + "<br />"
            } else{
              
              survey = survey + "Hours of Operation:"  + "<br />"

              for (var k = 0; k < result[i].properties.asset.idResponses[j].responses.length; k++){
                
                survey = survey +  result[i].properties.asset.idResponses[j].responses[k] + "<br />"
              }
            }
          }

          //if(result[i].properties.parish){
            var marker = L.marker([parseFloat(result[i].properties.location.coordinates[1]), 
            parseFloat(result[i].properties.location.coordinates[0])], {icon: parishIcon
            }).bindTooltip(survey).on('mouseup', this.editAsset, this).on("mousedown", this.mousedown, result[i]);

            assetLayer.addLayer(marker)  

          //}else{
            /*
            var marker = L.marker([parseFloat(result[i].properties.location.coordinates[1]), 
            parseFloat(result[i].properties.location.coordinates[0])], {icon: myIcon
            }).bindTooltip(survey).on('mouseup', this.editAsset, this).on("mousedown", this.mousedown, result[i]);

            assetLayer.addLayer(marker)  
            */
          //}

    
        }
      }
      this.layers.push(assetLayer);
    })
  }

  getParcels(){

    var city = ""
    var type = "NONRESIDENTIAL"

    this.parcel.getParcels(city, type, this.bounds).subscribe(result =>{

      for( var i = 0; i < this.layers.length; i++){ 
        if ( this.layers[i].id === "PARCELS") {
          this.layers.splice(i, 1); 
        }
      }

      let parcelLayer = L.geoJSON(result, {onEachFeature: onEachFeature.bind(this)});

      function onEachFeature(feature: any, layer: any){
       
        var address = feature.properties.address.streetNum + " " + 
                      feature.properties.address.street + " " + 
                      feature.properties.address.suffix + " " + 
                      feature.properties.address.city + " " +
                      feature.properties.address.state + " " +
                      feature.properties.address.zip

        var owner = feature.properties.owners[0]

        var assessorCodes = feature.properties.assessorCodes.primary

        var lat = feature.properties.location.coordinates[1]
        var lng = feature.properties.location.coordinates[0]

        var displayData = "Address: " + address + "<br />"  + 
                          "Latitude: "  + lat  + "<br />" +
                          "Longitude: " + lng + "<br />" +
                          "Code: " + assessorCodes

        if (this.assetMapUserLvl === "TRIAL"){
          
          layer.bindTooltip(displayData);

        } else if (this.assetMapUserLvl === "VOLUNTEER" || this.assetMapUserLvl === "ADMINISTRATOR"){
          if (feature.properties.asset){
            layer.bindTooltip(displayData)
          } else{
            layer.on('mouseup', this.createNewAsset, this).on("mousedown", this.mousedown, feature).bindTooltip(displayData);
          }
        }

        if (feature.properties.asset) layer.setStyle({color: 'green'})
      }     
      parcelLayer['id'] = "PARCELS"  
      this.layers.push(parcelLayer);
    })

    
  }

  get selectedAsset(){
    return window.GlobalSelected
  }

  public mousedown(){
    window.GlobalSelected = this
  }

  onDrawReady(drawControl: any) {
    this.map = drawControl.options.edit;
  }

  locateUser(){

    this.userService.getUserLocation();
    this.userService.userLocation.subscribe(result=>{
      for( var i = 0; i < this.layers.length; i++){ 
        if ( this.layers[i].id === "USERLOC") {
          this.layers.splice(i, 1); 
        }
      }

      this.center = [result['coords'].latitude, result['coords'].longitude]

      localStorage.setItem('userLocation', this.center)
      var userLocationIcon = L.icon({ 
        iconUrl: '../assets/here.png', // pull out values as desired from the feature feature.properties.style.externalGraphic.
        iconSize: [25, 25],
        iconAnchor: [0, 0],
        shadowUrl: '../assets/marker-shadow.png',
      });
  
      var marker = L.marker([this.center[0], this.center[1]], {icon: userLocationIcon
      }).bindTooltip("You are here.");
  
      marker['id'] = "USERLOC"  
      this.layers.push(marker);
    })
  }

  detectMobile(){
    var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      console.log("THIS IS A MOBILE DEVICE")
    }
  }

  ngOnInit() { 
    var stringProfile = localStorage.getItem('userProfile');
    this.userProfile = JSON.parse(stringProfile)
    this.assetMapUserLvl = this.userProfile['user']['assetMapLvl']
    this.getAssets();
    //this.locateUser();
  }
}