import { FaCircleChevronLeft, FaCircleChevronRight } from "react-icons/fa6";
import { categories } from "../categories";
import Nav from "./Nav";
import { useRef } from "react";
import { useSelector } from "react-redux";

function UserDashboard() {
  const cateScrollRef = useRef();
  const shopScrollRef = useRef();
  const { city, shopsInMyCity } = useSelector((state) => state.user);

  const [showLeftCateButton, setShowLeftCateButton] = useState(false);
  const [showRightCateButton, setShowRightCateButton] = useState(false);

  const [showLeftShopButton, setShowLeftShopButton] = useState(false);
  const [showRightShopButton, setShowRightShopButton] = useState(false);

  const updateButton = (ref, setLeftButton, setRightButton) => {
    const element = ref.current;
    if (element) {
      setLeftButton(element.scrollLeft > 0);
      setRightButton(
        element.scrollLeft + element.clientWidth < element.scrollWidth,
      );
    }
  };

  const scrollHandler = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction == "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

 useEffect(() => {
   if (cateScrollRef.current) {
     updateButton(
       cateScrollRef,
       setShowLeftCateButton,
       setShowRightCateButton,
     );
     updateButton(
       cateScrollRef,
       setShowLeftShopButton,
       setShowRightShopButton,
     );
     cateScrollRef.current.addEventListener("scroll", () => {
       updateButton(
         cateScrollRef,
         setShowLeftCateButton,
         setShowRightCateButton,
       );
     });
     shopScrollRef.current.addEventListener("scroll", () => { 
        updateButton(
          cateScrollRef,
          setShowLeftShopButton,
          setShowRightShopButton,
        );
     })
   }

   return () =>
     {cateScrollRef.current.removeEventListener("scroll", () => {
       updateButton(
         cateScrollRef,
         setShowLeftCateButton,
         setShowRightCateButton,
       );
     });
     shopScrollRef.current.removeEventListener("scroll", () => {
       updateButton(
         cateScrollRef,
         setShowLeftShopButton,
         setShowRightShopButton,
       );
     })}
 }, []);


  return (
    <div className="w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto">
      <Nav />
      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
        <h1 className="text-gray-800 text-2xl sm:text-3xl">
          Inspiration for your first order
        </h1>
        <div className="w-full">
          {showLeftCateButton && (
            <button
              onClick={scrollHandler(cateScrollRef, "left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10">
              <FaCircleChevronLeft />
            </button>
          )}
          <div
            className="w-full flex overflow-x-auto gap-4 pb-2 "
            ref={cateScrollRef}>
            {categories.map((cate, index) => (
              <CategoryCard name={cate.category} image={cate.image} key={index} />
            ))}
          </div>
          {showRightCateButton && (
            <button
              onClick={scrollHandler(cateScrollRef, "right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10">
              <FaCircleChevronRight />
            </button>
          )}
        </div>
      </div>

      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
        <h1 className="text-gray-800 text-2xl sm:text-3xl">
          Best Shops in {city}
        </h1>
        <div className="w-full">
          {showLeftShopButton && (
            <button
              onClick={scrollHandler(shopScrollRef, "left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10">
              <FaCircleChevronLeft />
            </button>
          )}
          <div
            className="w-full flex overflow-x-auto gap-4 pb-2 "
            ref={shopScrollRef}>
            {shopsInMyCity?.map((cate, index) => (
              <CategoryCard name={shop.name} image={shop.image} key={index} />
            ))}
          </div>
          {showRightShopButton && (
            <button
              onClick={scrollHandler(shopScrollRef, "right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10">
              <FaCircleChevronRight />
            </button>
          )}
        </div>
      </div>

      
    </div>
  );
}

export default UserDashboard;
