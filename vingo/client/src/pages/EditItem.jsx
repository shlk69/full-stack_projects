 import React, { useEffect, useRef, useState } from "react";
 import { useNavigate, useParams } from "react-router-dom";
 import { IoIosArrowRoundBack } from "react-icons/io";
 import { FaUtensils } from "react-icons/fa";
 import { useDispatch, useSelector } from "react-redux";
 import api from "../api";
 import { setMyShopData } from "../redux/ownerSlice";

 const EditItem = () => {
   const navigate = useNavigate();
   const { myShopData } = useSelector((state) => state.owner);
   const [name, setName] = useState("");
   const [price, setPrice] = useState(0.0);
   const [frontendImage, setFrontendImage] = useState(null);
   const [backendImage, setBackendImage] = useState(null);
   const [category, setCategory] = useState("");
     const [foodType, setFoodType] = useState("Veg");
     const { itemId } = useParams()
     const {currentItem,setCurrentItem} = useState(null)
     
   const categories = [
     "Snacks",
     "Main Course",
     "Desserts",
     "Pizza",
     "Burgers",
     "Sandwiches",
     "South Indian",
     "North Indian",
     "Chinese",
     "Fast Food",
     "Others",
   ];

   const dispatch = useDispatch();

   const handleImage = (e) => {
     const file = e.target.files[0];
     setBackendImage(file);
     setFrontendImage(URL.createObjectURL(file));
   };

   const handleSubmit = async (e) => {
     e.preventDefault();
     try {
       const formData = new FormData();
       formData.append("name", name);
       formData.append("category", category);
       formData.append("foodType", foodType);
       formData.append("price", price);
       if (backendImage) {
         formData.append("image", backendImage);
       }
       const { data } = await api.post(`/item/add-item/${itemId}`, formData, {
         withCredentials: true,
       });
       dispatch(setMyShopData(data));
     } catch (error) {}
     };
     
     useEffect(() => {
         const handleGetItemById = async () => {
           try {
             const result = await api.get(
               `item/get-by-id/${itemId}`,
               { withCredentials: true },
             );
             setCurrentItem(result.data);
           } catch (error) {
               console.log(error);
               
           }
         };
         handleGetItemById();

     }, [itemId])
     

     useEffect(() => {
       setName(currentItem?.name || "");
       setPrice(currentItem?.price || 0);
       setCategory(currentItem?.category || "");
       setFoodType(currentItem?.foodType || "");
       setFrontendImage(currentItem?.image || null);
     }, [currentItem]);




   return (
     <div className="flex justify-center flex-col items-center p-6 bg-gradient-to-br from-orange-50 relative to-white min-h-screen">
       <div
         className="absolute top-[20px] left-[20px] z-[10] mb-[10px]"
         onClick={() => navigate("/")}>
         <IoIosArrowRoundBack size={35} className="text-[#ff4d2d]" />
       </div>

       <div className="max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100">
         <div className="flex flex-col items-center mb-6">
           <div className="bg-orange-100 p-4 rounded-full mb-4">
             <FaUtensils className="text-[#ff4d2d] w-16 h-16" />
           </div>
           <div className="text-3xl font-extrabold text-gray-900">
             Edit Food Item
           </div>
         </div>

         <form onSubmit={handleSubmit} className="space-y-5">
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">
               Name
             </label>
             <input
               onChange={(e) => setName(e.target.value)}
               value={name}
               type="text"
               placeholder="Enter Shop Name"
               className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">
               Food Image
             </label>
             <input
               onChange={handleImage}
               type="file"
               accept="image/*"
               className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
             />

             {frontendImage && (
               <div className="mt-4">
                 <img
                   src={frontendImage}
                   alt=""
                   className="w-full h-48 object-cover rounded-lg border"
                 />
               </div>
             )}
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">
               Price
             </label>
             <input
               onChange={(e) => setPrice(e.target.value)}
               value={price}
               type="number"
               placeholder="Enter Food Price"
               className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
             />
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">
               Select Category
             </label>
             <select
               onChange={(e) => setCategory(e.target.value)}
               value={category}
               className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
               <option value="">select Category</option>
               {categories.map((cate, index) => (
                 <option value={cate} key={index}>
                   {cate}
                 </option>
               ))}
             </select>
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">
               Select Food Type
             </label>
             <select
               onChange={(e) => setFoodType(e.target.value)}
               value={foodType}
               className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
               <option value="">select Category</option>
               <option value={"veg"}>Veg </option>
               <option value={"nonVeg"}>Non Veg </option>
             </select>
           </div>

           <button className="w-full bg-[#ff4d2d] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-orange-600 hover:shadow-lg transition-all duration-200 cursor-pointer">
             Save
           </button>
         </form>
       </div>
     </div>
   );
 };

 export default EditItem;
