"use client";

import React, { useState, useCallback, useEffect,useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents,FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import '../geospatial-app/geospatial.css';
import { parseGeoJSON, fitBoundsFromGeoJSON } from '../utilities/utlies'; 
import * as GeoTIFF from 'geotiff';
//import kmlparser from 'kml-parser';

export default function GeospatialApplication() {
  const [loggedInUser, setLoggedInUser] = useState('');
  const [newPlace, setNewPlace] = useState(null);
  const [viewport, setViewport] = useState({
    center: [12.9716, 77.5946],
    zoom: 13,
  });
  const [geoData, setGeoData] = useState(null);
  const [layerVisible, setLayerVisible] = useState(false);
  const [popupText, setPopupText] = useState('');

  const handlePopupTextChange = (e) => {
    setPopupText(e.target.value);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        let fileContent = e.target.result;
        let parsedData;
        try {
          if (file.type === 'application/json' ||
            file.name.endsWith('.json') || file.name.endsWith('.geojson')) {
            parsedData = parseGeoJSON(fileContent);
          } else if (
            file.type.startsWith('image/tiff') ||
            file.type.startsWith('image/x-tiff') ||
            file.name.endsWith('.tiff') ||
            file.name.endsWith('.tif')
          ) {
            const tiff = await GeoTIFF.fromArrayBuffer(new TextEncoder().encode(fileContent).buffer);
            const image = await tiff.getImage();
            const geojson = await image.getGeoJSON();
            parsedData = geojson;
          }

          setGeoData(parsedData);

          if (parsedData) {
            const { latitude, longitude, zoom } = fitBoundsFromGeoJSON(parsedData);
            setViewport({ center: [latitude, longitude], zoom }); 
            setLayerVisible(true);
            console.log({ center: [latitude, longitude], zoom });
          }
        } catch (error) {
          console.error('Error parsing file:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('loggedInUser');
      setLoggedInUser(user);
    }
  }, []);

  const handleMapClick = (e) => {
    setNewPlace({
      lat: e.latlng.lat,
      long: e.latlng.lng,
    });
  };

  const MapEvents = () => {
    useMapEvents({
      click: handleMapClick,
    });
    return null;
  };

  const featureGroupRef = useRef(null);

  return (
    <div className="container w-100 Wrapper">
      <div className='leftSidePartWrap'>
        <h4>Welcome <span>{loggedInUser}</span>!</h4>
      </div>

      <div className='BottomSidePartWrap'>
        <div className='uploadFilesSection'>
          <div className='TxtUpload'>
            <h4>Upload Files</h4>
          </div>

          <div className='TxtUpload'>
            <p>Please Upload GeoJSON/GeoTIFF Files*</p>
          </div>

          <div className='Wrapper'>
            <div>
              <input type="file" id="file" accept=".geojson,.json,.tiff,.tif" onChange={handleFileUpload} />
              <label htmlFor="file">Choose a file</label>
            </div>
          </div>

        </div>

        <div className='MapsSection'>
      <MapContainer key={`${viewport.center}-${viewport.zoom}-${geoData ? geoData.features.length : 0}`} center={viewport.center} zoom={viewport.zoom} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents />
        {newPlace && (
          <Marker position={[newPlace.lat, newPlace.long]}>
            <Popup>
              <input 
                type="text" 
                value={popupText} 
                onChange={handlePopupTextChange} 
                placeholder="Enter text" 
              />
            </Popup>
          </Marker>
        )}
        <FeatureGroup ref={featureGroupRef}>
        <EditControl
          position='topright'
          onCreated={(e) => {
            const { layerType, layer } = e;
            if (layerType === 'marker') {
              const { _latlng } = layer;
              console.log('Marker created at:', _latlng);
            }
          }}
          draw={{
            rectangle: true,
            polyline: true,
            polygon: true,
            circle: true,
            marker: true,
          }}
        />
        {geoData && geoData.features.map((feature, index) => {
            const { geometry } = feature;
            if (geometry.type === 'Point') {
              const [lng, lat] = geometry.coordinates;
              return (
                <Marker key={index} position={[lat, lng]}>
                  <Popup>
                    <input 
                      type="text" 
                      value={feature.properties.name || ''} 
                      onChange={(e) => {
                        const updatedGeoData = { ...geoData };
                        updatedGeoData.features[index].properties.name = e.target.value;
                        setGeoData(updatedGeoData);
                      }} 
                      placeholder="Enter text" 
                    />
                  </Popup>
                </Marker>
              );
            }
            return null;
          })}
        </FeatureGroup>
        
      </MapContainer>
    </div>
      </div>
    </div>
  );
}