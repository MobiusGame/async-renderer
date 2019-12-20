var Jimp = require('jimp');

function render(contract, layout, currentImage, layerIndex, callback) {
	if (layerIndex >= layout.layers.length) {		
		callback(currentImage)
		return		
	}

	var baseLayerImage = null;

	// TODO sort layers by z_order
	var layer = layout.layers[layerIndex]

	var layerType = layer.type;

	if (layerType === "dynamic") {
		layer = layer.options[layer.index]
	}

	Jimp.read(layer.uri, (err, layerImage) => {
		if (err) throw err;			

		OnImageRead(contract, currentImage, layout, layer, layerImage, layerIndex, callback);
	})	
}

async function OnImageRead(contract, currentImage, layout, layer, layerImage, layerIndex, callback) {
	if (currentImage !== null) {
		var x = layer.x;
		var y = layer.y;			

		if (typeof x === "object") {
			var controlToken = await contract.controlTokens(layer.x.token)
			
			x = parseInt(controlToken.currentValue.toString())
			console.log(x)
		}

		if (typeof y === "object") {
			var controlToken = await contract.controlTokens(layer.y.token)

			y = parseInt(controlToken.currentValue.toString())
			console.log(y)
		}

		currentImage.composite(layerImage, x, y);

		render(contract, layout, currentImage, layerIndex + 1, callback)
	} else {
		render(contract, layout, layerImage, layerIndex + 1, callback)
	}
}

exports.render = render