import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Map, Source, Layer } from "react-map-gl/maplibre";
import { AmbientLight, PointLight, LightingEffect } from "@deck.gl/core";
import { HexagonLayer } from "@deck.gl/aggregation-layers";
import { ColumnLayer } from "@deck.gl/layers";
import DeckGL from "@deck.gl/react";
import { CSVLoader } from "@loaders.gl/csv";
import { load } from "@loaders.gl/core";
import ControlPanel from "./components/ControlPanel";
import type { Color, PickingInfo, MapViewState, ViewStateChangeParameters } from "@deck.gl/core";
import SideModal from "./components/SideModal";
import { Dashboard } from "./components/Dashboard";
import axios from "axios";
import { config } from "./config.js";
import OpenAI from "openai";
const openai = new OpenAI({apiKey: config.API_KEY, dangerouslyAllowBrowser: true});

// Source data CSV
const DATA_URL = "./sampled_metropolitan_data.csv";


const policeStations = [
  { name: "Dagenham Police Station", postcode: "RM10 7TU", latitude: 51.54511, longitude: 0.16556, officersAvailable: 11 },
  { name: "Ilford Police Station", postcode: "IG1 1GT", latitude: 51.56029, longitude: 0.08041, officersAvailable: 15 },
  { name: "Barking Learning Centre", postcode: "IG11 7NB", latitude: 51.53632, longitude: 0.07979, officersAvailable: 19 },
  { name: "Romford Police Station", postcode: "RM1 3BJ", latitude: 51.58203, longitude: 0.18618, officersAvailable: 11 },
  { name: "Borehamwood Police Station (Hertfordshire Constabulary)", postcode: "WD6 1WA", latitude: 51.65961, longitude: -0.26848, officersAvailable: 1 },
  { name: "Colindale Police Station", postcode: "NW9 5TW", latitude: 51.59691, longitude: -0.24126, officersAvailable: 11 },
  { name: "Edmonton Police Station", postcode: "N9 0PW", latitude: 51.62233, longitude: -0.06114, officersAvailable: 0 },
  { name: "Bexleyheath Police Station", postcode: "DA7 4QS", latitude: 51.45705, longitude: 0.14911, officersAvailable: 1 },
  { name: "Dartford Contact Point (Kent Police)", postcode: "DA1 1DR", latitude: 51.44666, longitude: 0.21926, officersAvailable: 4 },
  { name: "Swanley Police Station (Kent Police)", postcode: "BR8 7AJ", latitude: 51.39804, longitude: 0.17072, officersAvailable: 3 },
  { name: "Wembley Police Station (British Transport Police)", postcode: "HA9 9AA", latitude: 51.56332, longitude: -0.27924, officersAvailable: 9 },
  { name: "Wembley Police Station", postcode: "HA0 2HH", latitude: 51.55153, longitude: -0.30587, officersAvailable: 9 },
  { name: "Kentish Town Police Station", postcode: "NW5 3AE", latitude: 51.54968, longitude: -0.14202, officersAvailable: 5 },
  { name: "Bromley Police Station", postcode: "BR1 1ER", latitude: 51.39937, longitude: 0.01788, officersAvailable: 16 },
  { name: "Lewisham Police Station", postcode: "SE13 5JZ", latitude: 51.46327, longitude: -0.00978, officersAvailable: 1 },
  { name: "Croydon Police Station (British Transport Police)", postcode: "CR0 6SR", latitude: 51.37564, longitude: -0.09041, officersAvailable: 3 },
  { name: "Croydon Police Station", postcode: "CR9 1BP", latitude: 51.3709, longitude: -0.0959, officersAvailable: 20 },
  { name: "Euston Police Station (British Transport Police)", postcode: "NW1 2DU", latitude: 51.52866, longitude: -0.1333, officersAvailable: 2 },
  { name: "Islington Police Station", postcode: "N1 0YY", latitude: 51.53384, longitude: -0.11089, officersAvailable: 16 },
  { name: "Paddington Police Station (British Transport Police)", postcode: "W2 1FT", latitude: 51.51751, longitude: -0.17741, officersAvailable: 4 },
  { name: "Mitcham Police Station", postcode: "CR4 4LA", latitude: 51.40012, longitude: -0.16705, officersAvailable: 9 },
  { name: "Sutton Police Station", postcode: "SM1 4RF", latitude: 51.36122, longitude: -0.19108, officersAvailable: 12 },
  { name: "Acton Police Station", postcode: "W3 9BH", latitude: 51.50849, longitude: -0.27581, officersAvailable: 20 },
  { name: "Hammersmith Police Station", postcode: "W6 7NX", latitude: 51.49463, longitude: -0.22431, officersAvailable: 1 },
  { name: "Chingford Police Station", postcode: "E4 7EA", latitude: 51.63195, longitude: -0.0019, officersAvailable: 12 },
  { name: "Cheshunt Police Station (Hertfordshire Constabulary)", postcode: "EN8 9BD", latitude: 51.70292, longitude: -0.03489, officersAvailable: 19 },
  { name: "West Ham Police Station (British Transport Police)", postcode: "E15 3AT", latitude: 51.52948, longitude: 0.00539, officersAvailable: 0 },
  { name: "Stratford Police Station", postcode: "E15 4SG", latitude: 51.53915, longitude: 0.00397, officersAvailable: 9 },
  { name: "Bethnal Green Police Station", postcode: "E2 9NZ", latitude: 51.52812, longitude: -0.05371, officersAvailable: 7 },
  { name: "Stoke Newington Police Station", postcode: "N16 8DS", latitude: 51.55785, longitude: -0.07482, officersAvailable: 15 },
  { name: "Bishopsgate (City of London Police)", postcode: "EC2M 4NP", latitude: 51.51773, longitude: -0.07999, officersAvailable: 15 },
  { name: "Harrow Police Station", postcode: "HA2 0DN", latitude: 51.56843, longitude: -0.34856, officersAvailable: 12 },
  { name: "Oxhey Police Station (Hertfordshire Constabulary)", postcode: "WD19 7SD", latitude: 51.6259, longitude: -0.38928, officersAvailable: 16 },
  { name: "Barkingside Police Station", postcode: "IG6 1QB", latitude: 51.58824, longitude: 0.08046, officersAvailable: 18 },
  { name: "Hayes Police Station", postcode: "UB4 8HU", latitude: 51.52519, longitude: -0.43507, officersAvailable: 14 },
  { name: "Hounslow Police Station", postcode: "TW3 1LB", latitude: 51.46912, longitude: -0.36432, officersAvailable: 19 },
  { name: "Twickenham Police Station", postcode: "TW1 3SY", latitude: 51.44788, longitude: -0.32938, officersAvailable: 3 },
  { name: "Ebbsfleet Police Station (British Transport Police)", postcode: "DA10 1EB", latitude: 51.44302, longitude: 0.32095, officersAvailable: 16 },
  { name: "Kingston Police Station", postcode: "KT1 1LB", latitude: 51.40827, longitude: -0.3069, officersAvailable: 4 },
  { name: "Elmbridge Civic Centre (Surrey Police)", postcode: "KT10 9SD", latitude: 51.36992, longitude: -0.36191, officersAvailable: 5 },
  { name: "Charing Cross Police Station", postcode: "WC2N 4JP", latitude: 51.50979, longitude: -0.12466, officersAvailable: 8 },
  { name: "Spring House (British Transport Police)", postcode: "N7 8JL", latitude: 51.54869, longitude: -0.10703, officersAvailable: 10 },
  { name: "London Bridge (British Transport Police)", postcode: "SE1 9SG", latitude: 51.50496, longitude: -0.08765, officersAvailable: 2 },
  { name: "Wimbledon Police Station", postcode: "SW19 8NN", latitude: 51.42117, longitude: -0.20351, officersAvailable: 16 },
  { name: "Epsom Town Hall (Surrey Police)", postcode: "KT18 5BY", latitude: 51.33279, longitude: -0.26502, officersAvailable: 4 },
  { name: "Forest Gate Police Station", postcode: "E7 8BS", latitude: 51.54677, longitude: 0.03139, officersAvailable: 6 },
  { name: "Lavender Hill Police Station", postcode: "SW11 1JX", latitude: 51.46468, longitude: -0.1622, officersAvailable: 10 },
  { name: "Kensington Police Station", postcode: "W8 6EQ", latitude: 51.49701, longitude: -0.19756, officersAvailable: 2 }
];


const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0,
});

const pointLight1 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-0.144528, 49.739968, 80000],
});

const pointLight2 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-3.807751, 54.104682, 8000],
});

const lightingEffect = new LightingEffect({
  ambientLight,
  pointLight1,
  pointLight2,
});

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -0.1276,
  latitude: 51.5074,
  zoom: 10,
  minZoom: 5,
  maxZoom: 15,
  pitch: 40.5,
  bearing: -27,
};

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json";

export const colorRange: Color[] = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78],
];

type DataPoint = [longitude: number, latitude: number, timestamp: number];

const staticGeojson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-0.1494, 51.5583],
          
          ],
        ],
      },
      properties: {
        name: "placehold",
        colour: [255, 0, 0],
      },
    },
  ],
};

export default function App({
  data = null,
  mapStyle = MAP_STYLE,
  radius = 100,
  upperPercentile = 100,
  coverage = 1,
}: {
  data?: DataPoint[] | null;
  mapStyle?: string;
  radius?: number;
  upperPercentile?: number;
  coverage?: number;
}) {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [selectedBorough, setSelectedBorough] = useState<string | null>(null);
  const [elevationScale, setElevationScale] = useState(5);
  const [barRadius, setBarRadius] = useState(radius);
  // We no longer use clickedLocation for the modal
  const [clickedLocation, setClickedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [geojsonData, setGeojson] = useState<any>(null);
  const [pings, setPings] = useState<
    { id: number; lat: number; lng: number, crime: any, severity: any}[]
  >([]);

  const addMessage = (message: {
    id: number;
    lat: number;
    lng: number;
    crime: any ;
    severity: any;
  }) => {
    setPings((prev) => [...prev, message]);
  };

  // Define London's bounds for generating random ping locations
  const londonBounds = {
    north: 51.686,
    south: 51.286,
    west: -0.51,
    east: 0.334,
  };

  // Load the detailed borough GeoJSON and compute a fill colour for each borough.
  useEffect(() => {
    fetch("./lad.json")
      .then((response) => response.json())
      .then((data) => {
        const londonBoroughs = {
          ...data,
          features: data.features.filter((feature) =>
            feature.properties.LAD13CD.startsWith("E09")
          ),
        };

        const boroughNames = [
          ...new Set(
            londonBoroughs.features.map((feature) => feature.properties.LAD13NM)
          ),
        ];

        const boroughColorMapping: Record<string, string> = {};
        boroughNames.forEach((name) => {
          boroughColorMapping[name] = getRandomPastelColor();
        });

        londonBoroughs.features = londonBoroughs.features.map((feature) => ({
          ...feature,
          properties: {
            ...feature.properties,
            fillColor: boroughColorMapping[feature.properties.LAD13NM],
          },
        }));

        setGeojson(londonBoroughs);
      })
      .catch((error) => console.error("Error loading GeoJSON:", error));
  }, []);

  // Compute a mapping of borough names to bounding boxes based on the loaded GeoJSON.
  // If geojsonData is not yet available, we fall back to the staticGeojson.
  const boroughsMapping = useMemo(() => {
    const source = geojsonData || staticGeojson;
    return source.features.reduce((acc: any, feature: any) => {
      // Use LAD13NM from the loaded data or fallback to the static property name
      const name = feature.properties.LAD13NM || feature.properties.name;
      // Assumes polygon geometry with one set of coordinates
      const coordinates = feature.geometry.coordinates[0];
      const lats = coordinates.map((coord: number[]) => coord[1]);
      const lngs = coordinates.map((coord: number[]) => coord[0]);

      acc[name] = {
        north: Math.max(...lats),
        south: Math.min(...lats),
        west: Math.min(...lngs),
        east: Math.max(...lngs),
      };

      return acc;
    }, {});
  }, [geojsonData]);

  // Define the tooltip function inside the component so we have access to boroughsMapping.
  const getTooltip = ({ object }: PickingInfo) => {
    if (!object || !object.position || !object.count) return null;
    const { position, count } = object;
    const [lng, lat] = position;

    console.log("object", object);

    return `
      ${count} Crimes (last 6 months)
    `;
  };

  const [selectedTime, setSelectedTime] = useState(12);

  const timeWindow = 1; // in hours
  // First filter by borough if required
  const filteredDataByBorough = selectedBorough
    ? data?.filter((d) => {
        const borough = boroughsMapping[selectedBorough];
        if (!borough) return false;
        return (
          d[0] >= borough.west &&
          d[0] <= borough.east &&
          d[1] >= borough.south &&
          d[1] <= borough.north
        );
      })
    : data;

  // Then filter by time of day
  const filteredData = filteredDataByBorough?.filter(
    (d) => Math.abs(d[2] - selectedTime) <= timeWindow
  );

  // Define the layers for the main map, including the heatmap and the ping layer.
  const layers = [
    new HexagonLayer<DataPoint>({
      id: "heatmap",
      gpuAggregation: true,
      colorRange,
      coverage,
      data: filteredData,
      elevationRange: [0, 3000],
      elevationScale: filteredData && filteredData.length ? elevationScale : 0,
      extruded: true,
      getPosition: (d) => d,
      pickable: true,
      radius: barRadius,
      upperPercentile,
      material: {
        ambient: 0.64,
        diffuse: 0.6,
        shininess: 32,
        specularColor: [51, 51, 51],
      },
      transitions: {
        elevationScale: 3000,
      },
    }),

    new ColumnLayer({
      id: "ping-layer",
      data: pings,
      diskResolution: 12,
      radius: 100,
      extruded: true,
      pickable: true,
      elevationScale: 500,
      getPosition: (d) => [d.lng, d.lat],
      getFillColor: [255, 0, 0],
      getElevation: 1000,
    }),
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setViewState((prevState) => ({
      ...prevState,
      [name]: parseFloat(value),
    }));
  };

  // Update selected borough based on the option chosen in the selector.
  const handleBoroughChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBorough(e.target.value);
  };

  const handleElevationScaleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setElevationScale(parseFloat(e.target.value));
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBarRadius(parseFloat(e.target.value));
  };

  const getRandomPastelColor = () => {
    const r = Math.floor(Math.random() * 127 + 127);
    const g = Math.floor(Math.random() * 127 + 127);
    const b = Math.floor(Math.random() * 127 + 127);
    return `rgb(${r},${g},${b})`;
  };

  const layerStyle = {
    id: "boroughs-layer",
    type: "fill",
    paint: {
      "fill-color": ["get", "fillColor"],
      "fill-opacity": 0.5,
    },
  };

  const [roadsGeoJSON, setRoadsGeoJSON] = useState(null);

  

  const suggestForceDeployment = async (
    crime_ping: any,
    crime_severity: any,
    lng: number,
    lat: number
  ) => {
    console.log("here");
  
    // Helper function to compute distance in km
    const getDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
      const R = 6371; // Earth radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };
  
    // Find the nearest police station
    const nearestStation = policeStations.reduce((prev, curr) =>
      getDistanceKm(lat, lng, prev.latitude, prev.longitude) < 
      getDistanceKm(lat, lng, curr.latitude, curr.longitude)
        ? prev
        : curr
    );
  
    const officersAvailable = nearestStation.officersAvailable;
    
    // **Count only incidents within 10km of the nearest police station**
    const nearbyPings = pings.filter((ping) => 
      getDistanceKm(ping.lat, ping.lng, nearestStation.latitude, nearestStation.longitude) <= 10
    );
  
    const criticalSeverityCount = nearbyPings.filter((ping) => ping.severity === "Critical").length;
    const highSeverityCount = nearbyPings.filter((ping) => ping.severity === "High").length;
    const mediumSeverityCount = nearbyPings.filter((ping) => ping.severity === "Medium").length;
    const lowSeverityCount = nearbyPings.filter((ping) => ping.severity === "Low").length;
  
    const prompt = `Given a crime ping of type "${crime_ping}" with severity "${crime_severity}" at coordinates (${lat}, ${lng}) at time (${new Date().toISOString()}), and considering that the nearest police station is "${nearestStation.name}" with ${officersAvailable} officers available, how many officers should be dispatched from this station? 
  
    Currently, within a 10km radius of this police station, there are:
    - ${criticalSeverityCount} Critical severity incidents,
    - ${highSeverityCount} High severity incidents,
    - ${mediumSeverityCount} Medium severity incidents,
    - ${lowSeverityCount} Low severity incidents.
  
    Please specify the **exact number of officers to dispatch** and confirm that they will be sent from "${nearestStation.name}".`;
  
    console.log(prompt);
  
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are an assistant that helps in optimal police force allocation. Your responses should be concise, informative, and must specify the exact number of officers to be dispatched and the station they are coming from."
          },
          { role: "user", content: prompt }
        ]
      });
  
      const suggestion = completion.choices[0].message.content;
      console.log(suggestion);
  
      // Add OpenAI suggestion as a message
      addMessage({
        id: Date.now(),
        lat,
        lng,
        crime: suggestion, 
        severity: 0
      });
    } catch (error) {
      console.error("Error generating suggestion:", error);
    }
  };
  
  const handleMapClick = async (info: PickingInfo) => {
    if (!info.coordinate) return;

    const [lng, lat] = info.coordinate;
    setClickedLocation({ lat, lng });

    // Query Overpass API for roads within 1km
    const query = `
            [out:json];
            way(around:1000, ${lat}, ${lng})["highway"];
            (._;>;);
            out body;
        `;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
      query
    )}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.elements) {
        const roadFeatures = data.elements
          .filter((el) => el.type === "way" && el.nodes)
          .map((way) => {
            const coordinates = way.nodes
              .map((nodeId) => {
                const node = data.elements.find((el) => el.id === nodeId);
                return node ? [node.lon, node.lat] : null;
              })
              .filter(Boolean);

            if (coordinates.length < 2) return null; // Ignore single-point lines

            return {
              type: "Feature",
              properties: { id: way.id },
              geometry: {
                type: "LineString",
                coordinates,
              },
            };
          })
          .filter(Boolean);

        setRoadsGeoJSON({
          type: "FeatureCollection",
          features: roadFeatures,
        });

        console.log("Roads fetched:", roadFeatures);
      }
    } catch (error) {
      console.error("Error fetching roads:", error);
    }
  };

  const crimeSeverityMapping = {
    "anti-social behaviour": "Low",
    "bicycle theft": "Low",
    "criminal damage and arson": "Medium",
    "drugs": "Medium",
    "public order": "Medium",
    "shoplifting": "Low",
    "theft from the person": "Medium",
    "vehicle crime": "Medium",
    "burglary": "High",
    "robbery": "High",
    "violence and sexual offences": "High",
    "possession of weapons": "High",
    "other theft": "Medium",
    "other crime": "Medium",
    "homicide": "Critical",
    "kidnapping": "Critical",
    "terrorism": "Critical"
  };

  const [crime, setCrime] = useState<{ type: string; severity: string } | null>(null);
  
  

  // Modified ping handler: adds a ping, calls the predict API, then removes the ping after n seconds.
  const handleAddPing = () => {
    let selectedBounds: { north: number; south: number; west: number; east: number } | null = null;
  
    if (selectedBorough && boroughsMapping[selectedBorough]) {
      selectedBounds = boroughsMapping[selectedBorough];
    } else if (!selectedBorough && Object.keys(boroughsMapping).length > 0) {
      // If no borough is selected, fall back to the entire London bounding box
      selectedBounds = londonBounds;
    }
  
    if (!selectedBounds) {
      console.warn("No valid bounding box found for selected borough.");
      return;
    }
  
    // Generate a random location within the selected borough’s bounds
    const lat =
      Math.random() * (selectedBounds.north - selectedBounds.south) +
      selectedBounds.south;
    const lng =
      Math.random() * (selectedBounds.east - selectedBounds.west) +
      selectedBounds.west;
    
    // Choose a random crime type from the dictionary
    const crimeTypes = Object.keys(crimeSeverityMapping);
    const randomCrimeType = crimeTypes[Math.floor(Math.random() * crimeTypes.length)];
    const newPing = { id: Date.now(), lat, lng, crime: randomCrimeType, severity: crimeSeverityMapping[randomCrimeType] };
    setPings((prev) => [...prev, newPing]);

    // Call the predict API using the random crime type
    handlePredict(newPing.lng, newPing.lat, randomCrimeType);
  
    setTimeout(() => {
      setPings((currentPings) =>
        currentPings.filter((p) => p.id !== newPing.id)
      );
    }, 20000);
  };
  

  // Modified closeModal: now clears the pings (which controls the modal).
  const closeModal = () => {
    setPings([]);
  };

  const [predictionResponse, setPredictionResponse] = useState(null);
  const [prediction, setPrediction] = useState(null);

  const handlePredictionResponse = (data) => {
    setPredictionResponse(data);
  };

  const handlePredict = async (
    longitude: number,
    latitude: number,
    crimeType: string
  ) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/predict",
        { longitude, latitude, crimeType },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log(response.data);
      handlePredictionResponse(response.data);
    } catch (error) {
      console.error("Error making prediction:", error);
    }
  };

  // Compute the last ping (if any) to use as the centre for the SideModal.
  const lastPing =
    pings && pings.length > 0 ? pings[pings.length - 1] : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ flex: 3, position: "relative" }}>
        <DeckGL
          layers={layers}
          effects={[lightingEffect]}
          viewState={viewState}
          onViewStateChange={(params) =>
            setViewState(params.viewState as unknown as MapViewState)
          }
          controller={{ dragRotate: true }}
          getTooltip={getTooltip}
          onClick={handleMapClick}
        >
          <Map reuseMaps mapStyle={mapStyle}>
            <Source
              id="london-boroughs"
              type="geojson"
              data={geojsonData || staticGeojson}
            >
              <Layer {...layerStyle} />
            </Source>
          </Map>
        </DeckGL>
      </div>

      <Dashboard
        pings={pings}
        handleAddPing={handleAddPing}
        handleBoroughChange={handleBoroughChange}
        selectedBorough={selectedBorough}
        boroughs={boroughsMapping}
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
        handlePredictionResponse={handlePredictionResponse}
        handlePredict={handlePredict}
        addMessage={addMessage}  // New prop if required

      />

      {/* <ControlPanel
        viewState={viewState}
        handleChange={handleChange}
        handleBoroughChange={handleBoroughChange}
        handleElevationScaleChange={handleElevationScaleChange}
        handleRadiusChange={handleRadiusChange}
        handleAddPing={handleAddPing}
        boroughs={boroughsMapping}
        selectedBorough={selectedBorough}
        elevationScale={elevationScale}
        barRadius={barRadius}
      /> */}
      {(clickedLocation || lastPing) && (
        <SideModal
          centerLocation={lastPing}
          closeModal={closeModal}
          pings={pings}
          roadsGeoJSON={roadsGeoJSON}
          MAP_STYLE={MAP_STYLE}
          prediction={prediction}
          suggestForceDeployment={suggestForceDeployment}
        />
      )}
    </div>
  );
}

export async function renderToDOM(container: HTMLDivElement) {
  const root = createRoot(container);
  // First render with no data so that the app mounts
  root.render(<App />);

  const data = (await load(DATA_URL, CSVLoader)).data;

  const londonBounds = {
    north: 51.686,
    south: 51.286,
    west: -0.51,
    east: 0.334,
  };

  // Parse each row and extract the time-of-day from the Month field.
  // In the example, "2024-09-25-05-39" yields an hour of 5 and minute of 39.
  const points: DataPoint[] = data
    .map((d: any) => {
      if (!Number.isFinite(d["Longitude"]) || !Number.isFinite(d["Latitude"])) {
        return null;
      }
      const monthStr = d["Month"]; // e.g. "2024-09-25-05-39"
      const parts = monthStr.split("-");
      if (parts.length < 5) return null;
      const hour = Number(parts[3]);
      const minute = Number(parts[4]);
      // Express the time as a decimal (e.g. 5.65 for 5:39)
      const time = hour + minute / 60;
      return [d["Longitude"], d["Latitude"], time];
    })
    .filter(
      (d: DataPoint | null): d is DataPoint =>
        d !== null &&
        d[0] >= londonBounds.west &&
        d[0] <= londonBounds.east &&
        d[1] >= londonBounds.south &&
        d[1] <= londonBounds.north
    );

  root.render(<App data={points} />);
}
