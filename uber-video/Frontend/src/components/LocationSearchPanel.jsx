const LocationSearchPanel = ({
  suggestions = [],
  setPickup,
  setDestination,
  activeField,
}) => {
  const handleSuggestionClick = (suggestion) => {
    if (activeField === "pickup") {
      setPickup(suggestion);
    } else if (activeField === "destination") {
      setDestination(suggestion);
    }
  };

  return (
    <div className="w-full max-w-full">
      {suggestions.map((suggestion) => (
        <div
          key={suggestion.place_id}
          onClick={() => handleSuggestionClick(suggestion.description)}
          className="flex w-full min-w-0 items-center gap-3 sm:gap-4
          border-2 border-gray-100 hover:border-gray-300
          active:border-black rounded-xl p-3 my-2
          cursor-pointer transition-colors"
        >
          {/* Location Icon */}
          <div className="bg-gray-100 h-10 w-10 sm:h-12 sm:w-12
          rounded-full flex items-center justify-center shrink-0">
            <i className="ri-map-pin-fill text-lg sm:text-xl"></i>
          </div>

          {/* Location Name */}
          <h4 className="font-medium text-sm sm:text-base
          flex-1 min-w-0 break-words">
            {suggestion.description}
          </h4>
        </div>
      ))}
    </div>
  );
};

export default LocationSearchPanel; 
