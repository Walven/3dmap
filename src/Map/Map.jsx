import React, { Component } from 'react'
import { loadModules } from 'esri-loader';

import './Map.css'

class WebMapView extends Component {
    constructor(props) {
        super(props);
        this.mapRef = React.createRef();

        this.settings = {
            buildingsUrl: "https://services.arcgis.com/d3voDfTFbHOCRwVR/ArcGIS/rest/services/Batiments_3D_Paris/SceneServer/layers/0",
            monumentUrl: "https://services.arcgis.com/d3voDfTFbHOCRwVR/ArcGIS/rest/services/Batiments_3D_Paris/SceneServer/layers/1"
        }
    }

    componentDidMount() {

        loadModules([
            'esri/Map', 
            'esri/views/SceneView',
            "esri/layers/SceneLayer",
            "esri/layers/FeatureLayer",
            "esri/tasks/support/Query"
        ], { css: true })

        .then(([Map, SceneView, SceneLayer, FeatureLayer, Query]) => {
            // Create Map
            const map = new Map({
                basemap: "gray",
                ground: "world-elevation"
            });
    
            // Create view
            var view = this.view;
            view = new SceneView({
                container: this.mapRef.current,
                map: map,
                padding: {
                    top: 50
                },
                camera: {
                    position: {
                        latitude: 48.8583894,
                        longitude: 2.2945836,
                        z: 1500
                    },
                    tilt: 50
                }
            });
            
            // Scene layer with the buildings
            var buildingLayer = new SceneLayer({
                url: this.settings.buildingsUrl
            });

            var monumentLayer = new SceneLayer({
                url: this.settings.monumentUrl,
                popupTemplate: {
                    title: "Infrastructure",
                    content: 
                        `<p>Ceci est une infrastructure</p>
                        <a style="display: inline-block;color:white; background-color:#0069ff; padding:10px; border-radius:100px; text-decoration:none" id="discover" href=#>Découvrir</a>`,
                    overwriteActions: true
                }
            })

            map.addMany([buildingLayer, monumentLayer])

            // Create MeshSymbol3D for symbolizing SceneLayer
            var symbol = {
                type: "mesh-3d", // autocasts as new MeshSymbol3D()
                symbolLayers: [{
                    type: "fill", // autocasts as new FillSymbol3DLayer()
                    material: {
                        color: [244, 247, 134]
                    }
                }]
            };

            // Add the renderer to sceneLayer
            monumentLayer.renderer = {
                type: "simple", // autocasts as new SimpleRenderer()
                symbol: symbol
            };


            // retrieve the layer view of the scene layer
            view.whenLayerView(monumentLayer).then(function (sceneLayerView) {
                // register a click event on the view
                view.on("click", function (event) {
                // use hitTest to find if any graphics were clicked
                    view.hitTest(event).then(function (response) {
                        // check if a graphic is returned from the hitTest
                        if (response.results && response.results[0] && response.results[0].graphic) {
                            // Create query object
                            // by specifying objectIds, the query will return results only for
                            // the feature matching the graphic's objectid
                            var query = new Query({
                                objectIds: [
                                    response.results[0].graphic.attributes.OBJECTID
                                ],
                                // indicates the query should return all attributes
                                outFields: ["*"]
                            });
                            

                            view
                            .goTo({
                                target: response.results[0].graphic,
                                tilt: 60
                            }, {
                                duration: 3000,
                                easing:"out-expo"
                            })
                            .catch(function (error) {
                                if (error.name != "AbortError") {
                                  console.error(error);
                                }
                            });
                        }
                    });
                });
            });


            // add HTML element to the view
            //view.ui.add(document.getElementById("infoDiv"), "top-right");
        });
    }

    componentWillUnmount() {
        if (this.view) {
            // destroy the map view
            this.view.destroy();
        }
    }

    render() {
        return (
            <div id="Map">
                {/*<div id="infoDiv"></div>*/}
                <div id="viewDiv" className="webmap" ref={this.mapRef}/>
            </div>
        )
    }   
}

export default WebMapView

