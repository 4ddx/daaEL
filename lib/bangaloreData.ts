import type { Node, Edge, Graph } from "@/types/graph"

// Comprehensive Bangalore locations with real coordinates
export const bangaloreNodes: Node[] = [
  // Central Bangalore
  { id: "mg_road", name: "MG Road", coordinates: [12.9716, 77.5946], type: "commercial" },
  { id: "brigade_road", name: "Brigade Road", coordinates: [12.9716, 77.6033], type: "commercial" },
  { id: "cubbon_park", name: "Cubbon Park", coordinates: [12.9762, 77.5993], type: "landmark" },
  { id: "vidhana_soudha", name: "Vidhana Soudha", coordinates: [12.9794, 77.5912], type: "landmark" },
  { id: "city_railway", name: "Bangalore City Railway Station", coordinates: [12.9775, 77.5718], type: "intersection" },

  // North Bangalore
  { id: "hebbal", name: "Hebbal", coordinates: [13.0358, 77.597], type: "intersection" },
  { id: "yelahanka", name: "Yelahanka", coordinates: [13.1007, 77.5963], type: "residential" },
  { id: "airport", name: "Kempegowda International Airport", coordinates: [13.1986, 77.7066], type: "landmark" },
  { id: "manyata_tech", name: "Manyata Tech Park", coordinates: [13.0475, 77.6197], type: "commercial" },

  // South Bangalore
  { id: "koramangala", name: "Koramangala", coordinates: [12.9279, 77.6271], type: "commercial" },
  { id: "btm_layout", name: "BTM Layout", coordinates: [12.9165, 77.6101], type: "residential" },
  { id: "jayanagar", name: "Jayanagar", coordinates: [12.9237, 77.5838], type: "residential" },
  { id: "bannerghatta", name: "Bannerghatta Road", coordinates: [12.8988, 77.5951], type: "intersection" },
  { id: "electronic_city", name: "Electronic City", coordinates: [12.844, 77.6619], type: "commercial" },

  // East Bangalore
  { id: "whitefield", name: "Whitefield", coordinates: [12.9698, 77.75], type: "commercial" },
  { id: "marathahalli", name: "Marathahalli", coordinates: [12.9591, 77.6974], type: "intersection" },
  { id: "kundalahalli", name: "Kundalahalli", coordinates: [12.9611, 77.7394], type: "residential" },
  { id: "itpl", name: "ITPL (International Tech Park)", coordinates: [12.985, 77.7414], type: "commercial" },

  // West Bangalore
  { id: "rajajinagar", name: "Rajajinagar", coordinates: [12.9991, 77.5554], type: "residential" },
  { id: "malleswaram", name: "Malleswaram", coordinates: [13.0031, 77.5747], type: "residential" },
  { id: "peenya", name: "Peenya Industrial Area", coordinates: [13.0283, 77.5209], type: "commercial" },
  { id: "yeshwantpur", name: "Yeshwantpur", coordinates: [13.0284, 77.554], type: "intersection" },

  // Outer Ring Road
  { id: "silk_board", name: "Silk Board", coordinates: [12.9176, 77.6227], type: "intersection" },
  { id: "sarjapur", name: "Sarjapur Road", coordinates: [12.901, 77.6874], type: "intersection" },
  { id: "bellandur", name: "Bellandur", coordinates: [12.9259, 77.6815], type: "residential" },
  { id: "hsr_layout", name: "HSR Layout", coordinates: [12.9082, 77.6476], type: "residential" },

  // Tech Hubs
  { id: "bagmane_tech", name: "Bagmane Tech Park", coordinates: [12.9698, 77.75], type: "commercial" },
  { id: "cessna_business", name: "Cessna Business Park", coordinates: [12.901, 77.639], type: "commercial" },
  { id: "prestige_tech", name: "Prestige Tech Park", coordinates: [12.9259, 77.6815], type: "commercial" },
]

// Realistic Bangalore road connections with traffic considerations
export const bangaloreEdges: Edge[] = [
  // Central connections
  {
    id: "mg_brigade",
    from: "mg_road",
    to: "brigade_road",
    distance: 1.2,
    baseWeight: 3,
    currentWeight: 4,
    trafficLevel: "light",
    roadType: "arterial",
    speedLimit: 40,
    lanes: 4,
  },
  {
    id: "mg_cubbon",
    from: "mg_road",
    to: "cubbon_park",
    distance: 0.8,
    baseWeight: 2,
    currentWeight: 2,
    trafficLevel: "free",
    roadType: "local",
    speedLimit: 30,
    lanes: 2,
  },
  {
    id: "cubbon_vidhana",
    from: "cubbon_park",
    to: "vidhana_soudha",
    distance: 1.0,
    baseWeight: 2,
    currentWeight: 3,
    trafficLevel: "light",
    roadType: "local",
    speedLimit: 30,
    lanes: 2,
  },
  {
    id: "mg_railway",
    from: "mg_road",
    to: "city_railway",
    distance: 2.5,
    baseWeight: 6,
    currentWeight: 8,
    trafficLevel: "moderate",
    roadType: "arterial",
    speedLimit: 40,
    lanes: 4,
  },

  // North Bangalore connections
  {
    id: "railway_hebbal",
    from: "city_railway",
    to: "hebbal",
    distance: 8.5,
    baseWeight: 15,
    currentWeight: 20,
    trafficLevel: "heavy",
    roadType: "highway",
    speedLimit: 60,
    lanes: 6,
  },
  {
    id: "hebbal_yelahanka",
    from: "hebbal",
    to: "yelahanka",
    distance: 6.2,
    baseWeight: 12,
    currentWeight: 15,
    trafficLevel: "moderate",
    roadType: "highway",
    speedLimit: 60,
    lanes: 4,
  },
  {
    id: "yelahanka_airport",
    from: "yelahanka",
    to: "airport",
    distance: 12.8,
    baseWeight: 20,
    currentWeight: 22,
    trafficLevel: "light",
    roadType: "highway",
    speedLimit: 80,
    lanes: 6,
  },
  {
    id: "hebbal_manyata",
    from: "hebbal",
    to: "manyata_tech",
    distance: 3.5,
    baseWeight: 8,
    currentWeight: 12,
    trafficLevel: "heavy",
    roadType: "arterial",
    speedLimit: 50,
    lanes: 4,
  },

  // South Bangalore connections
  {
    id: "mg_koramangala",
    from: "mg_road",
    to: "koramangala",
    distance: 4.2,
    baseWeight: 10,
    currentWeight: 15,
    trafficLevel: "heavy",
    roadType: "arterial",
    speedLimit: 40,
    lanes: 4,
  },
  {
    id: "koramangala_btm",
    from: "koramangala",
    to: "btm_layout",
    distance: 2.8,
    baseWeight: 7,
    currentWeight: 10,
    trafficLevel: "moderate",
    roadType: "arterial",
    speedLimit: 40,
    lanes: 4,
  },
  {
    id: "btm_jayanagar",
    from: "btm_layout",
    to: "jayanagar",
    distance: 3.1,
    baseWeight: 8,
    currentWeight: 9,
    trafficLevel: "light",
    roadType: "arterial",
    speedLimit: 40,
    lanes: 4,
  },
  {
    id: "jayanagar_bannerghatta",
    from: "jayanagar",
    to: "bannerghatta",
    distance: 4.5,
    baseWeight: 10,
    currentWeight: 12,
    trafficLevel: "moderate",
    roadType: "arterial",
    speedLimit: 50,
    lanes: 4,
  },
  {
    id: "bannerghatta_electronic",
    from: "bannerghatta",
    to: "electronic_city",
    distance: 8.7,
    baseWeight: 18,
    currentWeight: 25,
    trafficLevel: "heavy",
    roadType: "highway",
    speedLimit: 60,
    lanes: 6,
  },

  // East Bangalore connections
  {
    id: "koramangala_marathahalli",
    from: "koramangala",
    to: "marathahalli",
    distance: 6.8,
    baseWeight: 15,
    currentWeight: 22,
    trafficLevel: "heavy",
    roadType: "arterial",
    speedLimit: 50,
    lanes: 4,
  },
  {
    id: "marathahalli_whitefield",
    from: "marathahalli",
    to: "whitefield",
    distance: 8.2,
    baseWeight: 18,
    currentWeight: 20,
    trafficLevel: "moderate",
    roadType: "highway",
    speedLimit: 60,
    lanes: 6,
  },
  {
    id: "whitefield_kundalahalli",
    from: "whitefield",
    to: "kundalahalli",
    distance: 2.1,
    baseWeight: 5,
    currentWeight: 6,
    trafficLevel: "light",
    roadType: "arterial",
    speedLimit: 40,
    lanes: 4,
  },
  {
    id: "whitefield_itpl",
    from: "whitefield",
    to: "itpl",
    distance: 3.2,
    baseWeight: 7,
    currentWeight: 8,
    trafficLevel: "light",
    roadType: "arterial",
    speedLimit: 40,
    lanes: 4,
  },

  // West Bangalore connections
  {
    id: "railway_rajajinagar",
    from: "city_railway",
    to: "rajajinagar",
    distance: 3.8,
    baseWeight: 9,
    currentWeight: 12,
    trafficLevel: "moderate",
    roadType: "arterial",
    speedLimit: 40,
    lanes: 4,
  },
  {
    id: "rajajinagar_malleswaram",
    from: "rajajinagar",
    to: "malleswaram",
    distance: 2.2,
    baseWeight: 5,
    currentWeight: 6,
    trafficLevel: "light",
    roadType: "local",
    speedLimit: 30,
    lanes: 2,
  },
  {
    id: "rajajinagar_peenya",
    from: "rajajinagar",
    to: "peenya",
    distance: 4.5,
    baseWeight: 10,
    currentWeight: 13,
    trafficLevel: "moderate",
    roadType: "arterial",
    speedLimit: 50,
    lanes: 4,
  },
  {
    id: "peenya_yeshwantpur",
    from: "peenya",
    to: "yeshwantpur",
    distance: 2.8,
    baseWeight: 6,
    currentWeight: 8,
    trafficLevel: "moderate",
    roadType: "arterial",
    speedLimit: 40,
    lanes: 4,
  },

  // Outer Ring Road connections
  {
    id: "koramangala_silk",
    from: "koramangala",
    to: "silk_board",
    distance: 2.5,
    baseWeight: 6,
    currentWeight: 10,
    trafficLevel: "heavy",
    roadType: "arterial",
    speedLimit: 50,
    lanes: 6,
  },
  {
    id: "silk_sarjapur",
    from: "silk_board",
    to: "sarjapur",
    distance: 5.2,
    baseWeight: 12,
    currentWeight: 18,
    trafficLevel: "heavy",
    roadType: "highway",
    speedLimit: 60,
    lanes: 6,
  },
  {
    id: "sarjapur_bellandur",
    from: "sarjapur",
    to: "bellandur",
    distance: 3.8,
    baseWeight: 8,
    currentWeight: 12,
    trafficLevel: "moderate",
    roadType: "arterial",
    speedLimit: 50,
    lanes: 4,
  },
  {
    id: "bellandur_marathahalli",
    from: "bellandur",
    to: "marathahalli",
    distance: 4.2,
    baseWeight: 10,
    currentWeight: 15,
    trafficLevel: "heavy",
    roadType: "arterial",
    speedLimit: 50,
    lanes: 4,
  },
  {
    id: "silk_hsr",
    from: "silk_board",
    to: "hsr_layout",
    distance: 3.1,
    baseWeight: 7,
    currentWeight: 9,
    trafficLevel: "light",
    roadType: "arterial",
    speedLimit: 40,
    lanes: 4,
  },

  // Tech park connections
  {
    id: "whitefield_bagmane",
    from: "whitefield",
    to: "bagmane_tech",
    distance: 1.5,
    baseWeight: 3,
    currentWeight: 4,
    trafficLevel: "light",
    roadType: "local",
    speedLimit: 30,
    lanes: 2,
  },
  {
    id: "sarjapur_cessna",
    from: "sarjapur",
    to: "cessna_business",
    distance: 2.8,
    baseWeight: 6,
    currentWeight: 8,
    trafficLevel: "moderate",
    roadType: "arterial",
    speedLimit: 40,
    lanes: 4,
  },
  {
    id: "bellandur_prestige",
    from: "bellandur",
    to: "prestige_tech",
    distance: 1.2,
    baseWeight: 3,
    currentWeight: 4,
    trafficLevel: "light",
    roadType: "local",
    speedLimit: 30,
    lanes: 2,
  },

  // Additional cross-connections for better routing
  {
    id: "hebbal_rajajinagar",
    from: "hebbal",
    to: "rajajinagar",
    distance: 7.5,
    baseWeight: 16,
    currentWeight: 20,
    trafficLevel: "moderate",
    roadType: "arterial",
    speedLimit: 50,
    lanes: 4,
  },
  {
    id: "electronic_hsr",
    from: "electronic_city",
    to: "hsr_layout",
    distance: 6.8,
    baseWeight: 15,
    currentWeight: 18,
    trafficLevel: "moderate",
    roadType: "arterial",
    speedLimit: 50,
    lanes: 4,
  },
  {
    id: "yeshwantpur_hebbal",
    from: "yeshwantpur",
    to: "hebbal",
    distance: 4.2,
    baseWeight: 9,
    currentWeight: 12,
    trafficLevel: "moderate",
    roadType: "arterial",
    speedLimit: 50,
    lanes: 4,
  },
]

// Create the Bangalore graph
export const createBangaloreGraph = (): Graph => {
  const nodes = new Map<string, Node>()
  const edges = new Map<string, Edge>()
  const adjacencyList = new Map<string, string[]>()

  // Add nodes
  bangaloreNodes.forEach((node) => {
    nodes.set(node.id, node)
    adjacencyList.set(node.id, [])
  })

  // Add edges and build adjacency list
  bangaloreEdges.forEach((edge) => {
    edges.set(edge.id, edge)

    // Add bidirectional connections
    const fromNeighbors = adjacencyList.get(edge.from) || []
    const toNeighbors = adjacencyList.get(edge.to) || []

    if (!fromNeighbors.includes(edge.to)) {
      fromNeighbors.push(edge.to)
    }
    if (!toNeighbors.includes(edge.from)) {
      toNeighbors.push(edge.from)
    }

    adjacencyList.set(edge.from, fromNeighbors)
    adjacencyList.set(edge.to, toNeighbors)
  })

  return { nodes, edges, adjacencyList }
}

// Popular Bangalore places for search suggestions
export const bangalorePlaces = [
  {
    id: "mg_road",
    name: "MG Road",
    category: "Shopping & Commercial",
    description: "Premier shopping and business district",
  },
  { id: "koramangala", name: "Koramangala", category: "Tech Hub", description: "Startup and tech company hub" },
  { id: "whitefield", name: "Whitefield", category: "IT Corridor", description: "Major IT and tech park area" },
  { id: "electronic_city", name: "Electronic City", category: "IT Hub", description: "Large IT and electronics hub" },
  { id: "airport", name: "Kempegowda Airport", category: "Transportation", description: "International airport" },
  { id: "cubbon_park", name: "Cubbon Park", category: "Recreation", description: "Large urban park in city center" },
  { id: "vidhana_soudha", name: "Vidhana Soudha", category: "Government", description: "State legislature building" },
  { id: "jayanagar", name: "Jayanagar", category: "Residential", description: "Well-planned residential area" },
  {
    id: "malleswaram",
    name: "Malleswaram",
    category: "Traditional",
    description: "Traditional Bangalore neighborhood",
  },
  { id: "hebbal", name: "Hebbal", category: "Transportation Hub", description: "Major traffic intersection" },
]
