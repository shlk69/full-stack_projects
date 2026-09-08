import React from 'react'
import scooter from '../assets/scooter.png'
import home from '../assets/home.png'
import L from 'react-leaflet'

const DeliveryBoyTracking = () => {
 const deliveryBoyIcon = new L.Icon({
   iconUrl: scooter,
   iconSize: [40, 40],
   iconAnchor: [20, 40],
 });
 const customerIcon = new L.Icon({
   iconUrl: home,
   iconSize: [40, 40],
   iconAnchor: [20, 40],
 });

  return (
    <div>DeliveryBoyTracking</div>
  )
}

export default DeliveryBoyTracking