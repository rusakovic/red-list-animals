import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'

import './App.css'

const App = () => {
  const REGIONS_API_URL = `http://apiv3.iucnredlist.org/api/v3/region/list?token=${process.env.REACT_APP_RED_LIST_API_TOKEN}`
  console.log(process.env.RED_LIST_API_TOKEN)
  const [randomRegion, setRandomRegion] = useState({
    region: '',
    isFetching: false
  })

  // 1. Load the list of the available regions for species
  const fetchSpeciousRegions = useCallback(async () => {
    try {
      setRandomRegion({
        randomRegion,
        isFetching: true
      })
      const response = await axios.get(REGIONS_API_URL)
      const regionsArray = response.data.results

      // 2. Take a random region from the list
      const selectedRandomRegion =
        regionsArray[Math.floor(Math.random() * regionsArray.length)]
      setRandomRegion({
        region: selectedRandomRegion.identifier,
        isFetching: false
      })
    } catch (error) {
      console.log(error)
      setRandomRegion({
        randomRegion,
        isFetching: false
      })
    }
  }, [])

  useEffect(() => {
    fetchSpeciousRegions()
  }, [])

  return (
    <div className='App'>
      <h3>RANDOM REGION</h3>
      {randomRegion.isFetching ? (
        <h5>Loading...</h5>
      ) : (
        <h5>{randomRegion.region}</h5>
      )}
    </div>
  )
}

export default App
