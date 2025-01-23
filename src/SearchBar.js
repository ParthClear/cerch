import React, { useState, useEffect, useRef } from "react";
import fuzzysort from "fuzzysort"; // Import fuzzysort
import data from "./data"; // Import your JSON data
import "./index.css"; // Import the CSS file
import { FaSearch } from "react-icons/fa"; // Import the search icon

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [focusedIndex, setFocusedIndex] = useState(-1); // Track the focused result index
  const [usedSearches, setUsedSearches] = useState([]); // Track used searches
  const inputRef = useRef(null); // Ref for the input element
  const resultsRef = useRef(null); // Ref for the results container

  // Convert the JSON data into an array of { key, value } objects
  const dataArray = Object.entries(data).map(([key, value]) => ({
    key,
    value,
  }));

  // Load used searches from localStorage on component mount
  useEffect(() => {
    const storedUsedSearches =
      JSON.parse(localStorage.getItem("usedSearches")) || [];
    setUsedSearches(storedUsedSearches);
  }, []);

  // Save used searches to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("usedSearches", JSON.stringify(usedSearches));
  }, [usedSearches]);

  // Handle search input changes
  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    setFocusedIndex(-1); // Reset focused index when the query changes

    if (query === "") {
      setFilteredData([]);
    } else {
      // Perform fuzzy search using fuzzysort
      const results = fuzzysort.go(query, dataArray, {
        key: "key", // Search only in the "key" field
        threshold: -10000, // Adjust the threshold for fuzzy matching
      });

      // Extract the original items from the results
      const filteredResults = results.map((result) => result.obj);
      setFilteredData(filteredResults);

      // Automatically open the URL if there's only one result
      if (filteredResults.length === 1) {
        handleLinkClick(filteredResults[0]);
      }
    }
  };

  // Handle link clicks and update used searches
  const handleLinkClick = (item) => {
    // Open the link in a new tab
    window.open(item.value, "_blank");

    // Update used searches
    const updatedUsedSearches = usedSearches.filter(
      (search) => search.key !== item.key
    );
    updatedUsedSearches.unshift(item);
    setUsedSearches(updatedUsedSearches.slice(0, 10)); // Keep only the top 10
  };

  // Handle keydown events for Tab, Enter, and Arrow keys
  const handleKeyDown = (event) => {
    const results = searchQuery ? filteredData : usedSearches;

    if (event.key === "Tab" && results.length > 0) {
      event.preventDefault(); // Prevent default Tab behavior
      const nextIndex = (focusedIndex + 1) % results.length; // Cycle through results
      setFocusedIndex(nextIndex);
    } else if (event.key === "ArrowDown" && results.length > 0) {
      event.preventDefault(); // Prevent default ArrowDown behavior
      const nextIndex = (focusedIndex + 1) % results.length; // Move to the next result
      setFocusedIndex(nextIndex);
    } else if (event.key === "ArrowUp" && results.length > 0) {
      event.preventDefault(); // Prevent default ArrowUp behavior
      const prevIndex = (focusedIndex - 1 + results.length) % results.length; // Move to the previous result
      setFocusedIndex(prevIndex);
    } else if (event.key === "Enter") {
      if (results.length > 0) {
        // Open the focused result or the first result if none is focused
        const indexToOpen = focusedIndex >= 0 ? focusedIndex : 0;
        const itemToOpen = results[indexToOpen];
        handleLinkClick(itemToOpen);
      }
    }
  };

  // Autofocus the input on page load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Add keyboard shortcut (Ctrl/Cmd + K) to focus on the search bar
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault(); // Prevent default browser behavior
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    };

    // Add event listener for keydown
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="search-container">
      <div className="search-box">
        <button className="btn-search">
          <FaSearch />
        </button>
        <input
          type="text"
          className="input-search"
          placeholder="Type to Search... (Ctrl/Cmd + K)"
          value={searchQuery}
          onChange={handleSearch}
          onKeyDown={handleKeyDown} // Handle keydown events
          ref={inputRef} // Attach the ref to the input element
        />
      </div>
      {searchQuery ? (
        <div className="results-container" ref={resultsRef}>
          {filteredData.length > 0 ? (
            filteredData.map((item, index) => (
              <div
                key={index}
                className={`result-item ${
                  index === focusedIndex ? "focused" : ""
                }`} // Highlight focused result
                onClick={() => handleLinkClick(item)} // Open URL on click
              >
                <a href={item.value} target="_blank" rel="noopener noreferrer">
                  {item.key}
                </a>
              </div>
            ))
          ) : (
            <div className="no-results">No results found.</div>
          )}
        </div>
      ) : (
        usedSearches.length > 0 && (
          <div className="results-container">
            <div className="used-searches-header">Most Used Searches</div>
            {usedSearches.map((item, index) => (
              <div
                key={index}
                className={`result-item ${
                  index === focusedIndex ? "focused" : ""
                }`} // Highlight focused result
                onClick={() => handleLinkClick(item)} // Open URL on click
              >
                <a href={item.value} target="_blank" rel="noopener noreferrer">
                  {item.key}
                </a>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default SearchBar;
