import { Component, OnInit,  NgZone  } from '@angular/core';
import * as L from 'leaflet';
import {CensustractService} from '../services/censustract/censustract.service'
import {MatDialog} from '@angular/material';
import {CensusTractDialog} from './targetDialogs/censustractDialog'

import {TargetService} from '../services/target/target.service'
import {ParcelService} from '../services/parcel/parcel.service'
import {AssetDialog} from './targetDialogs/assetDialog'
import {FilterDialog} from './targetDialogs/filterDialog'
import {ActivityService} from '../services/activity/activity.service'
import {NonGeoTargetDialog} from './targetDialogs/nonGeoTargetDialog'
import {TargetSummaryDialog} from './targetDialogs/targetSummaryDialog'
import {PersonService} from '../services/person/person.service'
import {PolyTargetDialog} from './targetDialogs/polyTargetDialog'
import * as $ from "jquery";



declare global {
  interface Window { GlobalSelected: any; }
}

@Component({
  selector: 'app-targeting',
  templateUrl: './targeting.component.html',
  styleUrls: ['./targeting.component.scss']
})
export class TargetingComponent implements OnInit {

  constructor(public dialog: MatDialog, 
              public censustractService: CensustractService, 
              private personService: PersonService,
              public zone: NgZone, 
              public targetService: TargetService, 
              public parcelService: ParcelService,
              public activityService: ActivityService,
              ) { }
  layersControl = {overlays: {}};
  layers = []
  filter;
  bounds: any;
  leafletMap: any;
  jsonPolygonCreated: any;
  map: any;
  mapInitialized = false;

  targetingLoaded = false;

  tracts = []
  center;
  zoom = 9


  options = {
    layers: [L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 20, attribution: '...' })],
    zoom: 12,
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

  drawCreated(draw: any){
    this.jsonPolygonCreated = draw.layer.toGeoJSON()
    draw.layer.on('click', this.createNewPoly, this).bindTooltip("Click to create a new Target.")  
  }

  onDrawReady(drawControl: any) {
    this.map = drawControl.options.edit;
  }



  onMapReady(map: L.Map){
    this.leafletMap = map;
    this.bounds = this.leafletMap.getBounds(); 
    this.getAllTargetProperties();
    
    
  }

  mapMoved(e: any){
    if(this.layersControl.overlays['Block Groups']._map){
      this.bounds = this.leafletMap.getBounds();
      this.getAllTargetProperties();
    }
  }

  getMembers(){
    var memberLayer = new L.LayerGroup();
    memberLayer['id'] = "MEMBERS";
    var orgID = localStorage.getItem('orgID');

    this.personService.getMembers(orgID).subscribe((members: []) => {
      for(var i = 0; i < members.length; i++){
        if(members[i]['address']){
          if(members[i]['address']['location']['coordinates'][1]){

            var lat = parseFloat(members[i]['address']['location']['coordinates'][1])
            var lng = parseFloat(members[i]['address']['location']['coordinates'][0])
  
            var message = members[i]['address']['streetNum'] + " " + members[i]['address']['street'] + " " + members[i]['address']['suffix']
            var circle = L.circle([lat,lng],{radius: 50, color: "red"} ).bindTooltip(message);
  
            memberLayer.addLayer(circle) 
          }
        }
      }
      this.layers.push(memberLayer);
      this.layersControl.overlays['Members'] = memberLayer;
    })
  }

  getAllTargetProperties(){
    var campaignID = parseInt(localStorage.getItem('campaignID'))
    this.targetService.getAllTargetProperties(campaignID).subscribe(targets =>{      
      this.getAllCensusTracts(targets);
    })
  }

  getAllCensusTracts(targets){
    for (var i = 0; i< this.layers.length; i++ ){
      if(this.layers[i]['id'] === "TRACTS"){
        this.layers.splice(i, 1)
      }
    }
    var campaignID = parseInt(localStorage.getItem('campaignID'))

    var orgID = localStorage.getItem('orgID')

    var targetGeoids = targets.map(target => target.params.id)

    this.censustractService.getAllCensusTracts(this.bounds).subscribe(tracts =>{
      this.tracts = tracts


      let layer = L.geoJSON(tracts, {onEachFeature: onEachFeature.bind(this)});

      function onEachFeature(feature: any, layer: any){

        var tractData = "GeoID: " + feature.properties.geoid + "<br/>"  +
                        "# Occupied Units: " + feature.properties.numOccupiedUnits + "<br/>" +
                        "LRS: " + feature.properties.lrs + "<br/>"

        if (feature.properties.lrs > 0.0){
          for(var i = 0; i < targets.length; i++){
            if((targets[i].campaignID === campaignID) && (targets[i].status === "REGISTERED") && (feature.properties.geoid === targets[i].params.id)){
              layer.bindTooltip(tractData).on('mouseup', this.selectBlock, this).on("mousedown", this.getSelected, feature).setStyle({color: 'red', fillColor: 'red'});
            }
            
            if ((targets[i].campaignID === campaignID) && (targets[i].status === "LOCKED") && (feature.properties.geoid === targets[i].params.id)){
              layer.bindTooltip(tractData).on('mouseup', this.selectBlock, this).on("mousedown", this.getSelected, feature).setStyle({color: 'green', fillColor: 'green'});
            }

            if ((targets[i].campaignID === campaignID) && (targets[i].orgID === orgID) && (feature.properties.geoid === targets[i].params.id)){
              layer.bindTooltip(tractData).on('mouseup', this.selectBlock, this).on("mousedown", this.getSelected, feature).setStyle({color: 'purple'}).bringToFront();
            }
          }

          if( !targetGeoids.includes(feature.properties.geoid)){
            layer.bindTooltip(tractData).on('mouseup', this.selectBlock, this).on("mousedown", this.getSelected, feature);
          }

            
        } else{
          layer.setStyle({color: 'clear'});
        }
      };

      layer['id'] = "TRACTS"

      this.layers.push(layer);
      this.layersControl.overlays['Block Groups'] = layer;
      this.targetingLoaded = false;
    })
  }

  get selected(){
    return window.GlobalSelected
  }

  public getSelected(){
    window.GlobalSelected = this
  }

  selectBlock(){
    this.zone.run(() => {
      const dialogRef = this.dialog.open(CensusTractDialog, {data: this.selected});
      dialogRef.afterClosed().subscribe(result => {
        if(result){

          for (var i = 0; i< this.layers.length; i++ ){
            if(this.layers[i]['id'] === "TRACTS"){
              this.layers.splice(i, 1)
            }
          }
          this.getAllTargetProperties();
        }
      });
    });
  }

  selectAsset(){
    this.zone.run(() => {
      const dialogRef = this.dialog.open(AssetDialog, {data: this.selected});
      dialogRef.afterClosed().subscribe(result => {
        if(result){
          this.getAllEvents(this.filter);
        }
      });
    });
  }

  getAssets(events, filter){

    for (var i = 0; i< this.layers.length; i++ ){
      if(this.layers[i]['id'] === "ASSETS"){
        this.layers.splice(i, 1)
      }
    }

    var assetIDs = []

    for(var i = 0; i < events.length; i++){
      assetIDs.push(events[i].assetID)
    }

    var noEventIcon = L.icon({ 
      iconUrl: '../assets/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [11, 41],
      popupAnchor: [-3, -76],
      shadowUrl: '../assets/marker-shadow.png',
      shadowSize: [68, 95],
      shadowAnchor: [22, 94]
    });

    var registeredIcon = L.icon({ 
      iconUrl: '../assets/redMarker.png',
      iconSize: [25, 41],
      iconAnchor: [11, 41],
      popupAnchor: [-3, -76],
      shadowUrl: '../assets/marker-shadow.png',
      shadowSize: [68, 95],
      shadowAnchor: [22, 94]
    });

    var assetLayer = new L.LayerGroup();
    assetLayer['id'] = "ASSETS"

    var filter = filter
    this.parcelService.getAssets(filter).subscribe(result=>{

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

          if(assetIDs.includes(result[i]._id)){
            var marker = L.marker([parseFloat(result[i].properties.location.coordinates[1]),parseFloat(result[i].properties.location.coordinates[0])], 
            {icon: registeredIcon}).bindTooltip(survey).on('mouseup', this.selectAsset, this).on("mousedown", this.getSelected, result[i])
          } else{
            var marker = L.marker([parseFloat(result[i].properties.location.coordinates[1]),parseFloat(result[i].properties.location.coordinates[0])], 
            {icon: noEventIcon}).bindTooltip(survey).on('mouseup', this.selectAsset, this).on("mousedown", this.getSelected, result[i])
          }

         assetLayer.addLayer(marker)   
        }
        
      }
      this.layers.push(assetLayer);
      this.layersControl['overlays']['Assets'] = assetLayer;
   
    })
  }

  getAllEvents(filter){
    var campaignID = parseInt(localStorage.getItem('campaignID'))
    var orgID = localStorage.getItem('orgID')

    this.activityService.getActivities(campaignID, orgID, "Event").subscribe(events =>{
      this.getAssets(events,filter)
    })
  }

  filterAssets(){
    this.zone.run(() => {
      const dialogRef = this.dialog.open(FilterDialog, {data: this.tracts});
      dialogRef.afterClosed().subscribe(properties => {

        if(properties){
          this.center = [properties.location.coordinates[1], properties.location.coordinates[0]]
        }
        /*
        if(filter){
          this.filter = filter
          this.getAllEvents(this.filter);
        }*/
      });
    });
  }

  createNonGeographicTarget(){
    this.zone.run(() => {
      const dialogRef = this.dialog.open(NonGeoTargetDialog);
      dialogRef.afterClosed().subscribe(filter => {
        if(filter){
          this.filter = filter
          this.getAllEvents(this.filter);
        }
      });
    });
  }

  openTargetSummary(){
    this.zone.run(() => {
      this.dialog.open(TargetSummaryDialog);
    });
  }

  getOrgTargets(){
    var campaignID = parseInt(localStorage.getItem('campaignID'));
    var orgID = localStorage.getItem('orgID');

    this.targetService.getOrgTargets(campaignID, orgID).subscribe((targets: any) =>{
      let layer = L.geoJSON(targets, {filter: filter.bind(this), onEachFeature: onEachFeature.bind(this)});

      function filter(feature){
          return feature.properties.params.targetType === "POLYGON"
      }

      function onEachFeature(feature, layer){
        layer.bindTooltip(feature.properties.targetName).setStyle({color: 'green'}).on('mouseup', this.selectedPolygon, this).on("mousedown", this.getSelected, feature)
      }
      
      layer['id'] = "POLYS"

      this.layers.push(layer);
      this.layersControl.overlays['Polygons'] = layer;
    
    })
  }

  selectedPolygon(){
    this.zone.run(() => {
      const dialogRef = this.dialog.open(PolyTargetDialog, {data: {selectedPolygon: this.selected, mode:"EDIT"}});
      dialogRef.afterClosed().subscribe(result => {
        if(result){
          for (var i = 0; i< this.layers.length; i++ ){
            if(this.layers[i]['id'] === "POLYS"){
              this.layers.splice(i, 1)
            }
          }
          this.getOrgTargets()
        }
      });
    })
  }

  createNewPoly(markerData: any){
    this.jsonPolygonCreated['properties']['location'] = {type: "Point", coordinates: [markerData.latlng.lng, markerData.latlng.lat]}
    
    this.zone.run(() => {
      const dialogRef = this.dialog.open(PolyTargetDialog, {data: {createdPolygon: this.jsonPolygonCreated, mode: "CREATE"}});
      dialogRef.afterClosed().subscribe(result => {
        if(result){
          var map = this.map.featureGroup;
          map.eachLayer(function (layer) {map.removeLayer(layer);});
          this.getOrgTargets()
        }
      });
    })
  }
  
  ngOnInit() {
    this.targetingLoaded = true;

    this.getAllEvents(this.filter);
    this.getMembers();
    this.getOrgTargets();
  }

}
