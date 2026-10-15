const logger = require('../logger');
const axios = require('axios');
const captainModel = require('../models/captain.model');
const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;


module.exports.getAddressCoordinate = async (address) => {
    if (!address?.trim()) {
        throw new Error("Address is required");
    }

    const { data } = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            address
        )}.json`,
        {
            params: {
                access_token: MAPBOX_TOKEN,
                limit: 1,
            },
            timeout: 10000,
        }
    );

    const place = data.features?.[0];

    if (!place) {
        throw new Error("Location not found");
    }

    const [longitude, latitude] = place.center;

    return {
        address: place.place_name,
        latitude,
        longitude,
    };
};

module.exports.getDistanceTime = async (origin, destination) => {
    const { longitude: lng1, latitude: lat1 } = origin;
    const { longitude: lng2, latitude: lat2 } = destination;

    const coordinates = [lng1, lat1, lng2, lat2];

    if (
        !coordinates.every(Number.isFinite) ||
        Math.abs(lat1) > 90 ||
        Math.abs(lat2) > 90 ||
        Math.abs(lng1) > 180 ||
        Math.abs(lng2) > 180
    ) {
        throw new Error("Valid coordinates are required");
    }

    const { data } = await axios.get(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${lng1},${lat1};${lng2},${lat2}`,
        {
            params: {
                access_token: MAPBOX_TOKEN,
                overview: "full",
                geometries: "geojson",
            },
            timeout: 10000,
        }
    );

    const route = data.routes?.[0];

    if (!route) {
        throw new Error("No driving route found");
    }

    return {
        distanceKm: Number((route.distance / 1000).toFixed(2)),
        durationMinutes: Math.ceil(route.duration / 60),
        geometry: route.geometry,
    };
};

module.exports.getAutoCompleteSuggestions = async (input) => {
    if (!input) {
        throw new Error("query is required");
    }

    const apiKey = process.env.MAPBOX_ACCESS_TOKEN;

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        input
    )}.json`;

    try {
        const response = await axios.get(url, {
            params: {
                access_token: apiKey,
                autocomplete: true,
                limit: 5,
                country: "IN",
            },
        });

        if (response.status === 200) {
            return response.data.features.map((place) => ({
                description: place.place_name,
                place_id: place.id,
                coordinates: {
                    latitude: place.center[1],
                    longitude: place.center[0],
                },
            }));
        }

        throw new Error("Unable to fetch suggestions");
    } catch (err) {
        logger.error('map_suggestions_failed', err);
        throw err;
    }
};


module.exports.getCaptainsInTheArea = async (latitude, longitude, radiusKm) => {
    if (![latitude, longitude, radiusKm].every(Number.isFinite) ||
        Math.abs(latitude) > 90 ||
        Math.abs(longitude) > 180 ||
        radiusKm <= 0) {
        throw new Error('Valid coordinates and search radius are required');
    }

    const latitudeDelta = radiusKm / 111;
    const longitudeDelta = radiusKm / (111 * Math.cos(latitude * Math.PI / 180));
    const candidates = await captainModel.find({
        status: 'active',
        socketId: { $exists: true, $ne: null },
        'location.ltd': {
            $gte: latitude - latitudeDelta,
            $lte: latitude + latitudeDelta,
        },
        'location.lng': {
            $gte: longitude - longitudeDelta,
            $lte: longitude + longitudeDelta,
        },
    });

    return candidates.filter((captain) => {
        const distanceKm = module.exports.getDistanceInKm(
            { latitude: captain.location?.ltd, longitude: captain.location?.lng },
            { latitude, longitude },
        );
        return distanceKm !== null && distanceKm <= radiusKm;
    });
};

module.exports.getDistanceInKm = (origin, destination) => {
    const { latitude: originLatitude, longitude: originLongitude } = origin || {};
    const { latitude: destinationLatitude, longitude: destinationLongitude } =
        destination || {};

    if (
        ![originLatitude, originLongitude, destinationLatitude, destinationLongitude]
            .every(Number.isFinite) ||
        Math.abs(originLatitude) > 90 ||
        Math.abs(destinationLatitude) > 90 ||
        Math.abs(originLongitude) > 180 ||
        Math.abs(destinationLongitude) > 180
    ) {
        return null;
    }

    const radians = (degrees) => degrees * Math.PI / 180;
    const latitudeDifference = radians(destinationLatitude - originLatitude);
    const longitudeDifference = radians(destinationLongitude - originLongitude);
    const haversine =
        Math.sin(latitudeDifference / 2) ** 2 +
        Math.cos(radians(originLatitude)) *
        Math.cos(radians(destinationLatitude)) *
        Math.sin(longitudeDifference / 2) ** 2;

    return 6371 * 2 * Math.atan2(
        Math.sqrt(haversine),
        Math.sqrt(1 - haversine),
    );
};

module.exports.getOnlineCaptains = async () => captainModel.find({
    status: 'active',
    socketId: { $exists: true, $ne: null },
});
