class Specie {
  constructor(
    id,
    kingdom_name,
    phylum_name,
    class_name,
    order_name,
    family_name,
    genus_name,
    scientific_name,
    category,
    conservation_measures
  ) {
    this.id = id
    this.kingdom_name = kingdom_name
    this.phylum_name = phylum_name
    this.class_name = class_name
    this.order_name = order_name
    this.family_name = family_name
    this.genus_name = genus_name
    this.scientific_name = scientific_name
    this.category = category
    this.conservation_measures = conservation_measures
  }
}

export default Specie
