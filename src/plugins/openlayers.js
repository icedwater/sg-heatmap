export default function supportOpenLayers (heatmap) {
  function initializeRenderer (defaultStyle = new window.ol.style.Style(), addonStyle) {
    if (!window) throw new Error('Method initializeRenderer should only be called browser-side')
    if (!window.ol) throw new Error('OpenLayers not loaded')

    const featureCollection = {
      type: 'FeatureCollection',
      features: this.children.map(c => ({
        id: c.id,
        type: 'Feature',
        geometry: c.geometry,
        properties: Object.assign({color: null}, c.properties)
      }))
    }
    const vectorSource = new window.ol.source.Vector({
      features: (new window.ol.format.GeoJSON())
        .readFeatures(featureCollection, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        })
    })

    const styleFunction = feature => {
      const color = feature.get('color')
      const style = [defaultStyle]
      if (color) {
        if (addonStyle) style.push(addonStyle)
        style.push(new window.ol.style.Style({fill: new window.ol.style.Fill({color})}))
      }
      return style
    }

    if ('renderer' in this) {
      console.log('Existing renderer replaced')
      this.renderer.setVisible(false)
      this.renderer.setSource(vectorSource)
      this.renderer.setStyle(styleFunction)
      this.renderer.setVisible(true)
    } else {
      this.renderer = new window.ol.layer.Vector({
        source: vectorSource,
        style: styleFunction
      })
    }

    return this.renderer
  }

  function render (stat, colorScale) {
    if (!this.renderer) throw new Error('Renderer has not been initialized')

    const {values: statValues, unchanged} = this.getStat(stat)
    Object.keys(statValues).forEach(key => {
      const color = colorScale(statValues[key])
      this.renderer.getSource().getFeatureById(key).set('color', color)
    })
    unchanged.forEach(key => {
      this.renderer.getSource().getFeatureById(key).set('color', null)
    })
  }

  heatmap.initializeRenderer = initializeRenderer.bind(heatmap)
  heatmap.render = render.bind(heatmap)
}
