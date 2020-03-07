import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'

import './App.css'
import Specie from './models/specie'

const App = () => {
  const [randomRegion, setRandomRegion] = useState({
    region: null,
    isFetching: false
  })

  const [
    criticallyEndangeredSpecies,
    setCriticallyEndangeredSpecies
  ] = useState({
    species: [],
    isFetching: false
  })

  const [allSpeciesOfRegion, setAllSpeciesOfRegion] = useState([])

  const REGIONS_API_URL = `http://apiv3.iucnredlist.org/api/v3/region/list?token=${process.env.REACT_APP_RED_LIST_API_TOKEN}`
  // console.log(process.env.RED_LIST_API_TOKEN)
  const SPECIES_BY_REGION = `http://apiv3.iucnredlist.org/api/v3/species/region/${randomRegion.region}/page/0?token=${process.env.REACT_APP_RED_LIST_API_TOKEN}`

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
  }, [randomRegion, REGIONS_API_URL])

  useEffect(() => {
    fetchSpeciousRegions()
  }, [])

  // 3.Load the list of all species in the selected region
  const fetchSpeciesFromSelectedRegion = useCallback(async () => {
    // prevent fetching if there is random region is not selected
    if (randomRegion.region?.length ?? '' > 0) {
      try {
        setCriticallyEndangeredSpecies(prevState => {
          return {
            ...prevState,
            isFetching: true
          }
        })
        const response = await axios.get(SPECIES_BY_REGION)
        console.log(response)

        // 4. Create a model for “Species” and map the results to an array of Species.
        const speciesArray = response.data.result.map(specie => {
          const newSpecie = new Specie(
            specie.taxonid,
            specie.kingdom_name,
            specie.phylum_name,
            specie.class_name,
            specie.order_name,
            specie.family_name,
            specie.genus_name,
            specie.scientific_name,
            specie.category
          )
          return newSpecie
        })

        setAllSpeciesOfRegion(speciesArray)

        // 5. Filter the results for Critically Endangered species
        const criticallyEndangeredSpecies = speciesArray.filter(
          specie => specie.category === 'CR'
        )
        setCriticallyEndangeredSpecies({
          species: criticallyEndangeredSpecies,
          isFetching: false
        })
        console.log(criticallyEndangeredSpecies)
      } catch (error) {
        console.log(error)
        setCriticallyEndangeredSpecies(prevState => {
          return {
            ...prevState,
            isFetching: false
          }
        })
      }
    }
  }, [randomRegion.region])

  useEffect(() => {
    fetchSpeciesFromSelectedRegion()
  }, [fetchSpeciesFromSelectedRegion])

  // 5.1 Fetch the conservation measures for all critically endangered species
  const fetchConservationMeasures = useCallback(async () => {
    console.log('fetchConservationMeasures is called')
    if (criticallyEndangeredSpecies.species.length > 0) {
      const speciesWithMeasures = await Promise.all(
        criticallyEndangeredSpecies.species.map(async specie => {
          const dynamicApiLink = `http://apiv3.iucnredlist.org/api/v3/measures/species/id/${specie.id}/region/${randomRegion.region}?token=${process.env.REACT_APP_RED_LIST_API_TOKEN}`
          const result = await axios.get(dynamicApiLink)
          console.log(result)
          // 5.2. Store the “title”-s of the response in the Species model as concatenated text property.
          const allMeasuresTitles = result.data.result
            .map(measure => measure.title)
            .join('; ')
          console.log(allMeasuresTitles)
          return {
            ...specie,
            conservation_measures: allMeasuresTitles
          }
        })
      )
      console.log(speciesWithMeasures)
      setCriticallyEndangeredSpecies({
        species: speciesWithMeasures,
        isFetching: false
      })
    }
  }, [criticallyEndangeredSpecies.isFetching])

  useEffect(() => {
    fetchConservationMeasures()
  }, [fetchConservationMeasures])

  // 6. Filter the results (from step 4) for the mammal class
  const fetchMammalClass = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://apiv3.iucnredlist.org/api/v3/comp-group/getspecies/mammals?token=${process.env.REACT_APP_RED_LIST_API_TOKEN}`
      )
      console.log('fetchMammalClass', response)
      const allMammalID = response.data.result.map(mammal => mammal.taxonid)
      console.log('allMammalID', allMammalID)
      console.log('allSpeciesOfRegion', allSpeciesOfRegion)
      const onlyMammalSpeciesOfRegion = allSpeciesOfRegion.filter(specie => {
        return allMammalID.includes(specie.id)
      })
      console.log('onlyMammalSpeciesOfRegion', onlyMammalSpeciesOfRegion)
    } catch (error) {
      console.log(error)
    }
  }, [allSpeciesOfRegion])

  useEffect(() => {
    fetchMammalClass()
  }, [fetchMammalClass])

  return (
    <div className='App'>
      <h3>RANDOM REGION</h3>
      {randomRegion.isFetching ? (
        <h5>Loading...</h5>
      ) : (
        <h5>{randomRegion.region}</h5>
      )}
      <h3>Critically Endangered species</h3>
      {criticallyEndangeredSpecies.species.map(specie => {
        return <h5 key={specie.id}>{specie.scientific_name}</h5>
      })}
    </div>
  )
}

export default App
